
import { z } from 'zod';

export const projectEditSchema = z.object({
  name: z.string().min(1, "Project name is required."),
  description: z.string().optional(),
  deadline: z.date({
    required_error: "A deadline is required.",
  }),
  budget: z.number().min(0, "Budget must be a positive number.").optional(),
});
