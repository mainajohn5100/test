
'use server';

import { revalidatePath } from 'next/cache';
import { 
  createNotification, 
  getProjectById, 
  updateProject, 
  deleteProject,
  addTaskToProject,
  updateTaskInProject,
  deleteTaskFromProject,
  getUserById,
} from '@/lib/firestore';
import type { Project, Task } from '@/lib/data';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { taskSchema } from '@/components/projects/tasks/schema';

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


async function canModifyTasks(projectId: string, currentUserId: string): Promise<boolean> {
  const project = await getProjectById(projectId);
  const currentUser = await getUserById(currentUserId);

  if (!project || !currentUser) return false;

  const isCreator = project.creatorId === currentUserId;
  const isAdmin = currentUser.role === 'Admin';
  const isAgent = currentUser.role === 'Agent';

  return isCreator || isAdmin || isAgent;
}

export async function addTaskAction(projectId: string, currentUserId: string, values: z.infer<typeof taskSchema>) {
  if (!(await canModifyTasks(projectId, currentUserId))) {
    return { success: false, error: "You don't have permission to add tasks to this project." };
  }
  
  try {
    const validated = taskSchema.safeParse(values);
    if (!validated.success) return { success: false, error: "Invalid task data." };

    await addTaskToProject(projectId, validated.data);
    revalidatePath(`/projects/view/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in addTaskAction:", error);
    return { success: false, error: "Failed to add task." };
  }
}

export async function updateTaskAction(projectId: string, taskId: string, currentUserId: string, updates: Partial<Task>) {
  if (!(await canModifyTasks(projectId, currentUserId))) {
    return { success: false, error: "You don't have permission to update tasks in this project." };
  }

  try {
    await updateTaskInProject(projectId, taskId, updates);
    revalidatePath(`/projects/view/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in updateTaskAction:", error);
    return { success: false, error: "Failed to update task." };
  }
}

export async function deleteTaskAction(projectId: string, taskId: string, currentUserId: string) {
  if (!(await canModifyTasks(projectId, currentUserId))) {
    return { success: false, error: "You don't have permission to delete tasks from this project." };
  }

  try {
    await deleteTaskFromProject(projectId, taskId);
    revalidatePath(`/projects/view/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteTaskAction:", error);
    return { success: false, error: "Failed to delete task." };
  }
}
