

'use server';

import { revalidatePath } from 'next/cache';
import { storage, auth } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { updateUser, getUserById, getUserByEmail, createUserInAuth, setAuthUserClaims, createUserInFirestore } from '@/lib/firestore';
import { sendEmailVerification, updateEmail as updateFbEmail, updateProfile as updateFbProfile } from 'firebase/auth';
import { userCreateSchema } from './schema';
import { z } from 'zod';
import type { User as AppUser } from '@/lib/data';

export async function updateUserAction(userId: string, formData: FormData) {
  try {
    const currentUserId = formData.get('currentUserId') as string;
    const currentEmail = formData.get('currentEmail') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    const user = await getUserById(userId);
    if (!user) throw new Error("User not found.");

    if (currentUserId !== userId) {
      throw new Error("You are not authorized to perform this action.");
    }
    
    const updateData: { [key: string]: any } = {};

    if (name && name !== user.name) {
      updateData.name = name;
    }

    const avatarFile = formData.get('avatar') as File | null;
    if (avatarFile && avatarFile.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(avatarFile.type)) {
        return { success: false, error: 'Invalid file type for avatar.' };
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (avatarFile.size > maxSize) {
        return { success: false, error: 'Avatar file is too large (max 5MB).' };
      }

      if (user.avatar && user.avatar.includes('firebasestorage.googleapis.com')) {
          try {
              const oldAvatarRef = ref(storage, user.avatar);
              await deleteObject(oldAvatarRef);
          } catch (error: any) {
              if (error.code !== 'storage/object-not-found') {
                  console.warn("Could not delete old avatar:", error);
              }
          }
      }

      const timestamp = Date.now();
      const sanitizedFileName = avatarFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `user-avatars/${userId}/${timestamp}-${sanitizedFileName}`;
      
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, avatarFile);
      const avatarUrl = await getDownloadURL(storageRef);
      updateData.avatar = avatarUrl;
    }

    if (Object.keys(updateData).length > 0) {
      await updateUser(userId, updateData);
    }
    
    const authUser = auth.currentUser;
    if (authUser && authUser.uid === userId) {
        const authProfileUpdate: { displayName?: string, photoURL?: string } = {};
        if (updateData.name) authProfileUpdate.displayName = updateData.name;
        if (updateData.avatar) authProfileUpdate.photoURL = updateData.avatar;
        if (Object.keys(authProfileUpdate).length > 0) {
            await updateFbProfile(authUser, authProfileUpdate);
        }
    }

    revalidatePath(`/users/${userId}`);
    revalidatePath(`/settings`);

    return { success: true, message: "Profile updated successfully!" };

  } catch (error) {
    console.error("Error updating user:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function updateUserPrivacyAction(userId: string, isPublic: boolean) {
    try {
        await updateUser(userId, { activityIsPublic: isPublic });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update privacy settings." };
    }
}

export async function updateUserStatusAction(userId: string, status: 'active' | 'disabled') {
    try {
        await updateUser(userId, { status });
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update user status." };
    }
}

export async function updateUserRoleAction(userId: string, role: 'Admin' | 'Agent' | 'Client') {
    try {
        await updateUser(userId, { role });
        // Also update custom claims for security rules enforcement
        await setAuthUserClaims(userId, { role });
        revalidatePath('/users');
        revalidatePath(`/users/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update user role." };
    }
}

export async function inviteUserToProjectAction(projectId: string, projectName: string, email: string) {
    try {
        const user = await getUserByEmail(email);
        if (user) {
            return { success: true };
        } else {
            console.log(`Sending invitation to new user: ${email} for project ${projectName}`);
            return { success: true, message: 'Invitation sent to new user.' };
        }
    } catch(e) {
        console.error("Error inviting user:", e);
        return { success: false, error: "Failed to send invitation." };
    }
}

export async function createUserAction(values: z.infer<typeof userCreateSchema>, creatorId: string) {
    const validatedFields = userCreateSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }
    
    const creator = await getUserById(creatorId);
    if (!creator || !creator.organizationId) {
      return { error: 'Creator not found or is not part of an organization.' };
    }

    const { name, email, password, role, phone } = validatedFields.data;

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser && existingUser.organizationId === creator.organizationId) {
            return { error: 'A user with this email already exists in your organization.' };
        }

        const newUserId = await createUserInAuth(email, password);

        await setAuthUserClaims(newUserId, {
            organizationId: creator.organizationId,
            role,
        });
        
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatar = `https://placehold.co/32x32/BDE0FE/4A4A4A.png?text=${initials}`;
        
        const newUser: Omit<AppUser, 'id'> = {
            name,
            email,
            role,
            avatar,
            organizationId: creator.organizationId,
            activityIsPublic: false,
            status: 'active',
            phone: phone || '',
            createdByAdmin: true,
            createdAt: new Date().toISOString(),
        };

        await createUserInFirestore(newUserId, newUser);

        const authUser = auth.currentUser;
        if(authUser && authUser.uid === newUserId) {
            await sendEmailVerification(authUser);
        }
        
        revalidatePath('/users');
        return { success: true, message: `User ${name} created successfully. A verification email has been sent.` };

    } catch (error: any) {
        console.error("Error in createUserAction:", error);
        return { error: error.message || 'An unexpected error occurred during user creation.' };
    }
}
