
'use server';

import { revalidatePath } from 'next/cache';
import {
  updateProject,
  deleteProject,
  getProjectById,
  addTaskToProject,
  updateTaskInProject,
  deleteTaskFromProject,
  getUserById,
  createNotification
} from '@/lib/firestore';
import type { Project, User, Task } from '@/lib/data';
import { redirect } from 'next/navigation';

export async function updateProjectAction(
  projectId: string,
  updates: Partial<Project>,
  currentUserId: string
) {
  try {
    const project = await getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const currentUser = await getUserById(currentUserId);
    if (!currentUser) throw new Error('User not found');
    
    // Authorization check
    if (currentUser.role !== 'Admin' && project.manager !== currentUser.id) {
       throw new Error("You don't have permission to update this project.");
    }
    
    const dataToUpdate: Partial<Project> = { ...updates };
    if (updates.status && updates.status !== project.status) {
        dataToUpdate.statusLastSetBy = currentUser.role;
    }

    await updateProject(projectId, dataToUpdate);
    revalidatePath(`/projects/view/${projectId}`);
    return { success: true };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    // Add authorization checks here if needed
    await deleteProject(projectId);
  } catch (error) {
    return { error: 'Failed to delete project.' };
  }
  redirect('/projects');
}


// --- Task Actions ---

export async function addTaskAction(
  projectId: string,
  creatorId: string,
  taskData: Omit<Task, 'id'>
) {
  try {
    // Authorization checks...
    const taskId = await addTaskToProject(projectId, taskData);
    revalidatePath(`/projects/view/${projectId}`);
    return { success: true, taskId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function updateTaskAction(
  projectId: string,
  taskId: string,
  currentUserId: string,
  updates: Partial<Omit<Task, 'id'>>
) {
  try {
     // Authorization checks...
    await updateTaskInProject(projectId, taskId, updates);
    revalidatePath(`/projects/view/${projectId}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function deleteTaskAction(
  projectId: string,
  taskId: string,
  currentUserId: string
) {
  try {
     // Authorization checks...
    await deleteTaskFromProject(projectId, taskId);
    revalidatePath(`/projects/view/${projectId}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function inviteUserToProjectAction(projectId: string, projectName: string, email: string) {
    return { success: true, message: 'Invitation functionality is not yet implemented.' };
}
