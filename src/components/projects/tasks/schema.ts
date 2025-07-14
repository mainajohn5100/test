
import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required."),
  status: z.enum(['todo', 'in-progress', 'completed']),
  assignedTo: z.string().nullable(),
  dueDate: z.date().nullable(),
});
