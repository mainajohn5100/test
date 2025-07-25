

'use server';

import { z } from 'zod';
import { updateUser as updateFirestoreUser, createUserInAuth, createUserInFirestore, setAuthUserClaims, sendPasswordResetEmail, getUserByEmail } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { storage, auth } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { User } from '@/lib/data';
import { updateProfile, verifyBeforeUpdateEmail, updatePassword as updateAuthPassword } from 'firebase/auth';
import { userCreateSchema } from './schema';
import { getUserById } from '@/lib/firestore';

export async function createUserAction(values: z.infer<typeof userCreateSchema>, creatorId: string) {
    const validatedFields = userCreateSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }

    const { name, email, password, phone } = validatedFields.data;
    const role = values.role; // Role is required and validated

    try {
        const creatorUser = await getUserById(creatorId);
        if (!creatorUser || !creatorUser.organizationId) {
            return { error: 'Could not determine your organization to create a new user.' };
        }
        
        const orgId = creatorUser.organizationId;
        
        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser && existingUser.organizationId === orgId) {
            return { error: 'A user with this email already exists in your organization.' };
        }

        const newUserId = await createUserInAuth(email, password);
        
        await setAuthUserClaims(newUserId, {
            organizationId: orgId,
            role: role,
        });

        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatar = `https://placehold.co/32x32/BDE0FE/4A4A4A.png?text=${initials}`;
        
        const newUser: Omit<User, 'id'> = {
            name,
            email,
            role,
            phone,
            country: '',
            city: '',
            zipCode: '',
            dob: '',
            gender: 'Prefer not to say',
            status: 'active',
            avatar,
            organizationId: orgId,
            activityIsPublic: false,
            createdByAdmin: true,
        };

        await createUserInFirestore(newUserId, newUser);

        revalidatePath('/users');
        return { success: true, message: `User ${name} created successfully.` };
    } catch (error: any) {
        console.error("Error in createUserAction:", error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
}

export async function updateUserAction(userId: string, formData: FormData) {
  try {
    const updateData: {[key: string]: any} = {};
    
    // We get user from the client now, but still need to find them in firestore
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const currentEmail = formData.get('currentEmail') as string;

    // Handle email change securely
    if (email && email !== currentEmail) {
      // This part can't be done on the server.
      // The client should handle re-authentication and then call a more specific server action.
      // For now, we will just update firestore.
      // In a real app, this flow would be more complex.
      updateData.email = email;
    }

    // Handle name change
    if (name) {
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
      message += ` To change your sign-in email, please use the dedicated 'Change Email' flow which requires re-authentication.`
    }
    return { success: true, message };

  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: 'Failed to update profile.' };
  }
}

export async function changePasswordAction(userId: string, newPasswordB64: string) {
    try {
        const newPassword = Buffer.from(newPasswordB64, 'base64').toString('utf8');
        // This is a simplified flow. A real app would use Firebase Admin SDK
        // to update password without re-authentication on the server.
        // The current client-side SDK doesn't allow changing password directly on the server.
        // The re-authentication must happen on the client.
        // This action now assumes re-auth was successful on the client.
        console.log(`Password change requested for user ${userId}. In a real app, you'd use the Admin SDK to fulfill this.`);
        
        return { success: true, message: "Password update process initiated on client." };
    } catch (error) {
        console.error("Error in changePasswordAction", error);
        return { success: false, error: "Failed to change password." };
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

export async function updateUserStatusAction(userId: string, status: User['status']) {
  try {
    if (!userId || !status) {
      throw new Error("User ID and status are required.");
    }
    await updateFirestoreUser(userId, { status });
    revalidatePath('/users');
    revalidatePath(`/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in updateUserStatusAction:", error);
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
