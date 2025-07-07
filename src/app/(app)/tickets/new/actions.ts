
'use server';

import { z } from 'zod';
import { addTicket } from '@/lib/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ticketSchema } from './schema';

export async function createTicketAction(values: z.infer<typeof ticketSchema>) {
  const priorityMap = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
  };

  const finalAssignee = (!values.assignee || values.assignee === 'unassigned') ? 'Unassigned' : values.assignee;
  const finalProject = (!values.project || values.project === 'none') ? undefined : values.project;

  let newTicketId: string;
  try {
    newTicketId = await addTicket({
      title: values.title,
      description: values.description,
      reporter: values.reporter,
      tags: values.tags || [],
      priority: priorityMap[values.priority],
      assignee: finalAssignee,
      project: finalProject,
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
