
'use server';

import { z } from 'zod';
import { addProject, createNotification } from '@/lib/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { projectSchema } from './schema';

export async function createProjectAction(values: z.infer<typeof projectSchema>) {
  const projectData = {
    name: values.name,
    description: values.description || '',
    manager: values.manager,
    team: [],
    deadline: values.deadline,
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
