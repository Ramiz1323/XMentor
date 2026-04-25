import { z } from 'zod';

export const createCommunitySchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    description: z.string()
      .max(300, 'Description cannot exceed 300 characters')
      .optional(),
    type: z.enum(['BOARD', 'DEV'], {
      errorMap: () => ({ message: 'Type must be either BOARD or DEV' }),
    }),
    accessCode: z.string().optional(),
    maxMembers: z.number().int().min(1).max(1000).optional(),
    alias: z.string().min(2).max(30).optional(),
  }),
});

export const joinCommunitySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Community ID'),
  }),
  body: z.object({
    accessCode: z.string().optional(),
    alias: z.string().trim().min(2, 'Alias must be at least 2 characters').max(30, 'Alias cannot exceed 30 characters').optional(),
  }),
});

export const leaveCommunitySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Community ID'),
  }),
});
