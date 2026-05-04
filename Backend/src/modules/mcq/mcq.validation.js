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
    subject: z.enum([
      'MATHS', 'SCIENCE', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 
      'HISTORY', 'GEOGRAPHY', 'ENGLISH', 'BENGALI', 'HINDI', 
      'EVS', 'SOCIAL_SCIENCE', 'COMPUTER', 'CODING', 'OTHERS'
    ]),
    communityId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Community ID').optional(),
    assignedStudents: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
    hasTimer: z.boolean().optional(),
    deadline: z.string().datetime({ message: 'Invalid deadline format' }),
    language: z.enum(['english', 'bengali']).optional().default('english'),
    pauseLimit: z.number().int().min(0).optional().default(0),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
  }),
});

export const submitTestSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Test ID'),
  }),
  body: z.object({
    answers: z.array(z.number().int().min(-1).max(3)),
    timeTaken: z.number().int().min(1, 'Time taken is required'),
  }),
});
