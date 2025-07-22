
'use server';

import { z } from 'zod';
import { addProject, createNotification, getUserById } from '@/lib/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { projectSchema } from './schema';

export async function createProjectAction(values: z.infer<typeof projectSchema>) {
  
  const creator = await getUserById(values.creatorId);
  if (!creator) {
    return { error: 'Could not find the user creating the project.' };
  }

  const projectData = {
    name: values.name,
    description: values.description || '',
    manager: values.manager,
    team: values.team || [],
    deadline: values.deadline,
    budget: values.budget,
    creatorId: values.creatorId,
    organizationId: creator.organizationId,
    teamCanEditTasks: false, // Default to false
    statusLastSetBy: creator.role,
  };

  let newProjectId: string;
  try {
    newProjectId = await addProject(projectData);

    await createNotification({
        userId: projectData.manager,
        title: `You are now managing: "${projectData.name}"`,
        description: `A new project has been created and you have been assigned as the manager.`,
        link: `/projects/view/${newProjectId}`,
    });

    // Notifications for team members
    if (projectData.team.length > 0) {
      const teamNotifications = projectData.team.map(userId => 
          createNotification({
              userId: userId,
              title: `You've been added to a new project`,
              description: `You are now a team member on the project: "${projectData.name}".`,
              link: `/projects/view/${newProjectId}`,
          })
      );
      await Promise.all(teamNotifications);
    }

    revalidatePath('/projects', 'layout');
    revalidatePath('/dashboard');
    
  } catch (error) {
    console.error("Error in createProjectAction:", error);
    return {
      error: 'Failed to create project in the database. Please try again.',
    };
  }

  redirect(`/projects/view/${newProjectId}`);
}
