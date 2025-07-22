
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
  getUserByEmail,
  getOrganizationById,
  getTaskById
} from '@/lib/firestore';
import type { Project, Task, User } from '@/lib/data';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { taskSchema } from '@/components/projects/tasks/schema';
import { sendEmail } from '@/lib/email';
import { auth } from '@/lib/firebase';
import { projectEditSchema } from '@/components/projects/schema';

export async function inviteUserToProjectAction(projectId: string, projectName: string, email: string) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        return { success: false, error: "You must be logged in to invite users." };
    }
    
    // Check if user already exists
    let invitedUser = await getUserByEmail(email);
    let organizationId = '';

    if (invitedUser) {
        organizationId = invitedUser.organizationId;
        
        // If user exists and is already in the project, do nothing.
        const project = await getProjectById(projectId);
        if (project?.team?.includes(invitedUser.id)) {
            return { success: true, message: "User is already on this project." };
        }
    } else {
        const adminUser = await getUserById(currentUser.uid);
        if (!adminUser) return { success: false, error: "Could not find your user profile." };
        organizationId = adminUser.organizationId;
    }

    const org = await getOrganizationById(organizationId);
    if (!org) {
        return { success: false, error: "Could not find organization details." };
    }

    const template = org.settings?.emailTemplates?.projectInvite;
    if (!template) {
        return { success: false, error: "Project invitation email template is not configured." };
    }

    try {
        await sendEmail({
            to: email,
            subject: `You've been invited to the project: ${projectName}`,
            template: template,
            data: {
                project: { name: projectName },
                user: { name: email }, // a placeholder for the email content
                inviter: { name: currentUser.displayName || currentUser.email },
                link: `${process.env.NEXT_PUBLIC_BASE_URL}/login`
            }
        });

        // The workflow assumes the user will be added to the team manually after they sign up/sign in.
        // A more advanced workflow would involve invitation tokens.
        return { success: true, message: 'Invitation sent successfully.' };

    } catch (error) {
        console.error("Error in inviteUserToProjectAction:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send invitation.';
        return { success: false, error: errorMessage };
    }
}


export async function updateProjectAction(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'createdAt'>>,
  currentUserId: string,
) {
  try {
    const [currentProject, user] = await Promise.all([
        getProjectById(projectId),
        getUserById(currentUserId)
    ]);
    
    if (!currentProject) throw new Error("Project not found.");
    if (!user) throw new Error("Current user not found.");
    
    const dataToUpdate: { [key: string]: any } = {};
    
    // Handle specific updates from various actions
    if (updates.status) dataToUpdate.status = updates.status;
    if (updates.ticketsEnabled !== undefined) dataToUpdate.ticketsEnabled = updates.ticketsEnabled;
    if (updates.teamCanEditTasks !== undefined) dataToUpdate.teamCanEditTasks = updates.teamCanEditTasks;
    if (updates.team) dataToUpdate.team = updates.team;
    if (updates.stakeholders) dataToUpdate.stakeholders = updates.stakeholders;
    
    // Handle updates from the edit form
    if (updates.name) dataToUpdate.name = updates.name;
    if (updates.description) dataToUpdate.description = updates.description;
    if (updates.budget !== undefined) dataToUpdate.budget = updates.budget;
    if (updates.deadline) dataToUpdate.deadline = updates.deadline;

    if (updates.status) {
        dataToUpdate.statusLastSetBy = user.role;
    }
    
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

  const isAdmin = currentUser.role === 'Admin';
  const isCreator = project.creatorId === currentUserId;
  const isTeamMemberAndAllowed = project.teamCanEditTasks === true && project.team.includes(currentUserId);

  return isAdmin || isCreator || isTeamMemberAndAllowed;
}

export async function addTaskAction(projectId: string, currentUserId: string, values: z.infer<typeof taskSchema>) {
  if (!(await canModifyTasks(projectId, currentUserId))) {
    return { success: false, error: "You don't have permission to add tasks to this project." };
  }
  
  try {
    const validated = taskSchema.safeParse(values);
    if (!validated.success) return { success: false, error: "Invalid task data." };

    const newTaskId = await addTaskToProject(projectId, validated.data);

    if (validated.data.assignedTo) {
        const project = await getProjectById(projectId);
        await createNotification({
            userId: validated.data.assignedTo,
            title: `New Task Assigned on Project: ${project?.name}`,
            description: `You've been assigned the task: "${validated.data.title}"`,
            link: `/projects/view/${projectId}`
        });
    }

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
    const oldTask = await getTaskById(projectId, taskId);
    await updateTaskInProject(projectId, taskId, updates);

    // If assignee changes, notify the new assignee
    if (updates.assignedTo && updates.assignedTo !== oldTask?.assignedTo) {
        const project = await getProjectById(projectId);
        const task = await getTaskById(projectId, taskId); // Get updated task to be sure
        await createNotification({
            userId: updates.assignedTo,
            title: `You've been assigned a task on: ${project?.name}`,
            description: `You are now the assignee for task: "${task?.title}"`,
            link: `/projects/view/${projectId}`
        });
    }

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
