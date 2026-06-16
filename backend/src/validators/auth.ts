import { z } from 'zod';

export const syncUserSchema = z.object({
  body: z.object({
    clerkId: z.string().min(1, 'Clerk ID is required'),
    username: z.string().min(3).max(30),
    email: z.string().email(),
    fullName: z.string().min(1).max(100),
    avatar: z.string().optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30).optional(),
    fullName: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    avatar: z.string().optional(),
  }),
});