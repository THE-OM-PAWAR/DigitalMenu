import { z } from 'zod';

export const SignUpSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').max(50, 'Username must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const OutletSchema = z.object({
  name: z.string().min(2, 'Outlet name must be at least 2 characters').max(100, 'Outlet name must be less than 100 characters'),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
export type OutletInput = z.infer<typeof OutletSchema>;