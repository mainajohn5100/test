

'use server';

import { revalidatePath } from 'next/cache';
import { createNotification, getTicketById, updateTicket, deleteTicket, getUserById, addConversation, getUserByName, getOrganizationById } from '@/lib/firestore';
import type { Ticket, User, TicketConversation, Organization } from '@/lib/data';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import { summarizeNewMessage } from '@/ai/flows/summarize-new-message';
import { Twilio } from 'twilio';

export async function addReplyAction(data: { ticketId: string; content: string; authorId: string; }) {
  try {
    const { ticketId, content, authorId } = data;
    
    const [ticket, author] = await Promise.all([
        getTicketById(ticketId),
        getUserById(authorId)
    ]);
    
    if (!ticket || !author) {
      throw new Error("Ticket or author not found");
    }

    // Automatically set status to Active on first Agent/Admin reply
    let statusUpdate: Partial<Ticket> = {};
    if ((author.role === 'Admin' || author.role === 'Agent') && ticket.status === 'New') {
        statusUpdate.status = 'Active';
        statusUpdate.statusLastSetBy = author.role;
    }

    await addConversation(ticketId, { content, authorId }, statusUpdate);
    
    // Refresh ticket data if it was updated
    const updatedTicket = { ...ticket, ...statusUpdate };

    // --- Notification Logic ---
    const reporter = await getUserByName(updatedTicket.reporter);
    const assignee = updatedTicket.assignee !== 'Unassigned' ? await getUserByName(updatedTicket.assignee) : null;
    
    const userIdsToNotify = new Set<string>();
    if (reporter) userIdsToNotify.add(reporter.id);
    if (assignee) userIdsToNotify.add(assignee.id);
    if(ticket.conversations) {
        ticket.conversations.forEach(convo => userIdsToNotify.add(convo.authorId));
    }


    // Remove the author of the reply from the notification list
    userIdsToNotify.delete(author.id);

    const usersToNotify = (await Promise.all(
        Array.from(userIdsToNotify).map(id => getUserById(id))
    )).filter((u): u is User => u !== null);

    const org = await getOrganizationById(updatedTicket.organizationId);

    // --- WhatsApp Two-Way Messaging ---
    if (updatedTicket.source === 'WhatsApp' && reporter?.phone && (author.role === 'Admin' || author.role === 'Agent')) {
      if (org?.settings?.whatsapp?.accountSid && org.settings.whatsapp.authToken && org.settings.whatsapp.phoneNumber) {
        try {
          const twilioClient = new Twilio(org.settings.whatsapp.accountSid, org.settings.whatsapp.authToken);
          // Strip HTML tags for SMS/WhatsApp delivery
          const textContent = content.replace(/<[^>]*>?/gm, '');

          await twilioClient.messages.create({
            from: `whatsapp:${org.settings.whatsapp.phoneNumber}`,
            to: `whatsapp:${reporter.phone}`,
            body: `*New Reply from ${author.name}:*\n\n${textContent}`
          });
          
          // Remove client from email notification list if WhatsApp message is sent
          const reporterIndex = usersToNotify.findIndex(u => u.id === reporter.id);
          if (reporterIndex > -1) {
            usersToNotify.splice(reporterIndex, 1);
          }

        } catch (twilioError) {
          console.error("Failed to send WhatsApp reply:", twilioError);
          // Don't throw, allow email notification to proceed as a fallback.
        }
      }
    }


    for (const recipient of usersToNotify) {
        const { summary } = await summarizeNewMessage({
            from: author.name,
            message: content,
            ticketTitle: updatedTicket.title,
        });

        await createNotification({
            userId: recipient.id,
            title: `New reply from ${author.name}`,
            description: summary,
            link: `/tickets/view/${ticketId}`,
            type: 'new_reply',
            metadata: {
                from: author.name,
                ticketTitle: updatedTicket.title,
            }
        });
        
        let templateKey: keyof NonNullable<Organization['settings']['emailTemplates']> | null = null;
        
        const authorRole = author.role;
        const recipientRole = recipient.role;

        if (authorRole === 'Admin') {
            if (recipientRole === 'Client') templateKey = 'adminReplyToClient';
            else if (recipientRole === 'Agent') templateKey = 'adminReplyToAgent';
        } else if (authorRole === 'Agent') {
            if (recipientRole === 'Client') templateKey = 'agentReplyToClient'; 
            else if (recipientRole === 'Admin') templateKey = 'agentReplyToAdmin';
        } else if (authorRole === 'Client') {
            if (recipientRole === 'Agent') templateKey = 'clientReplyToAgent'; 
            else if (recipientRole === 'Admin') templateKey = 'clientReplyToAdmin';
        }
        
        const template = templateKey ? org?.settings?.emailTemplates?.[templateKey] : null;

        if (template && recipient.email) {
            await sendEmail({
                to: recipient.email,
                subject: `[Ticket #${updatedTicket.id.substring(0,6)}] New reply from ${author.name}: ${updatedTicket.title}`,
                template,
                data: { ticket: updatedTicket, user: recipient, replier: author, content }
            });
        }
    }

    revalidatePath(`/tickets/view/${ticketId}`);
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
    
    revalidatePath(`/tickets/view/${ticketId}`);
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
