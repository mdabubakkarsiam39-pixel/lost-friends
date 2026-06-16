import { z } from 'zod';

export const friendRequestSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1),
  }),
});

export const friendActionSchema = z.object({
  body: z.object({
    friendId: z.string().min(1),
  }),
});
