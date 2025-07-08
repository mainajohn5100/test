
'use server';

import { revalidatePath } from 'next/cache';
import { createNotification, updateTicket } from '@/lib/firestore';
import type { Ticket } from '@/lib/data';

export async function updateTicketAction(
  ticketId: string,
  updates: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>>,
  notificationDetails?: {
    assigneeId: string | null;
    title: string;
    description: string;
  }
) {
  try {
    // Explicitly build the object to prevent passing complex types or undefined values.
    const dataToUpdate: { [key: string]: any } = {};
    if (updates.status) dataToUpdate.status = updates.status;
    if (updates.priority) dataToUpdate.priority = updates.priority;
    if (updates.assignee) dataToUpdate.assignee = updates.assignee;
    if (updates.tags) dataToUpdate.tags = updates.tags;
    if (updates.project) dataToUpdate.project = updates.project;

    // Only update if there are actual changes.
    if (Object.keys(dataToUpdate).length > 0) {
      await updateTicket(ticketId, dataToUpdate);
    } else if (!notificationDetails?.assigneeId) {
      // If there are no updates and no one to notify, do nothing.
      return { success: true, message: 'No changes to apply.' };
    }

    if (notificationDetails?.assigneeId && notificationDetails.title && notificationDetails.description) {
      await createNotification({
        userId: notificationDetails.assigneeId,
        title: notificationDetails.title,
        description: notificationDetails.description,
        link: `/tickets/view/${ticketId}`,
      });
    }

    revalidatePath(`/tickets/view/${ticketId}`);
    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');

    return { success: true, message: 'Ticket updated successfully.' };
  } catch (error) {
    console.error("Error in updateTicketAction:", error);
    // Make sure to return a specific error message if available.
    const errorMessage = error instanceof Error ? error.message : 'Failed to update ticket.';
    return { success: false, error: errorMessage };
  }
}
