
'use server';

import { z } from 'zod';
import { updateUser } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { updateUserSchema } from './schema';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { User } from '@/lib/data';

export async function updateUserAction(userId: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const avatarFile = formData.get('avatar') as File | null;

    const validatedData = updateUserSchema.parse({ name, email });

    const updateData: Partial<Omit<User, 'id'>> = {};

    if (validatedData.name) {
      updateData.name = validatedData.name;
    }
    if (validatedData.email) {
      updateData.email = validatedData.email;
    }

    if (avatarFile && avatarFile.size > 0) {
      const filePath = `avatars/${userId}/${Date.now()}_${avatarFile.name}`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, avatarFile);
      const avatarUrl = await getDownloadURL(storageRef);
      updateData.avatar = avatarUrl;
    }

    if (Object.keys(updateData).length > 0) {
        await updateUser(userId, updateData);
    }
    
    revalidatePath(`/users/${userId}`);
    revalidatePath('/users');
    revalidatePath('/settings');

    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error("Error updating user:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid form data." };
    }
    return { success: false, error: 'Failed to update profile.' };
  }
}
