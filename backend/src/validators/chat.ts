import { z } from 'zod';

export const createChatSchema = z.object({
  body: z.object({
    participantId: z.string().min(1),
  }),
});

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    participants: z.array(z.string()).min(1),
  }),
});

export const joinByInviteSchema = z.object({
  body: z.object({
    inviteToken: z.string().min(1),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    memberId: z.string().min(1),
  }),
});
