
import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required."),
  description: z.string().optional(),
  manager: z.string().min(1, "A project manager must be assigned."),
  team: z.array(z.string()).optional(),
  deadline: z.date({
    required_error: "A deadline is required.",
  }),
});
