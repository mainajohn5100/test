import { z } from 'zod';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from the current password.",
  path: ["newPassword"],
});

// Helper to get user-friendly Firebase error messages
function getFirebaseAuthError(error: any): string {
    switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'The password you entered is incorrect. Please try again.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/weak-password':
            return 'The new password is too weak. Please use at least 6 characters.';
        case 'auth/requires-recent-login':
            return 'This action is sensitive and requires a recent login. Please re-authenticate.';
        default:
            return error.message || 'An unexpected error occurred.';
    }
}

/**
 * Re-authenticates the current user with their password.
 * This is a client-side function.
 * @param password The user's current password.
 * @returns A promise that resolves with a success or error object.
 */
export async function reauthenticateUser(password: string): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    return { success: false, error: 'No authenticated user found or user is missing an email address.' };
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: getFirebaseAuthError(error) };
  }
}

/**
 * Changes the current user's password.
 * This is a client-side function and should be called after successful re-authentication.
 * @param newPassword The new password for the user.
 * @returns A promise that resolves with a success or error object.
 */
export async function changeUserPassword(newPassword: string): Promise<{ success: boolean; error?: string, message?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'No authenticated user found.' };
  }

  try {
    await updatePassword(user, newPassword);
    return { success: true, message: 'Password updated successfully.' };
  } catch (error: any) {
    return { success: false, error: getFirebaseAuthError(error) };
  }
}
