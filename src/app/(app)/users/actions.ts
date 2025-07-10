
'use server';

import { z } from 'zod';
import { updateUser as updateFirestoreUser } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { storage, auth } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { User } from '@/lib/data';
import { EmailAuthProvider, reauthenticateWithCredential, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';

export async function updateUserAction(userId: string, formData: FormData) {
  try {
    const updateData: {[key: string]: any} = {};
    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== userId) {
      throw new Error("Permission denied.");
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    // Handle email change securely
    if (email && email !== currentUser.email) {
      await verifyBeforeUpdateEmail(currentUser, email);
      updateData.email = email;
    }

    // Handle name change
    if (name && name !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: name });
        updateData.name = name;
    }

    // Handle avatar change
    const avatarFile = formData.get('avatar') as File | null;
    if (avatarFile && avatarFile.size > 0) {
      const filePath = `avatars/${userId}/${Date.now()}_${avatarFile.name}`;
      const storageRef = ref(storage, filePath);
      
      await uploadBytes(storageRef, avatarFile);
      const avatarUrl = await getDownloadURL(storageRef);
      updateData.avatar = avatarUrl;
    }

    // Update Firestore only if there are changes
    if (Object.keys(updateData).length > 0) {
        await updateFirestoreUser(userId, updateData);
    }
    
    revalidatePath(`/users/${userId}`);
    revalidatePath('/settings');
    revalidatePath('/(app)', 'layout'); // Revalidate layout to update user info in sidebar

    let message = "Profile updated successfully.";
    if (updateData.email) {
      message += ` A verification email has been sent to ${updateData.email}. Please check your inbox to complete the update.`
    }
    return { success: true, message };

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
