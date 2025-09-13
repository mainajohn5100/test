
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addTicket, getOrganizationById, getUserById } from '@/lib/firestore';
import { ticketSchema } from './schema';
import type { Attachment } from '@/lib/data';
import { addHours } from 'date-fns';

export async function createTicketAction(formData: FormData) {
  const values = Object.fromEntries(formData.entries());

  // Manually handle array fields like tags
  const tags = formData.getAll('tags') as string[];
  const parsedValues = {
    ...values,
    tags: tags.length > 0 ? tags : undefined,
  };
  
  const validatedFields = ticketSchema.safeParse(parsedValues);
  
  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors);
    return { error: 'Invalid data provided.' };
  }

  const { reporterId, ...ticketData } = validatedFields.data;
  
  let newTicketId: string;
  try {
    const user = await getUserById(reporterId);
    if (!user) {
        return { error: "Reporter user not found." };
    }

    const attachments: Attachment[] = [];
    const files = formData.getAll('attachments') as File[];

    for (const file of files) {
        if (file.size > 0) {
            // Validate file size (e.g., 10MB)
            if (file.size > 10 * 1024 * 1024) {
                 return { error: `File "${file.name}" is too large (max 10MB).` };
            }
            
            const filePath = `ticket-attachments/new-tickets/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, filePath);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            attachments.push({
                name: file.name,
                url: downloadURL,
                type: file.type,
                size: file.size,
            });
        }
    }
    
    const finalTicketData = {
      ...ticketData,
      reporterId: user.id,
      reporterEmail: user.email,
      reporter: user.name,
      organizationId: user.organizationId,
      attachments: attachments,
      source: ticketData.project && ticketData.project !== 'none' ? 'Project' : 'Client Inquiry',
    };
    
    const org = await getOrganizationById(user.organizationId);
    const slaPolicy = org?.settings?.slaPolicies?.[0];
    if (slaPolicy) {
      const target = slaPolicy.targets.find(t => t.priority === finalTicketData.priority);
      if (target) {
        const now = new Date();
        (finalTicketData as any).slaPolicyId = slaPolicy.id;
        (finalTicketData as any).firstResponseDue = addHours(now, target.firstResponseHours).toISOString();
        (finalTicketData as any).resolutionDue = addHours(now, target.resolutionHours).toISOString();
      }
    }

    newTicketId = await addTicket(finalTicketData);
    
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return { error: error.message || 'Failed to create ticket.' };
  }

  // Revalidate paths and redirect outside the try/catch block
  revalidatePath('/tickets', 'layout');
  revalidatePath('/dashboard');
  redirect(`/tickets/view/${newTicketId}`);
}
