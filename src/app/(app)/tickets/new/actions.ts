
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addTicket, getUserById } from '@/lib/firestore';
import { ticketSchema } from './schema';
import type { Attachment } from '@/lib/data';

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

    const newTicketId = await addTicket({
      ...ticketData,
      reporterId: user.id,
      reporterEmail: user.email,
      reporter: user.name,
      organizationId: user.organizationId,
      attachments: attachments,
    });
    
    // Revalidate paths to show new data
    revalidatePath('/tickets', 'layout');
    revalidatePath('/dashboard');

    // Redirect to the new ticket page
    redirect(`/tickets/view/${newTicketId}`);
    
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return { error: error.message || 'Failed to create ticket.' };
  }
}
