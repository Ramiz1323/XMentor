import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    profilePic: z.string().url('Invalid image URL').optional(),
    boardInfo: z.object({
      board: z.enum(['CBSE', 'WB', 'ICSE', 'NONE']),
      class: z.string(),
      subjects: z.array(z.string()),
    }).optional(),
    devProfile: z.object({
      github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
      skills: z.array(z.string()),
    }).optional(),
  }),
});
