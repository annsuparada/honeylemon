import { PageType, PostStatus } from '@prisma/client';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z.string().optional(), // Optional, auto-generated if not provided
  content: z.string().min(10, "Content must be at least 10 characters long"),
  description: z.string().optional(),
  image: z.string().url("Invalid image URL").optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  authorId: z.string().min(1, "Author ID is required"),
  status: z.nativeEnum(PostStatus).optional(),
  type: z.nativeEnum(PageType),
  tagIds: z.array(z.string()).optional(), // Array of tag IDs
  faqs: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
  })).optional(),
  itemListItems: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().url("Invalid URL"),
  })).optional(),
});


export const updatePostSchema = z.object({
  id: z.string().min(1, "Post ID is required"),
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters long"),
  description: z.string().optional(),
  image: z.string().url("Invalid image URL").optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  status: z.nativeEnum(PostStatus).optional(),
  type: z.nativeEnum(PageType),
  tagIds: z.array(z.string()).optional(), // Array of tag IDs
  faqs: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
  })).optional(),
  itemListItems: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    url: z.string().url("Invalid URL"),
  })).optional(),
});

export { postSchema };
