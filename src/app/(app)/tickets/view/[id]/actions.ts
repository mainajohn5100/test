
'use server';

import { revalidatePath } from 'next/cache';
import { createNotification, getTicketById, updateTicket } from '@/lib/firestore';
import type { Ticket, User } from '@/lib/data';

// Helper to determine notification details based on what changed
function getNotificationDetails(
  ticket: Ticket, 
  updates: Partial<Omit<Ticket, 'id'>>,
  oldAssigneeId: string | null,
  newAssignee?: User | null
) {
    const changes = [];
    if (updates.status) changes.push(`status updated to ${updates.status}`);
    if (updates.priority) changes.push(`priority set to ${updates.priority}`);
    if (updates.tags) changes.push(`tags were updated`);

    // Case 1: Ticket is reassigned
    if (newAssignee && newAssignee.id !== oldAssigneeId) {
        return {
            userId: newAssignee.id,
            title: `You have been assigned a new ticket`,
            description: `You are the new assignee for ticket "${ticket.title}".`
        };
    }
    
    // Case 2: Ticket is updated, but not reassigned
    if (changes.length > 0 && ticket.assignee !== 'Unassigned' && oldAssigneeId) {
        return {
            userId: oldAssigneeId,
            title: `Ticket Updated: "${ticket.title}"`,
            description: `The following was changed: ${changes.join(', ')}.`
        };
    }

    return null;
}

export async function updateTicketAction(
  ticketId: string,
  updates: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>>,
  assigneeDetails?: { oldAssigneeId: string | null, newAssignee?: User | null }
) {
  try {
    await updateTicket(ticketId, updates);

    // After a successful update, fetch the latest ticket data to build the notification
    const updatedTicket = await getTicketById(ticketId);

    if (updatedTicket) {
      const notification = getNotificationDetails(
          updatedTicket, 
          updates, 
          assigneeDetails?.oldAssigneeId ?? null,
          assigneeDetails?.newAssignee
      );

      if (notification) {
          await createNotification({
              userId: notification.userId,
              title: notification.title,
              description: notification.description,
              link: `/tickets/view/${ticketId}`,
          });
      }
    }

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
