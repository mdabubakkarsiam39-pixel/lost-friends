import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    chatId: z.string().min(1),
    type: z.enum(['text', 'image', 'video', 'file', 'voice']).optional(),
    content: z.string().min(1, 'Message content is required'),
    mediaUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    duration: z.number().optional(),
    replyTo: z.string().optional(),
  }),
});

export const editMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required').max(5000),
  }),
});

export const reactionSchema = z.object({
  body: z.object({
    emoji: z.string().min(1).max(10),
  }),
});

export const forwardMessageSchema = z.object({
  body: z.object({
    targetChatId: z.string().min(1),
  }),
});