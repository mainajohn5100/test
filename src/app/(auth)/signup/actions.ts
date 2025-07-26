

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { signupSchema } from './schema';
import { createOrganization, createUserInFirestore, setAuthUserClaims, sendVerificationEmail, createUserInAuth, getUserById } from '@/lib/firestore';
import type { User as AppUser } from '@/lib/data';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function signupAction(values: z.infer<typeof signupSchema>) {
    const validatedFields = signupSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }

    const { name, organizationName, email, password } = validatedFields.data;
    
    let newUserId: string;
    try {
        // Step 1: Create the user in Firebase Auth
        newUserId = await createUserInAuth(email, password);

        // Step 2: Create the organization
        const organizationId = await createOrganization(organizationName);

        // Step 3: Set custom claims for the new user (for multi-tenancy)
        await setAuthUserClaims(newUserId, {
            organizationId,
            role: 'Admin',
        });
        
        // Step 4: Create the user profile in Firestore
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

        // Step 5: Send verification email
        await sendVerificationEmail(newUserId);

    } catch (error: any) {
        console.error("Error in signupAction:", error);
        return { error: error.message || 'An unexpected error occurred during signup.' };
    }
    
    // Don't redirect here, let the client-side handle it.
    // The user needs to verify their email first.
}

export async function googleSignupAction(user: FirebaseUser, organizationName: string) {
    const { uid, displayName, email, photoURL } = user;

    try {
        const appUser = await getUserById(uid);
        if (appUser) {
            console.log(`User ${uid} already exists. Skipping creation.`);
            return { success: true, message: "User already exists." };
        }

        const organizationId = await createOrganization(organizationName);

        await setAuthUserClaims(uid, {
            organizationId,
            role: 'Admin',
        });
        
        const newUser: Omit<AppUser, 'id'> = {
            name: displayName || 'New User',
            email: email || '',
            role: 'Admin',
            avatar: photoURL || `https://placehold.co/32x32/BDE0FE/4A4A4A.png?text=GU`,
            organizationId,
            activityIsPublic: false,
            status: 'active',
            phone: ''
        };

        await createUserInFirestore(uid, newUser);
        return { success: true };

    } catch (error: any) {
        console.error("Error in googleSignupAction:", error);
        return { error: error.message || 'An unexpected error occurred during Google signup.' };
    }
}
