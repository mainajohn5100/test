
'use server';

import { z } from 'zod';
import { updateUser } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { updateUserSchema } from './schema';
import { redirect } from 'next/navigation';

export async function updateUserAction(userId: string, values: z.infer<typeof updateUserSchema>) {
  try {
    const validatedData = updateUserSchema.parse(values);

    // Filter out any undefined values so Firestore doesn't complain
    const updateData = Object.fromEntries(
        Object.entries(validatedData).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(updateData).length === 0) {
        return { success: true, message: "No changes were made." };
    }

    await updateUser(userId, updateData);
    
    revalidatePath(`/users/${userId}`);
    revalidatePath('/users');

    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid form data." };
    }
    return { success: false, error: 'Failed to update profile.' };
  }
}
