
'use server';

import { revalidatePath } from 'next/cache';
import { createNotification, getTicketById, updateTicket, deleteTicket, getUserById, addConversation, getUserByName, getOrganizationById, getUserByEmail, getUsers } from '@/lib/firestore';
import type { Ticket, User, TicketConversation, Organization } from '@/lib/data';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import { summarizeNewMessage } from '@/ai/flows/summarize-new-message';
import { Twilio } from 'twilio';
import { htmlToText } from 'html-to-text';

export async function addReplyAction(data: { ticketId: string; content: string; authorId: string; }) {
  try {
    const { ticketId, content, authorId } = data;
    
    if (!ticketId || !content || !authorId) {
        throw new Error("Missing required data for reply.");
    }

    const [ticket, author, admins] = await Promise.all([
        getTicketById(ticketId),
        getUserById(authorId),
        getUsers({ organizationId: 'org_1', role: 'Admin' } as User) // Assuming a default org for now, needs refinement in multi-tenant setup
    ]);
    
    if (!ticket || !author) {
      throw new Error("Ticket or author not found");
    }

    await addConversation(ticketId, { content, authorId: author.id, authorName: author.name });
    
    // --- Notification Logic ---
    const userIdsToNotify = new Set<string>();
    
    // Notify the reporter (client) if they exist
    const reporter = await getUserByEmail(ticket.reporterEmail);
    if(reporter) userIdsToNotify.add(reporter.id);
    
    // Notify the assignee if they exist
    if (ticket.assignee !== 'Unassigned') {
        const assignee = await getUserByName(ticket.assignee);
        if (assignee) userIdsToNotify.add(assignee.id);
    }
    
    // Notify all admins
    admins.forEach(admin => userIdsToNotify.add(admin.id));

    // Ensure the author doesn't get a notification for their own message
    userIdsToNotify.delete(author.id);
    
    if (userIdsToNotify.size > 0) {
        const plainTextContent = htmlToText(content, { wordwrap: 130 });
        const summary = plainTextContent.length > 100 ? `${plainTextContent.substring(0, 97)}...` : plainTextContent;

        const notificationPromises = Array.from(userIdsToNotify).map(userId => 
            createNotification({
                userId: userId,
                title: `New reply from ${author.name}`,
                description: summary,
                link: `/tickets/view/${ticketId}`,
                type: 'new_reply',
                metadata: {
                    from: author.name,
                    ticketTitle: ticket.title,
                }
            })
        );
        await Promise.all(notificationPromises);
    }
    
    // --- Outbound WhatsApp Reply Logic ---
    if (ticket.source === 'WhatsApp' && (author.role === 'Admin' || author.role === 'Agent') && ticket.reporterPhone) {
      const org = await getOrganizationById(ticket.organizationId);
      const orgWhatsapp = org?.settings?.whatsapp;
      if (orgWhatsapp?.accountSid && orgWhatsapp?.authToken && orgWhatsapp?.phoneNumber) {
        try {
          const twilioClient = new Twilio(orgWhatsapp.accountSid, orgWhatsapp.authToken);
          const plainTextContent = htmlToText(content, { wordwrap: 130 });
          const replyBody = `New reply from ${author.name}:\n\n${plainTextContent}`;

          await twilioClient.messages.create({
              from: `whatsapp:${orgWhatsapp.phoneNumber}`,
              to: `whatsapp:${ticket.reporterPhone}`,
              body: replyBody,
          });
          console.log(`Successfully sent WhatsApp reply to ${ticket.reporterPhone} for ticket ${ticketId}`);
        } catch (twilioError) {
          console.error("Error sending outbound WhatsApp message via Twilio:", twilioError);
          // Don't throw error to client, but log it.
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error in addReplyAction:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add reply.';
    return { success: false, error: errorMessage };
  }
}

export async function updateTicketAction(
  ticketId: string,
  updates: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>>,
  currentUserId: string,
) {
  try {
    const [currentTicket, user] = await Promise.all([
        getTicketById(ticketId),
        getUserById(currentUserId)
    ]);
    
    if (!currentTicket) throw new Error("Ticket not found for update.");
    if (!user) throw new Error("Current user not found.");

    const dataToUpdate: {[key: string]: any} = {...updates};

    if (updates.status) {
        dataToUpdate.statusLastSetBy = user.role;
    }
    if (updates.priority) {
        dataToUpdate.priorityLastSetBy = user.role;
    }

    await updateTicket(ticketId, dataToUpdate);

    // --- Notification Logic for Status/Priority Change ---
    if (updates.status || updates.priority) {
        const userIdsToNotify = new Set<string>();
        // Notify reporter
        const reporter = await getUserByEmail(currentTicket.reporterEmail);
        if (reporter) userIdsToNotify.add(reporter.id);
        // Notify assignee
        if (currentTicket.assignee !== 'Unassigned') {
            const assignee = await getUserByName(currentTicket.assignee);
            if (assignee) userIdsToNotify.add(assignee.id);
        }
        
        // Don't notify the person who made the change
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

            const notificationPromises = Array.from(userIdsToNotify).map(userId => 
                createNotification({
                    userId: userId,
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
    console.error("Error in updateTicketAction:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update ticket.';
    return { success: false, error: errorMessage };
  }
}

export async function deleteTicketAction(ticketId: string) {
  try {
    await deleteTicket(ticketId);
    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return {
      error: 'Failed to delete ticket. Please try again.',
    };
  }
  redirect('/tickets/all');
}
