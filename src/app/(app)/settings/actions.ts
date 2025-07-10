
'use server';

import { z } from 'zod';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { revalidatePath } from 'next/cache';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
}).refine(data => data.currentPassword !== data.newPassword, {
  message: "New password must be different from the current password.",
  path: ["newPassword"],
});

export async function changePasswordAction(values: z.infer<typeof passwordSchema>) {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'No authenticated user found or user is missing an email address.' };
    }

    const validated = passwordSchema.safeParse(values);
    if (!validated.success) {
      const issues = validated.error.flatten().fieldErrors;
      const errorMessage = Object.values(issues).flat().join(' ');
      return { success: false, error: errorMessage || "Invalid data provided." };
    }

    const { currentPassword, newPassword } = validated.data;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    // Re-authenticate before changing the password
    await reauthenticateWithCredential(user, credential);
    
    // Actually update the password in Firebase Auth
    await updatePassword(user, newPassword);

    return { success: true, message: "Password updated successfully." };
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        return { success: false, error: 'The current password you entered is incorrect.' };
    }
    console.error("Error changing password:", error);
    return { success: false, error: 'An unexpected error occurred while changing the password.' };
  }
}

export async function reauthenticateAction(password: string): Promise<{success: boolean, error?: string}> {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'No authenticated user found.' };
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { success: false, error: 'Incorrect password.' };
    }
    console.error("Re-authentication error:", error);
    return { success: false, error: 'Re-authentication failed.' };
  }
}
