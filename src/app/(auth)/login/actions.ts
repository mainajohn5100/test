
'use server';

import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import { getUserByEmail } from '@/lib/firestore';

export async function checkUserExistsByEmail(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return !!user;
}

export async function sendPasswordResetEmailAction(email: string): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset link sent! Please check your email.' };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
        // To prevent email enumeration, we can return a generic success message
        return { success: true, message: 'If an account exists for this email, a reset link has been sent.' };
    }
    console.error("Error sending password reset email:", error);
    return { success: false, error: 'Failed to send password reset email. Please try again later.' };
  }
}

export async function sendVerificationEmailAction(): Promise<{ success: boolean; error?: string; message?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'You must be logged in to send a verification email.' };
  }
  
  try {
    await sendEmailVerification(user);
    return { success: true, message: 'Verification email sent! Please check your inbox.' };
  } catch (error: any) {
    console.error("Error sending verification email:", error);
     if (error.code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many requests. Please try again later.' };
    }
    return { success: false, error: 'Failed to send verification email.' };
  }
}
