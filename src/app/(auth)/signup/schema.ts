
import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2, "Your name must be at least 2 characters."),
  organizationName: z.string().min(2, "Organization name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});
