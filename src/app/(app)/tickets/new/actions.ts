'use server';

import { z } from 'zod';
import { addTicket } from '@/lib/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const ticketSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  reporter: z.string().min(1, "Customer Name is required."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  project: z.string().optional(),
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function createTicketAction(values: z.infer<typeof ticketSchema>) {
  // We're not using email right now, but it's good to validate it.
  const { email, ...ticketData } = values;

  const priorityMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
  }

  try {
    const newTicketId = await addTicket({
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
  redirect(`/tickets/view/${(await addTicket(ticketData))}`);
}
