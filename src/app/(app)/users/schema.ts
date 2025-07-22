
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.enum(['Admin', 'Agent', 'Client']),
});

export const userCreateSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters."),
    role: z.enum(['Agent', 'Client'], { required_error: "A role must be selected." }),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
});
