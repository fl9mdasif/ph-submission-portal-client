import { z } from 'zod';

const registerSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z.string({ message: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
  }),
});

export const authValidations = { registerSchema, loginSchema };
