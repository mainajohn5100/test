

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { signupSchema } from './schema';
import { createOrganization, createUserInAuth, createUserInFirestore, setAuthUserClaims } from '@/lib/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/data';

export async function signupAction(values: z.infer<typeof signupSchema>) {
    const validatedFields = signupSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }

    const { name, organizationName, email, password } = validatedFields.data;
    
    try {
        // Step 1: Create the organization
        const organizationId = await createOrganization(organizationName);

        // Step 2: Create the user in Firebase Auth
        const newUserId = await createUserInAuth(email, password);

        // Step 3: Set custom claims for the new user (for multi-tenancy)
        await setAuthUserClaims(newUserId, {
            organizationId,
            role: 'Admin',
        });
        
        // Step 4: Create the user profile in Firestore
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const avatar = `https://placehold.co/32x32/BDE0FE/4A4A4A.png?text=${initials}`;
        
        const newUser: Omit<User, 'id'> = {
            name,
            email,
            role: 'Admin',
            avatar,
            organizationId,
            activityIsPublic: false,
            phone: '',
            country: '',
            city: '',
            zipCode: '',
            dob: '',
            gender: 'Prefer not to say',
            createdByAdmin: false,
        };

        await createUserInFirestore(newUserId, newUser);

        // Step 5: Log the user in after successful signup
        await signInWithEmailAndPassword(auth, email, password);

    } catch (error: any) {
        console.error("Error in signupAction:", error);
        return { error: error.message || 'An unexpected error occurred during signup.' };
    }
    
    redirect('/dashboard');
}
