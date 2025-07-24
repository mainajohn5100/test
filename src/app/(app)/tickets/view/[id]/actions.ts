

'use server';

import { revalidatePath } from 'next/cache';
import { createNotification, getTicketById, updateTicket, deleteTicket, getUserById, addConversation, getUserByName, getOrganizationById, getUserByEmail } from '@/lib/firestore';
import type { Ticket, User, TicketConversation, Organization } from '@/lib/data';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import { summarizeNewMessage } from '@/ai/flows/summarize-new-message';
import { Twilio } from 'twilio';

export async function addReplyAction(data: { ticketId: string; content: string; authorId: string; }) {
  try {
    const { ticketId, content, authorId } = data;
    
    if (!ticketId || !content || !authorId) {
        throw new Error("Missing required data for reply.");
    }

    const [ticket, author] = await Promise.all([
        getTicketById(ticketId),
        getUserById(authorId)
    ]);
    
    if (!ticket || !author) {
      throw new Error("Ticket or author not found");
    }

    await addConversation(ticketId, { content, authorId });
    
    const userIdsToNotify = new Set<string>();

    if (ticket.reporterEmail) {
      const reporter = await getUserByEmail(ticket.reporterEmail);
      if(reporter) userIdsToNotify.add(reporter.id);
    }
    
    if (ticket.assignee !== 'Unassigned') {
        const assignee = await getUserByName(ticket.assignee);
        if (assignee) userIdsToNotify.add(assignee.id);
    }

    // This part is an assumption. A better way would be to fetch all conversation authors.
    // For now, let's keep it simple.
    
    userIdsToNotify.delete(author.id);
    
    // --- Notification Logic ---
    const org = await getOrganizationById(ticket.organizationId);
    
    for (const userId of Array.from(userIdsToNotify)) {
        const recipient = await getUserById(userId);
        if(!recipient) continue;

        const { summary } = await summarizeNewMessage({
            from: author.name,
            message: content,
            ticketTitle: ticket.title,
        });

        await createNotification({
            userId: recipient.id,
            title: `New reply from ${author.name}`,
            description: summary,
            link: `/tickets/view/${ticketId}`,
            type: 'new_reply',
            metadata: {
                from: author.name,
                ticketTitle: ticket.title,
            }
        });

        // Email logic can be re-added here if needed.
    }
    
    // WhatsApp reply logic is handled separately in the inbound webhook, not here.

    // revalidatePath(`/tickets/view/${ticketId}`); // No longer needed with real-time listener
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
    
    // revalidatePath(`/tickets/view/${ticketId}`); // Not needed due to real-time listener
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
