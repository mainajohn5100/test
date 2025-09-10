
'use server';

import { revalidatePath } from 'next/cache';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { updateOrganization } from '@/lib/firestore';

export async function updateOrganizationAction(orgId: string, formData: FormData) {
  try {
    const updateData: { [key: string]: any } = {};

    const name = formData.get('name') as string;
    const domain = formData.get('domain') as string;
    if (name) updateData.name = name;
    if (domain) updateData.domain = domain;

    const logoFile = formData.get('logo') as File | null;
    if (logoFile && logoFile.size > 0) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(logoFile.type)) {
        return { success: false, error: 'Invalid file type for logo.' };
      }
      
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (logoFile.size > maxSize) {
        return { success: false, error: 'Logo file is too large (max 2MB).' };
      }

      const timestamp = Date.now();
      const sanitizedFileName = logoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `org-logos/${orgId}/${timestamp}-${sanitizedFileName}`;
      
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, logoFile);
      const logoUrl = await getDownloadURL(storageRef);
      updateData.logo = logoUrl;
    }

    if (Object.keys(updateData).length > 0) {
        await updateOrganization(orgId, updateData);
    } else {
        return { success: true, message: "No changes to save." };
    }
    
    revalidatePath('/organization');
    return { success: true, message: "Organization updated successfully." };

  } catch (error) {
    console.error("Error updating organization:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
