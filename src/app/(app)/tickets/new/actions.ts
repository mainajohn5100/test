
'use server';

import { z } from 'zod';
import { addTicket } from '@/lib/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ticketSchema } from './schema';
import type { Ticket } from '@/lib/data';

export async function createTicketAction(values: z.infer<typeof ticketSchema>) {
  // Define a stricter type for the priority map
  const priorityMap: { [key: string]: Ticket['priority'] } = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  const finalAssignee = (!values.assignee || values.assignee === 'unassigned') ? 'Unassigned' : values.assignee;
  const finalProject = (!values.project || values.project === 'none') ? undefined : values.project;

  // Build the ticket data object carefully.
  // This object will be of a type that's a subset of what `addTicket` expects.
  const ticketData: {
    title: string;
    description: string;
    reporter: string;
    tags: string[];
    priority: Ticket['priority'];
    assignee: string;
    project?: string;
  } = {
    title: values.title,
    description: values.description,
    reporter: values.reporter,
    tags: values.tags || [],
    priority: priorityMap[values.priority],
    assignee: finalAssignee,
  };

  // Only add the project field if it has a value.
  if (finalProject) {
    ticketData.project = finalProject;
  }

  let newTicketId: string;
  try {
    // The `addTicket` function will add status and timestamps.
    newTicketId = await addTicket(ticketData);

    // Revalidate paths to reflect the new ticket in lists
    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error("Error in createTicketAction:", error);
    return {
      error: 'Failed to create ticket in the database. Please try again.',
    };
  }

  // Redirect is called outside the try/catch block
  // as it throws an error that should not be caught.
  redirect(`/tickets/view/${newTicketId}`);
}
