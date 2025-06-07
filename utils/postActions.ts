import { postSchema, updatePostSchema } from '@/schemas/postSchema';
import { PageType, PostStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const POST_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/post` || 'http://localhost:3000/api/post';

// Fetch multiple posts with optional filters
export async function fetchPosts(status?: string, limit?: number) {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());

    const url = params.toString() ? `${POST_API_URL}?${params}` : POST_API_URL;
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    const text = await res.text();

    try {
      const data = JSON.parse(text);
      if (!data || !Array.isArray(data.posts)) return [];
      return data.posts;
    } catch {
      console.error('Response is not valid JSON:', text);
      return [];
    }
  } catch (err) {
    console.error('Error fetching posts:', err);
    return [];
  }
}

// Fetch a single post by slug
export async function fetchPostBySlug(slug: string) {
  try {
    const res = await fetch(`${POST_API_URL}?slug=${slug}`, { cache: 'no-store' });
    const text = await res.text();

    try {
      const data = JSON.parse(text);
      return data.posts?.[0] ?? null;
    } catch {
      console.error('Invalid JSON from post fetch:', text);
      return null;
    }
  } catch (err) {
    console.error('Error fetching post by slug:', err);
    return null;
  }
}

// Create a new post, validating with postSchema
export async function createPost(input: z.infer<typeof postSchema>) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized');

    // Validate client-side input
    const validated = postSchema.parse(input);
    const slug = generateSlug(validated.title);

    const res = await fetch(POST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...validated, slug }),
    });

    return await res.json();
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Validation failed:', err.errors);
    } else {
      console.error('Error creating post:', err);
    }
    return null;
  }
}

// Update an existing post, validating with updatePostSchema
export async function updatePost(input: z.infer<typeof updatePostSchema>) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized');

    // Validate client-side input
    const validated = updatePostSchema.parse(input);

    const res = await fetch(POST_API_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(validated),
    });

    return await res.json();
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Validation failed:', err.errors);
    } else {
      console.error('Error updating post:', err);
    }
    return null;
  }
}

// Delete a post by ID
export async function deletePost(id: string) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized');

    const res = await fetch(POST_API_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id }),
    });

    return await res.json();
  } catch (err) {
    console.error('Error deleting post:', err);
    return null;
  }
}

// Utility: generate unique slug
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseSlug}-${uuidv4().slice(0, 8)}`;
}
