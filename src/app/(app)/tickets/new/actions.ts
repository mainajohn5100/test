
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

  const finalAssignee = (!ticketData.assignee || ticketData.assignee === 'unassigned') ? 'Unassigned' : ticketData.assignee;
  const finalProject = (!ticketData.project || ticketData.project === 'none') ? undefined : ticketData.project;

  let newTicketId: string;
  try {
    newTicketId = await addTicket({
      ...ticketData,
      project: finalProject,
      assignee: finalAssignee,
      priority: priorityMap[values.priority] as 'Low' | 'Medium' | 'High' | 'Urgent',
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
