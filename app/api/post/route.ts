import { NextResponse } from "next/server";
import { PageType, PostStatus } from "@prisma/client";
import prisma from "@/prisma/client";
import { z } from "zod";
import { postSchema, updatePostSchema } from "@/schemas/postSchema";
import { verifyToken } from "@/utils/auth";
import { calculateReadTime, calculateWordCount } from "@/app/lib/readTime-helpers";

// GET: Retrieve all posts, by slug, by category, by status (Public Access)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        const statusParam = searchParams.get("status");
        const categoryParam = searchParams.get("category");
        const limitParam = searchParams.get("limit")
        const typeParam = searchParams.get("type")
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

        const filter: any = {};
        if (slug) filter.slug = slug;
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (featuredParam === "true") filter.featured = true;
        if (trendingParam === "true") filter.trending = true;

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
        const rawPosts = await prisma.post.findMany({
            where: filter,
            include: {
                author: { select: { id: true, username: true, profilePicture: true, name: true, lastName: true } },
                category: { select: { name: true, slug: true } },
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
                faqs: {
                    select: {
                        id: true,
                        question: true,
                        answer: true,
                        order: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
                itemListItems: {
                    select: {
                        id: true,
                        name: true,
                        url: true,
                        order: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: limit && !isNaN(limit) ? limit : undefined,
        });

        // Transform posts to normalize tags structure
        const posts = rawPosts.map(post => ({
            ...post,
            tags: post.tags.map(pt => ({
                id: pt.tag.id,
                name: pt.tag.name,
                slug: pt.tag.slug,
            })),
            faqs: post.faqs || [],
            itemListItems: post.itemListItems || [],
        }));

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
        // Calculate read time and word count from content
        const readTime = calculateReadTime(validatedData.content);
        const wordCount = calculateWordCount(validatedData.content);

        const newPost = await prisma.post.create({
            data: {
                title: validatedData.title,
                slug: validatedData.slug,
                content: validatedData.content,
                description: validatedData.description || "",
                excerpt: validatedData.excerpt || null,
                image: validatedData.image || "",
                heroImage: validatedData.heroImage || null,
                categoryId: validatedData.categoryId,
                authorId: decoded.id,
                status: validatedData.status ?? "DRAFT",
                type: validatedData.type,
                metaTitle: validatedData.metaTitle || null,
                metaDescription: validatedData.metaDescription || null,
                focusKeyword: validatedData.focusKeyword || null,
                featured: validatedData.featured || false,
                pillarPage: validatedData.pillarPage || false,
                trending: validatedData.trending || false,
                publishedAt: validatedData.publishedAt ? (typeof validatedData.publishedAt === 'string' ? new Date(validatedData.publishedAt) : validatedData.publishedAt) : null,
                readTime: readTime,
                wordCount: wordCount,
                tags: validatedData.tagIds && validatedData.tagIds.length > 0 ? {
                    create: validatedData.tagIds.map((tagId: string) => ({
                        tagId: tagId,
                    })),
                } : undefined,
                faqs: validatedData.faqs && validatedData.faqs.length > 0 ? {
                    create: validatedData.faqs.map((faq: any, index: number) => ({
                        question: faq.question,
                        answer: faq.answer,
                        order: index,
                    })),
                } : undefined,
                itemListItems: validatedData.itemListItems && validatedData.itemListItems.length > 0 ? {
                    create: validatedData.itemListItems.map((item: any, index: number) => ({
                        name: item.name,
                        url: item.url,
                        order: index,
                    })),
                } : undefined,
            },
            include: {
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
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
            await prisma.postTag.deleteMany({
                where: { postId: validatedData.id },
            });

            if (validatedData.tagIds.length > 0) {
                await prisma.postTag.createMany({
                    data: validatedData.tagIds.map((tagId: string) => ({
                        postId: validatedData.id,
                        tagId: tagId,
                    })),
                });
            }
        }

        if (validatedData.faqs !== undefined) {
            // Delete existing FAQs
            await prisma.fAQ.deleteMany({
                where: { postId: validatedData.id },
            });

            // Create new FAQs if provided
            if (validatedData.faqs.length > 0) {
                await prisma.fAQ.createMany({
                    data: validatedData.faqs.map((faq: any, index: number) => ({
                        postId: validatedData.id,
                        question: faq.question,
                        answer: faq.answer,
                        order: index,
                    })),
                });
            }
        }

        if (validatedData.itemListItems !== undefined) {
            // Delete existing ItemListItems
            await prisma.itemListItem.deleteMany({
                where: { postId: validatedData.id },
            });

            // Create new ItemListItems if provided
            if (validatedData.itemListItems.length > 0) {
                await prisma.itemListItem.createMany({
                    data: validatedData.itemListItems.map((item: any, index: number) => ({
                        postId: validatedData.id,
                        name: item.name,
                        url: item.url,
                        order: index,
                    })),
                });
            }
        }

        // Calculate read time and word count if content is being updated
        const updatedContent = validatedData.content ?? post.content;
        const readTime = calculateReadTime(updatedContent);
        const wordCount = calculateWordCount(updatedContent);

        // Update post
        const updatedPost = await prisma.post.update({
            where: { id: validatedData.id },
            data: {
                title: validatedData.title ?? post.title,
                slug: validatedData.slug ?? post.slug,
                content: validatedData.content ?? post.content,
                description: validatedData.description ?? post.description,
                excerpt: validatedData.excerpt !== undefined ? validatedData.excerpt : post.excerpt,
                image: validatedData.image ?? post.image,
                heroImage: validatedData.heroImage !== undefined ? validatedData.heroImage : post.heroImage,
                status: validatedData.status ?? post.status,
                categoryId: validatedData.categoryId ?? post.categoryId,
                type: validatedData.type,
                metaTitle: validatedData.metaTitle !== undefined ? validatedData.metaTitle : post.metaTitle,
                metaDescription: validatedData.metaDescription !== undefined ? validatedData.metaDescription : post.metaDescription,
                focusKeyword: validatedData.focusKeyword !== undefined ? validatedData.focusKeyword : post.focusKeyword,
                featured: validatedData.featured !== undefined ? validatedData.featured : post.featured,
                pillarPage: validatedData.pillarPage !== undefined ? validatedData.pillarPage : post.pillarPage,
                trending: validatedData.trending !== undefined ? validatedData.trending : post.trending,
                publishedAt: validatedData.publishedAt !== undefined ? (typeof validatedData.publishedAt === 'string' ? new Date(validatedData.publishedAt) : validatedData.publishedAt) : post.publishedAt,
                readTime: readTime,
                wordCount: wordCount,
            },
            include: {
                tags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
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

        // Delete related records first
        // Delete PostTags (junction table)
        await prisma.postTag.deleteMany({
            where: { postId: validatedData.id }
        });

        // Delete Comments
        await prisma.comment.deleteMany({
            where: { postId: validatedData.id }
        });

        // Delete FAQs (should cascade, but being explicit)
        await prisma.fAQ.deleteMany({
            where: { postId: validatedData.id }
        });

        // Delete ItemListItems (should cascade, but being explicit)
        await prisma.itemListItem.deleteMany({
            where: { postId: validatedData.id }
        });

        // Delete post (FAQs and ItemListItems will also auto-delete due to onDelete: Cascade, but we're being explicit above)
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