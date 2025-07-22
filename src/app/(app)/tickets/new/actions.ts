
'use server';

import { z } from 'zod';
import { addTicket, createNotification, getUserByName, updateTicket, getUserById } from '@/lib/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ticketSchema } from './schema';
import type { Ticket, Attachment, User } from '@/lib/data';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function createTicketAction(formData: FormData) {
  const values = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    reporter: formData.get('reporter') as string,
    reporterId: formData.get('reporterId') as string,
    email: formData.get('email') as string,
    priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
    category: formData.get('category') as 'General' | 'Support' | 'Advertising' | 'Billing',
    project: formData.get('project') as string,
    assignee: formData.get('assignee') as string,
    tags: formData.getAll('tags') as string[] || [],
  };

  const validatedFields = ticketSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      error: 'Invalid form data provided. Please check the fields and try again.',
    };
  }
  
  const { title, description, reporter, reporterId, email, priority, category, project, assignee, tags } = validatedFields.data;
  
  const priorityMap: { [key: string]: Ticket['priority'] } = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  const reporterUser = await getUserById(reporterId);
  if (!reporterUser) {
    return { error: 'Could not find the user creating the ticket.' };
  }

  const finalAssignee = (!assignee || assignee === 'unassigned') ? 'Unassigned' : assignee;
  const finalProject = (!project || project === 'none') ? null : project;
  
  let finalCategory = category;
  // If an Admin/Agent creates a ticket not linked to a project, categorize it as 'Internal'.
  if ((reporterUser.role === 'Admin' || reporterUser.role === 'Agent') && !finalProject) {
    finalCategory = 'Internal';
  }

  let source: Ticket['source'];
  if (finalProject) {
    source = 'Project';
  } else if (reporterUser.role === 'Client') {
    source = 'Client Inquiry';
  } else {
    source = 'Internal';
  }

  const ticketData = {
    title,
    description,
    reporter,
    reporterEmail: email,
    tags: tags || [],
    priority: priorityMap[priority],
    category: finalCategory,
    assignee: finalAssignee,
    project: finalProject,
    source,
    organizationId: reporterUser.organizationId,
    statusLastSetBy: reporterUser.role,
    priorityLastSetBy: reporterUser.role,
  };

  let newTicketId: string;
  try {
    newTicketId = await addTicket(ticketData);

    const attachments: Attachment[] = [];
    const files = formData.getAll('attachments') as File[];

    if (files.length > 0) {
        for (const file of files) {
            if (file.size > 0) {
                const filePath = `ticket-attachments/${newTicketId}/${file.name}`;
                const storageRef = ref(storage, filePath);
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);
                attachments.push({
                    name: file.name,
                    url: downloadURL,
                    type: file.type,
                });
            }
        }
    }

    if (attachments.length > 0) {
        await updateTicket(newTicketId, { attachments });
    }

    if (finalAssignee !== 'Unassigned') {
      const assigneeUser = await getUserByName(finalAssignee);
      if (assigneeUser) {
        await createNotification({
          userId: assigneeUser.id,
          title: `New Ticket Assigned`,
          description: `You have been assigned the ticket: "${ticketData.title}".`,
          link: `/tickets/view/${newTicketId}`,
        });
      }
    }

    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error("Error in createTicketAction:", error);
    return {
      error: 'Failed to create ticket in the database. Please try again.',
    };
  }

  redirect(`/tickets/view/${newTicketId}`);
}
