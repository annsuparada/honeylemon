import { NextResponse } from "next/server";
import { PageType, PostStatus } from "@prisma/client";
import { z } from "zod";
import { postSchema, updatePostSchema } from "@/schemas/postSchema";
import { verifyToken } from "@/utils/auth";
import { buildPostFilter, getPosts, createPost, updatePost, deletePost } from "@/lib/services/postService";

// GET: Retrieve all posts, by slug, by category, by status (Public Access)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const statusParam = searchParams.get("status");
        const categoryParam = searchParams.get("category");
        const limitParam = searchParams.get("limit");
        const typeParam = searchParams.get("type");
        const featuredParam = searchParams.get("featured");
        const trendingParam = searchParams.get("trending");

        const validStatuses = Object.values(PostStatus);
        const status = validStatuses.includes(statusParam as PostStatus)
            ? (statusParam as PostStatus)
            : undefined;

        const validPageTypes = Object.values(PageType);
        const type = validPageTypes.includes(typeParam as PageType)
            ? (typeParam as PageType)
            : undefined;

        const filter = await buildPostFilter({
            slug: slug || undefined,
            status,
            category: categoryParam || undefined,
            type,
            featured: featuredParam === "true",
            trending: trendingParam === "true",
        });

        // If filter is null, category doesn't exist, return empty array
        if (filter === null) {
            return NextResponse.json({ success: true, posts: [] }, { status: 200 });
        }

        const limit = limitParam ? parseInt(limitParam) : undefined;
        const posts = await getPosts(filter, limit);

        return NextResponse.json({ success: true, posts }, { status: 200 });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }
}

// POST: Create a new post (Protected)
export async function POST(req: Request) {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ error: "Unauthorized - No Token Provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();

        // Validate request body using Zod
        const validatedData = postSchema.parse(body);

        // Create post using service
        const newPost = await createPost(validatedData, decoded.id);

        return NextResponse.json({ success: true, post: newPost }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        if (error instanceof Error) {
            if (error.message === "Slug already exists") {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
        }

        console.error("Error creating post:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}

// PATCH: Update a post (by ID) (Protected)
export async function PATCH(req: Request) {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ error: "Unauthorized - No Token Provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();

        // Validate input
        const validatedData = updatePostSchema.parse(body);

        // Update post using service
        const updatedPost = await updatePost(validatedData);

        return NextResponse.json({ success: true, post: updatedPost }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        if (error instanceof Error) {
            if (error.message === "Post not found") {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
        }

        console.error("Error updating post:", error);
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
}

// DELETE: Remove a post by ID (Protected)
export async function DELETE(req: Request) {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ error: "Unauthorized - No Token Provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Validate input
        const schema = z.object({
            id: z.string().min(1, "Post ID is required"),
        });

        const validatedData = schema.parse(body);

        // Delete post using service
        await deletePost(validatedData.id);

        return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        if (error instanceof Error) {
            if (error.message === "Post not found") {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
        }

        console.error("Error deleting post:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}