import { ApiResponse } from '@/app/types';
import { postSchema, updatePostSchema } from '@/schemas/postSchema';
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
export async function createPost(input: z.infer<typeof postSchema>): Promise<ApiResponse<any>> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { success: false, error: 'Unauthorized' };

    const validated = postSchema.parse(input);

    // Check for duplicate title
    const isDuplicate = await checkDuplicateTitle(validated.title);
    if (isDuplicate) {
      return {
        success: false,
        error: 'A post with this title already exists. Please choose a different title.'
      };
    }

    const slug = generateSlug(validated.title);

    const res = await fetch(POST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...validated, slug }),
    });

    const data = await res.json();

    if (res.ok) {
      return { success: true, post: data.post };
    } else {
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        validationErrors: err.errors,
      };
    }

    return {
      success: false,
      error: 'Unexpected error occurred while creating post',
    };
  }
}

// Update an existing post, validating with updatePostSchema
export async function updatePost(input: z.infer<typeof updatePostSchema>): Promise<ApiResponse<any>> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = updatePostSchema.parse(input);

    const res = await fetch(POST_API_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(validated),
    });

    const data = await res.json();

    if (res.ok) {
      return { success: true, post: data.post };
    } else {
      return { success: false, error: data.error || 'Failed to update post' };
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        validationErrors: err.errors,
      };
    }

    return {
      success: false,
      error: 'Unexpected error occurred while updating the post',
    };
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

// Utility: generate clean slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Check if a post with the same title already exists
async function checkDuplicateTitle(title: string): Promise<boolean> {
  try {
    const posts = await fetchPosts();
    return posts.some((post: any) => post.title.toLowerCase().trim() === title.toLowerCase().trim());
  } catch (error) {
    console.error('Error checking duplicate title:', error);
    return false;
  }
}
