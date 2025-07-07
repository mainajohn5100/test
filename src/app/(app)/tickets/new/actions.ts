'use server';

import { z } from 'zod';
import { addTicket } from '@/lib/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ticketSchema } from './schema';

export async function createTicketAction(values: z.infer<typeof ticketSchema>) {
  // We're not using email right now, but it's good to validate it.
  const { email, ...ticketData } = values;

  const priorityMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
  }

  let newTicketId: string;
  try {
    newTicketId = await addTicket({
      ...ticketData,
      // The Ticket type has a specific capitalization for priority
      priority: priorityMap[values.priority] as 'Low' | 'Medium' | 'High' | 'Urgent',
      assignee: ticketData.assignee || 'Unassigned',
      reporter: ticketData.reporter,
    });

    // Revalidate paths to reflect the new ticket in lists
    revalidatePath('/(app)/tickets', 'layout');
    revalidatePath('/(app)/dashboard');
    
  } catch (error) {
    console.error(error);
    return {
      error: 'Failed to create ticket. Please try again.',
    };
  }

  // Redirect is called outside the try/catch block
  // as it throws an error that should not be caught.
  redirect(`/tickets/view/${newTicketId}`);
}
