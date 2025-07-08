'use server';

import { z } from 'zod';
import { addUser, deleteUser } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { userSchema } from './schema';
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
