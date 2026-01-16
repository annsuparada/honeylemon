import { NextResponse } from "next/server";
import { PageType, PostStatus } from "@prisma/client";
import { z } from "zod";
import { postSchema, updatePostSchema } from "@/schemas/postSchema";
import { verifyToken } from "@/utils/helpers/auth";
import { buildPostFilter, getPosts, createPost, updatePost, deletePost } from "@/lib/services/postService";
import { handleError, successResponse, UnauthorizedError } from "@/lib/middleware/errorHandler";

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
            return successResponse({ posts: [] }, 200);
        }

        const limit = limitParam ? parseInt(limitParam) : undefined;
        const posts = await getPosts(filter, limit);

        return successResponse({ posts }, 200);
    } catch (error) {
        return handleError(error);
    }
}

// POST: Create a new post (Protected)
export async function POST(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];

        if (!token) {
            throw new UnauthorizedError("No token provided");
        }

        const decoded = verifyToken(token);

        if (!decoded || !decoded.id) {
            throw new UnauthorizedError();
        }

        const body = await req.json();

        // Validate request body using Zod
        const validatedData = postSchema.parse(body);

        // Create post using service
        const newPost = await createPost(validatedData, decoded.id);

        return successResponse({ post: newPost }, 201);
    } catch (error) {
        return handleError(error);
    }
}

// PATCH: Update a post (by ID) (Protected)
export async function PATCH(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];

        if (!token) {
            throw new UnauthorizedError("No token provided");
        }

        const decoded = verifyToken(token);

        if (!decoded || !decoded.id) {
            throw new UnauthorizedError();
        }

        const body = await req.json();

        // Validate input
        const validatedData = updatePostSchema.parse(body);

        // Update post using service
        const updatedPost = await updatePost(validatedData);

        return successResponse({ post: updatedPost }, 200);
    } catch (error) {
        return handleError(error);
    }
}

// DELETE: Remove a post by ID (Protected)
export async function DELETE(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];

        if (!token) {
            throw new UnauthorizedError("No token provided");
        }

        const decoded = verifyToken(token);

        if (!decoded || !decoded.id) {
            throw new UnauthorizedError();
        }

        const body = await req.json();

        // Validate input
        const schema = z.object({
            id: z.string().min(1, "Post ID is required"),
        });

        const validatedData = schema.parse(body);

        // Delete post using service
        await deletePost(validatedData.id);

        return successResponse({ message: "Post deleted successfully" }, 200);
    } catch (error) {
        return handleError(error);
    }
}