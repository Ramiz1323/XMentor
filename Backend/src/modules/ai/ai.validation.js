import { z } from 'zod';

export const generateQaSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject is required'),
    topic: z.string().min(1, 'Topic is required'),
    difficulty: z.string().min(1, 'Difficulty is required'),
    count: z.number().min(1).max(20),
    language: z.string().min(1),
    classLevel: z.string().optional(),
    board: z.string().optional(),
    marksPerQ: z.number().optional(),
    isLengthy: z.boolean().optional(),
    type: z.enum(['MCQ', 'SUBJECTIVE']),
  }),
});
