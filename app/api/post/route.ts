import { NextResponse } from "next/server";
import { PageType, PostStatus } from "@prisma/client";
import prisma from "@/prisma/client";
import { z } from "zod";
import { postSchema, updatePostSchema } from "@/schemas/postSchema";
import { verifyToken } from "@/utils/auth";



// GET: Retrieve all posts, by slug, by category, by status (Public Access)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const statusParam = searchParams.get("status");
        const categoryParam = searchParams.get("category");
        const limitParam = searchParams.get("limit")
        const typeParam = searchParams.get("type")

        const validStatuses = Object.values(PostStatus);
        const status = validStatuses.includes(statusParam as PostStatus)
            ? (statusParam as PostStatus)
            : undefined;

        const validPageTypes = Object.values(PageType);
        const type = validPageTypes.includes(typeParam as PageType)
            ? (typeParam as PageType)
            : undefined;

        const filter: any = {};
        if (slug) filter.slug = slug;
        if (status) filter.status = status;
        if (type) filter.type = type;

        if (categoryParam) {
            const category = await prisma.category.findFirst({
                where: { slug: categoryParam },
                select: { id: true }
            });

            if (category) {
                filter.categoryId = category.id;
            } else {
                return NextResponse.json({ success: true, posts: [] }, { status: 200 });
            }
        }

        const limit = limitParam ? parseInt(limitParam) : undefined;
        const posts = await prisma.post.findMany({
            where: filter,
            include: {
                author: { select: { username: true, profilePicture: true, name: true, lastName: true } },
                category: { select: { name: true, slug: true } },
            },
            orderBy: { createdAt: "desc" },
            take: limit && !isNaN(limit) ? limit : undefined,
        });

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

        // Check if slug already exists
        const existingPost = await prisma.post.findFirst({ where: { slug: validatedData.slug } });
        if (existingPost) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
        }

        if (!validatedData.slug) {
            throw new Error("Slug is required");
        }

        // Create post
        const newPost = await prisma.post.create({
            data: {
                title: validatedData.title,
                slug: validatedData.slug,
                content: validatedData.content,
                description: validatedData.description || "",
                image: validatedData.image || "",
                categoryId: validatedData.categoryId,
                authorId: decoded.id, // ✅ Use ID from token
                status: validatedData.status || "DRAFT",
                type: validatedData.type,
                tags: validatedData.tagIds && validatedData.tagIds.length > 0 ? {
                    create: validatedData.tagIds.map((tagId: string) => ({
                        tagId: tagId,
                    })),
                } : undefined,
            },
        });

        return NextResponse.json({ success: true, post: newPost }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
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

        // Check if post exists
        const post = await prisma.post.findFirst({ where: { id: validatedData.id } });
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Handle tags if provided
        if (validatedData.tagIds !== undefined) {
            // Delete existing PostTag relationships
            await prisma.postTag.deleteMany({
                where: { postId: validatedData.id },
            });

            // Create new PostTag relationships if tagIds are provided
            if (validatedData.tagIds.length > 0) {
                // MongoDB doesn't support skipDuplicates, but we've already deleted existing relationships
                await prisma.postTag.createMany({
                    data: validatedData.tagIds.map((tagId: string) => ({
                        postId: validatedData.id,
                        tagId: tagId,
                    })),
                });
            }
        }

        // Update post
        const updatedPost = await prisma.post.update({
            where: { id: validatedData.id },
            data: {
                title: validatedData.title ?? post.title,
                slug: validatedData.slug ?? post.slug,
                content: validatedData.content ?? post.content,
                description: validatedData.description ?? post.description,
                image: validatedData.image ?? post.image,
                status: validatedData.status ?? post.status,
                categoryId: validatedData.categoryId ?? post.categoryId,
                type: validatedData.type,
            },
        });

        return NextResponse.json({ success: true, post: updatedPost }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
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

        // Check if post exists
        const post = await prisma.post.findFirst({ where: { id: validatedData.id } });
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Delete post
        await prisma.post.delete({ where: { id: validatedData.id } });

        return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        console.error("Error deleting post:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}

