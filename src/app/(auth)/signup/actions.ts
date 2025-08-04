
'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { signupSchema } from './schema';
import { createOrganization, createUserInAuth, createUserInFirestore, setAuthUserClaims, sendVerificationEmail, getUserById, updateUser } from '@/lib/firestore';
import type { User as AppUser } from '@/lib/data';
import { User as FirebaseUser, sendEmailVerification as firebaseSendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function signupAction(values: z.infer<typeof signupSchema>) {
    const validatedFields = signupSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }

    const { name, organizationName, email, password } = validatedFields.data;
    
    let newUserId: string;
    try {
        newUserId = await createUserInAuth(email, password);
        const organizationId = await createOrganization(organizationName);

        await setAuthUserClaims(newUserId, {
            organizationId,
            role: 'Admin',
        });
        
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatar = `https://placehold.co/32x32/BDE0FE/4A4A4A.png?text=${initials}`;
        
        const newUser: Omit<AppUser, 'id'> = {
            name,
            email,
            role: 'Admin',
            avatar,
            organizationId,
            activityIsPublic: false,
            status: 'active',
            phone: ''
        };

        await createUserInFirestore(newUserId, newUser);

        const user = auth.currentUser;
        if(user && user.uid === newUserId) {
            await firebaseSendVerificationEmail(user);
        } else {
            console.warn("Could not send verification email: current user does not match new user.");
        }

    } catch (error: any) {
        console.error("Error in signupAction:", error);
        return { error: error.message || 'An unexpected error occurred during signup.' };
    }
}

export async function googleSignupAction(
    userData: { uid: string; displayName: string | null; email: string | null; photoURL: string | null; },
    organizationName: string
) {
    const { uid, displayName, email, photoURL } = userData;
    try {
        const appUser = await getUserById(uid);
        if (appUser && appUser.organizationId) {
            console.log(`User ${uid} already exists with an organization. Skipping creation.`);
            return { success: true, message: "User already exists." };
        }
        
        const organizationId = await createOrganization(organizationName);

        const newUser: Omit<AppUser, 'id'> = {
            name: displayName || 'New User',
            email: email || '',
            role: 'Admin', // Default role for new Google signups
            avatar: photoURL || `https://placehold.co/32x32/BDE0FE/4A4A4A.png?text=GU`,
            organizationId: organizationId,
            activityIsPublic: false,
            status: 'active',
            phone: ''
        };

        if (appUser) { // User exists but without an org
            await updateUser(uid, { organizationId });
        } else { // New user
            await createUserInFirestore(uid, newUser);
        }

        await setAuthUserClaims(uid, {
            organizationId,
            role: 'Admin',
        });

        return { success: true };

    } catch (error: any) {
        console.error("Error in googleSignupAction:", error);
        return { error: error.message || 'An unexpected error occurred during Google signup.' };
    }
}

export async function completeOrgCreationAction(userId: string, organizationName: string) {
    if (!userId || !organizationName) {
        return { error: "User ID and Organization Name are required." };
    }
    
    try {
        const user = await getUserById(userId);
        if (!user) {
            return { error: "User not found." };
        }
        if (user.organizationId) {
            return { success: true, message: "User already has an organization." };
        }

        const organizationId = await createOrganization(organizationName);

        await setAuthUserClaims(userId, {
            organizationId,
            role: user.role,
        });

        await updateUser(userId, { organizationId });

        return { success: true };
    } catch (error: any) {
        console.error("Error completing organization creation:", error);
        return { error: error.message || "Failed to create organization." };
    }
}
