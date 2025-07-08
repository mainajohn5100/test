
'use server';

import { z } from 'zod';
import { addUser, deleteUser, updateUser } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { userSchema, updateUserSchema } from './schema';
import { redirect } from 'next/navigation';

export async function createUserAction(values: z.infer<typeof userSchema>) {
  try {
    const { name, email, role } = userSchema.parse(values);
    await addUser({ name, email, role });

    revalidatePath('/users');
    return { success: true, message: "User created successfully." };
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid form data." };
    }
    return { success: false, error: 'Failed to create user.' };
  }
}

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


export async function deleteUserAction(userId: string) {
    try {
        await deleteUser(userId);
        revalidatePath('/users');
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            error: 'Failed to delete user. Please try again.',
        };
    }
    redirect('/users');
}
