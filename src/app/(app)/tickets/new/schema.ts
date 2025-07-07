import { z } from 'zod';

export const ticketSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  reporter: z.string().min(1, "Customer Name is required."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  project: z.string().optional(),
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
