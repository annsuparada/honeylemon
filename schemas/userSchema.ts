import { z } from 'zod'

export const userSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  bio: z.string().optional(),
  name: z.string().optional(),
  lastName: z.string().optional(),
  profilePicture: z.string().url().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
})

export const editUserSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email('Invalid email address').optional(),
  newEmail: z.string().email("Invalid new email address").optional(),
  bio: z.string().optional(),
  name: z.string().optional(),
  lastName: z.string().optional(),
  profilePicture: z.string().url().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
})

export const deleteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
});