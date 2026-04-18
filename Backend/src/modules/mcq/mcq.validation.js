import { z } from 'zod';

const questionSchema = z.object({
  q: z.string().min(1, 'Question text cannot be empty'),
  options: z.array(z.string()).length(4, 'Exactly 4 options are required'),
  correct: z.number().int().min(0).max(3, 'Correct index must be 0-3'),
  explanation: z.string().optional(),
});

export const createTestSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, 'Title is too short'), // Trim before min
    subject: z.enum(['MATHS', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'CODING', 'OTHERS']),
    communityId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Community ID'),
    duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
  }),
});

export const submitTestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Test ID'),
  }),
  body: z.object({
    answers: z.array(z.number().int().min(0).max(3)),
    timeTaken: z.number().int().min(1, 'Time taken is required'),
  }),
});
