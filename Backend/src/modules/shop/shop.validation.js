import { z } from 'zod';

export const buyItemSchema = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
  }),
});

export const consumePerkSchema = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
  }),
});
