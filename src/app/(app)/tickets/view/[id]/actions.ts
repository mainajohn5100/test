'use server';

import { revalidatePath } from 'next/cache';
import { createNotification, updateTicket } from '@/lib/firestore';
import type { Ticket } from '@/lib/data';

export async function updateTicketStatusAction(
  ticketId: string,
  newStatus: Ticket['status'],
  assigneeId: string | null,
  ticketTitle: string
) {
  try {
    await updateTicket(ticketId, { status: newStatus });

    // If there's an assignee, create a notification for them.
    if (assigneeId) {
      await createNotification({
        userId: assigneeId,
        title: `Ticket Status Updated`,
        description: `Status for "${ticketTitle}" changed to ${newStatus}.`,
        link: `/tickets/view/${ticketId}`,
      });
    }

    revalidatePath(`/tickets/view/${ticketId}`);
    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');

    return { success: true, message: 'Ticket status updated.' };
  } catch (error) {
    console.error("Error in updateTicketStatusAction:", error);
    return { success: false, error: 'Failed to update ticket status.' };
  }
}
