
'use server';

import { z } from 'zod';
import { updateUser as updateFirestoreUser } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { storage, auth } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { User } from '@/lib/data';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export async function updateUserAction(userId: string, formData: FormData) {
  try {
    const updateData: {[key: string]: any} = {};
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== userId) {
      throw new Error("Permission denied.");
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    // Handle email change
    if (email && email !== currentUser.email) {
      // The updateEmail function is not available in the version of the SDK being used.
      // This would require re-authentication. For now, we'll log this action.
      console.log(`Attempting to change email to: ${email}. This requires re-authentication.`);
      // In a real scenario, you'd trigger a re-auth flow.
      // For this implementation, we will update Firestore but not Firebase Auth email.
      updateData.email = email; 
    }

    if (name && name !== currentUser.displayName) {
        // updateProfile is also not available in this Admin SDK context.
        // We will update it in Firestore.
        updateData.name = name;
    }

    // Process other fields
    const otherFields: (keyof Omit<User, 'id'| 'role'| 'name' | 'email'| 'avatar'>)[] = ['phone', 'country', 'city', 'zipCode', 'dob', 'gender'];
    otherFields.forEach(field => {
        if (formData.has(field)) {
            updateData[field] = formData.get(field) as string || null;
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
        await updateFirestoreUser(userId, updateData);
    }
    
    revalidatePath(`/users/${userId}`);
    revalidatePath('/settings');
    revalidatePath('/(app)', 'layout'); // Revalidate layout to update user info in sidebar

    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: 'Failed to update profile.' };
  }
}

export async function updateUserRoleAction(userId: string, role: User['role']) {
  try {
    if (!userId || !role) {
      throw new Error("User ID and role are required.");
    }
    await updateFirestoreUser(userId, { role });
    revalidatePath('/users');
    revalidatePath(`/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in updateUserRoleAction:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function updateUserPrivacyAction(userId: string, activityIsPublic: boolean) {
  try {
    await updateFirestoreUser(userId, { activityIsPublic });
    revalidatePath(`/users/${userId}`);
    revalidatePath('/settings/account');
    return { success: true, message: "Privacy settings updated." };
  } catch (error) {
    console.error("Error updating user privacy:", error);
    return { success: false, error: 'Failed to update privacy settings.' };
  }
}
