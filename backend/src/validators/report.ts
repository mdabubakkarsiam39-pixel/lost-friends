import { z } from 'zod';

export const createReportSchema = z.object({
  body: z.object({
    targetType: z.enum(['user', 'message', 'chat']),
    targetId: z.string().min(1),
    reason: z.string().min(1, 'Reason is required').max(200),
    description: z.string().max(1000).optional(),
  }),
});

export const updateReportStatusSchema = z.object({
  body: z.object({
    status: z.enum(['reviewed', 'resolved']),
  }),
});
