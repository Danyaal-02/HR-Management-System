import { z } from 'zod';

export const signInSchema = z.object({
  loginId: z.string().min(1, 'Login ID or Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  phone: z.string().min(1, 'Phone number is required').regex(/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/, 'Must include uppercase, lowercase, number & special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
