
'use server';

import { revalidatePath } from 'next/cache';
import { createNotification, getProjectById, updateProject, deleteProject } from '@/lib/firestore';
import type { Project } from '@/lib/data';
import { redirect } from 'next/navigation';

export async function updateProjectAction(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>,
) {
  try {
    const dataToUpdate: { [key: string]: any } = {};
    if (updates.status) dataToUpdate.status = updates.status;
    
    // Only proceed if there are actual changes
    if (Object.keys(dataToUpdate).length > 0) {
      await updateProject(projectId, dataToUpdate);

      // After successful update, create notification
      const project = await getProjectById(projectId);
      if (project && project.manager && updates.status) {
          await createNotification({
            userId: project.manager, // manager is a userId
            title: `Project Status Updated`,
            description: `Status for project "${project.name}" was changed to ${updates.status}.`,
            link: `/projects/view/${projectId}`,
        });
      }
    }

    revalidatePath(`/projects/view/${projectId}`);
    revalidatePath('/projects', 'layout');
    revalidatePath('/dashboard');

    return { success: true, message: 'Project updated successfully.' };
  } catch (error) {
    console.error("Error in updateProjectAction:", error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update project.';
    return { success: false, error: errorMessage };
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    await deleteProject(projectId);
    revalidatePath('/projects', 'layout');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error("Error in deleteProjectAction:", error);
    return {
      error: 'Failed to delete project. Please try again.',
    };
  }
  redirect('/projects/all');
}
