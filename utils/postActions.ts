import { PageType, PostStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
const POST_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/post` || "http://localhost:3000/api/post";

export async function fetchPosts(status?: string, limit?: number) {
  try {
    const params = new URLSearchParams();

    if (status) {
      params.append("status", status);
    }

    if (limit) {
      params.append("limit", limit.toString());
    }

    const url = params.toString() ? `${POST_API_URL}?${params}` : POST_API_URL;

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const text = await res.text();
    try {
      const data = JSON.parse(text);

      if (!data || !Array.isArray(data.posts)) {
        console.error("Invalid data format:", data);
        return [];
      }

      return data.posts ?? [];
    } catch (jsonError) {
      console.error("Response is not valid JSON:", text);
      return [];
    }
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}


export async function fetchPostBySlug(slug: string) {
  try {
    const res = await fetch(`${POST_API_URL}?slug=${slug}`, { cache: "no-store" });

    // Check if response is JSON before parsing
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return data.posts[0];
    } catch (jsonError) {
      console.error("Response is not valid JSON:", text);
      return null;
    }
  } catch (error) {
    console.error("Error fetching post by slug", error);
    return null;
  }
}

export async function createPost(params: {
  title: string;
  content: string;
  description?: string;
  image?: string;
  categoryId?: string;
  authorId: string;
  status?: PostStatus;
  type?: PageType
}) {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized");
    const slug = generateSlug(params.title);

    const res = await fetch(POST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ ...params, slug }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error creating post:", error);
    return null;
  }
}


/**
 * Update a post
 */
export async function updatePost(data: any) {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Unauthorized");

    const res = await fetch(POST_API_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        id: data.id,
        title: data.title,
        slug: data.slug,
        content: data.content,
        description: data.description,
        image: data.image,
        status: data.status,
        categoryId: data.categoryId,
        type: data.type
      }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error updating post:", error);
    return null;
  }
}


/**
* Delete a post by ID
*/
export async function deletePost(id: string) {
  try {
    const token = localStorage.getItem("token");

    if (!token) throw new Error("Unauthorized");
    const res = await fetch(POST_API_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ id }),
    });
    return await res.json();
  } catch (error) {
    console.error("Error deleting post:", error);
    return null;
  }
}


// Function to generate a unique slug from the title
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end

  // Append a unique ID to avoid duplicate slugs
  return `${baseSlug}-${uuidv4().slice(0, 8)}`;
}