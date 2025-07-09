import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.enum(['Admin', 'Agent', 'Customer']),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  email: z.string().email("Invalid email address.").optional(),
  phone: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
  dob: z.date().optional(),
  gender: z.enum(['', 'Male', 'Female', 'Other', 'Prefer not to say']).optional(),
});
