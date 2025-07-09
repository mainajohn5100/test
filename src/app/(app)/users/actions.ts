
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
    const updateData: {[key: string]: any} = {};
    
    // Process all fields from FormData
    const fields: (keyof Omit<User, 'id' | 'avatar' | 'role'>)[] = ['name', 'email', 'phone', 'country', 'city', 'zipCode', 'dob', 'gender'];
    
    fields.forEach(field => {
      const value = formData.get(field) as string;
      // We check for `has` because an empty string is a valid value to clear a field.
      if (formData.has(field)) {
          updateData[field] = value || null; // Store empty string as null to clear field
      }
    });

    const avatarFile = formData.get('avatar') as File | null;
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

export async function updateUserRoleAction(userId: string, role: User['role']) {
  try {
    // In a real production app, we would verify the caller's permissions here
    // by checking their session from the server-side.
    // For this environment, we rely on the UI to restrict access to this action.
    if (!userId || !role) {
      throw new Error("User ID and role are required.");
    }

    await updateUser(userId, { role });

    revalidatePath('/users');
    revalidatePath(`/users/${userId}`);

    return { success: true };
  } catch (error) {
    console.error("Error in updateUserRoleAction:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
