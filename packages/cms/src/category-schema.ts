import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(3, 'Category name must be at least 3 characters long'),
  slug: z.string().optional(),
});

export type Category = z.infer<typeof categorySchema>;
