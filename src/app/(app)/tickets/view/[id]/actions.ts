
'use server';

import { revalidatePath } from 'next/cache';
import {
  createNotification,
  getTicketById,
  updateTicket,
  deleteTicket,
  getUserById,
  addConversation,
  getUserByName,
  getOrganizationById,
  getUserByEmail,
  getUsers,
} from '@/lib/firestore';
import type { Ticket, User, Attachment } from '@/lib/data';
import { redirect } from 'next/navigation';
import { Twilio } from 'twilio';
import { htmlToText } from 'html-to-text';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { sendEmail } from '@/lib/email';

/**
 * Add a reply to a ticket
 */
export async function addReplyAction(formData: FormData) {
  try {
    const ticketId = formData.get('ticketId') as string;
    const content = (formData.get('content') as string) || '';
    const authorId = formData.get('authorId') as string;
    const files = formData.getAll('attachments') as File[];

    if (!ticketId || !authorId) {
      throw new Error('Missing required data for reply.');
    }
    if (!content && files.length === 0) {
      return { success: false, error: 'A reply must have content or an attachment.' };
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const [author, admins] = await Promise.all([
      getUserById(authorId),
      getUsers({ organizationId: ticket.organizationId, role: 'Admin' }),
    ]);

    if (!author) throw new Error('Author not found');

    // --- Handle attachments ---
    const attachments: Attachment[] = [];
    for (const file of files) {
      if (file.size > 0) {
        if (file.size > 10 * 1024 * 1024) {
          return { success: false, error: `File "${file.name}" exceeds the 10MB size limit.` };
        }
        const filePath = `ticket-attachments/${ticketId}/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        attachments.push({
          name: file.name,
          url: downloadURL,
          type: file.type,
          size: file.size,
        });
      }
    }

    await addConversation(ticketId, {
      content,
      authorId: author.id,
      authorName: author.name,
      attachments,
    });
    
    // --- Auto-assign logic ---
    if (author.role === 'Admin' && ticket.status === 'New' && ticket.assignee === 'Unassigned') {
        await updateTicket(ticketId, { assignee: author.name });
        console.log(`Ticket ${ticketId} auto-assigned to admin ${author.name}`);
    }


    // --- Notification Logic ---
    const userIdsToNotify = new Set<string>();

    const reporter = await getUserByEmail(ticket.reporterEmail);
    if (reporter) userIdsToNotify.add(reporter.id);

    if (ticket.assignee !== 'Unassigned') {
      const assignee = await getUserByName(ticket.assignee);
      if (assignee) userIdsToNotify.add(assignee.id);
    }

    admins.forEach((admin) => userIdsToNotify.add(admin.id));
    userIdsToNotify.delete(author.id);

    if (userIdsToNotify.size > 0) {
      const plainTextContent = content ? htmlToText(content, { wordwrap: 130 }) : `Sent ${attachments.length} attachment(s)`;
      const summary =
        plainTextContent.length > 100 ? `${plainTextContent.substring(0, 97)}...` : plainTextContent;

      const notificationPromises = Array.from(userIdsToNotify).map((userId) =>
        createNotification({
          userId,
          title: `New reply from ${author.name}`,
          description: summary,
          link: `/tickets/view/${ticketId}`,
          type: 'new_reply',
          metadata: {
            from: author.name,
            ticketTitle: ticket.title,
          },
        })
      );
      await Promise.all(notificationPromises);
    }

    // --- Outbound WhatsApp Reply Logic ---
    if (
      ticket.source === 'WhatsApp' &&
      (author.role === 'Admin' || author.role === 'Agent') &&
      ticket.reporterPhone
    ) {
      const org = await getOrganizationById(ticket.organizationId);
      const orgWhatsapp = org?.settings?.whatsapp;

      if (orgWhatsapp?.accountSid && orgWhatsapp?.authToken && orgWhatsapp?.phoneNumber) {
        try {
          const twilioClient = new Twilio(orgWhatsapp.accountSid, orgWhatsapp.authToken);
          const plainTextContent = htmlToText(content, { wordwrap: 130 });
          
          const messagePayload: any = {
            from: `whatsapp:${orgWhatsapp.phoneNumber}`,
            to: `whatsapp:${ticket.reporterPhone}`,
          };

          // Send main text message if there is content
          if (plainTextContent) {
            const replyBody = `*New reply from ${author.name}:*\n\n${plainTextContent}`;
            await twilioClient.messages.create({ ...messagePayload, body: replyBody });
          }
          
          // Send each attachment as a separate media message
          if (attachments.length > 0) {
            for (const attachment of attachments) {
              await twilioClient.messages.create({
                ...messagePayload,
                mediaUrl: [attachment.url],
                // Add a caption for non-image files
                body: !attachment.type.startsWith('image/') ? attachment.name : undefined,
              });
            }
          }

          console.log(
            `Successfully sent WhatsApp reply to ${ticket.reporterPhone} for ticket ${ticketId}`
          );
        } catch (twilioError) {
          console.error('Error sending outbound WhatsApp message via Twilio:', twilioError);
        }
      }
    }

    revalidatePath(`/tickets/view/${ticketId}`);
    return { success: true };
  } catch (error) {
    console.error('Error in addReplyAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add reply.';
    return { success: false, error: errorMessage };
  }
}

/**
 * Update ticket
 */
export async function updateTicketAction(
  ticketId: string,
  updates: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>>,
  currentUserId: string
) {
  try {
    const [currentTicket, user] = await Promise.all([
      getTicketById(ticketId),
      getUserById(currentUserId),
    ]);

    if (!currentTicket) throw new Error('Ticket not found for update.');
    if (!user) throw new Error('Current user not found.');

    const dataToUpdate: { [key: string]: any } = { ...updates };

    if (updates.status) {
      dataToUpdate.statusLastSetBy = user.role;
    }
    if (updates.priority) {
      dataToUpdate.priorityLastSetBy = user.role;
    }

    // First, commit the main ticket updates to the database.
    await updateTicket(ticketId, dataToUpdate);

    // --- Post-Update Logic (Notifications, CSAT) ---

    const wasJustClosed = updates.status === 'Closed' && currentTicket.status !== 'Closed';

    // CSAT Trigger Logic
    if (wasJustClosed) {
      const org = await getOrganizationById(currentTicket.organizationId);
      const reporter = await getUserByEmail(currentTicket.reporterEmail);
      
      if (org && reporter) {
        if (currentTicket.source === 'WhatsApp' && currentTicket.reporterPhone && org.settings?.whatsapp?.accountSid && org.settings.whatsapp.authToken) {
          // Send WhatsApp CSAT request
          try {
            const twilioClient = new Twilio(org.settings.whatsapp.accountSid, org.settings.whatsapp.authToken);
            const csatTemplate = org.settings.whatsapp.templates?.csatRequest || "Thank you for contacting us! How would you rate the support you received? Please reply with a number from 1 (Poor) to 5 (Excellent).";
            await twilioClient.messages.create({
              from: `whatsapp:${org.settings.whatsapp.phoneNumber}`,
              to: `whatsapp:${currentTicket.reporterPhone}`,
              body: csatTemplate
            });
            await updateTicket(ticketId, { csatStatus: 'pending' });
            console.log(`Successfully sent WhatsApp CSAT request for ticket ${ticketId}`);
          } catch (twilioError) {
            console.error("Error sending WhatsApp CSAT request:", twilioError);
          }

        } else if (org.settings?.emailTemplates?.csatRequest) {
          // Send Email CSAT request
          try {
            await sendEmail({
              to: reporter.email,
              subject: `How did we do on your request: "${currentTicket.title}"?`,
              template: org.settings.emailTemplates.csatRequest,
              data: {
                  ticket: { ...currentTicket, id: ticketId },
                  user: reporter,
                  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
              }
            });
            await updateTicket(ticketId, { csatStatus: 'pending' });
            console.log(`Successfully sent Email CSAT request for ticket ${ticketId}`);
          } catch (emailError) {
             console.error("Error sending Email CSAT request:", emailError);
          }
        }
      }
    }


    // Notification Logic for status or priority changes
    if (updates.status || updates.priority) {
      const userIdsToNotify = new Set<string>();

      const reporter = await getUserByEmail(currentTicket.reporterEmail);
      if (reporter) userIdsToNotify.add(reporter.id);

      if (currentTicket.assignee !== 'Unassigned') {
        const assignee = await getUserByName(currentTicket.assignee);
        if (assignee) userIdsToNotify.add(assignee.id);
      }

      userIdsToNotify.delete(currentUserId);

      if (userIdsToNotify.size > 0) {
        let title = '';
        let description = '';

        if (updates.status) {
          title = `Ticket status changed: ${currentTicket.title}`;
          description = `Status changed to ${updates.status} by ${user.name}.`;
        } else if (updates.priority) {
          title = `Ticket priority changed: ${currentTicket.title}`;
          description = `Priority changed to ${updates.priority} by ${user.name}.`;
        }

        const notificationPromises = Array.from(userIdsToNotify).map((userId) =>
          createNotification({
            userId,
            title,
            description,
            link: `/tickets/view/${ticketId}`,
            type: 'status_change',
          })
        );
        await Promise.all(notificationPromises);
      }
    }

    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');

    return { success: true, message: 'Ticket updated successfully.' };
  } catch (error) {
    console.error('Error in updateTicketAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update ticket.';
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a ticket
 */
export async function deleteTicketAction(ticketId: string) {
  try {
    await deleteTicket(ticketId);
    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return { error: 'Failed to delete ticket. Please try again.' };
  }

  redirect('/tickets');
}

    