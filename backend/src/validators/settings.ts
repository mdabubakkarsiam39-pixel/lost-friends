import { z } from 'zod';

export const updateSettingsSchema = z.object({
  body: z.object({
    readReceipts: z.boolean().optional(),
    showOnlineStatus: z.boolean().optional(),
    showLastSeen: z.boolean().optional(),
    showTypingIndicators: z.boolean().optional(),
  }),
});
