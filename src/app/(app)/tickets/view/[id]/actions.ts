
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
    await updateTicket(ticketId, updates);

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
    return { success: false, error: 'Failed to update ticket.' };
  }
}
