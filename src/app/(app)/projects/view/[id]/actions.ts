
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
    const currentProject = await getProjectById(projectId);
    if (!currentProject) {
        throw new Error("Project not found.");
    }
    
    const dataToUpdate: { [key: string]: any } = {};
    if (updates.status) dataToUpdate.status = updates.status;
    if (updates.ticketsEnabled !== undefined) dataToUpdate.ticketsEnabled = updates.ticketsEnabled;
    if (updates.team) dataToUpdate.team = updates.team;
    
    // Only proceed if there are actual changes
    if (Object.keys(dataToUpdate).length > 0) {
      await updateProject(projectId, dataToUpdate);

      // --- Notification Logic ---
      // Status change notification for manager
      if (currentProject.manager && updates.status) {
          await createNotification({
            userId: currentProject.manager,
            title: `Project Status Updated`,
            description: `Status for project "${currentProject.name}" was changed to ${updates.status}.`,
            link: `/projects/view/${projectId}`,
        });
      }

      // New team member notification
      if (updates.team) {
          const oldTeam = new Set(currentProject.team);
          const newTeamMembers = updates.team.filter(memberId => !oldTeam.has(memberId));
          
          if (newTeamMembers.length > 0) {
            const teamNotifications = newTeamMembers.map(userId => 
                createNotification({
                    userId: userId,
                    title: `You've been added to a project`,
                    description: `You are now a team member on the project: "${currentProject.name}".`,
                    link: `/projects/view/${projectId}`,
                })
            );
            await Promise.all(teamNotifications);
          }
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
