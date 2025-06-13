import prisma from "@/prisma/client";
import { PostStatus } from "@prisma/client";
import { BlogPost } from "../types";

export async function getPublishedPosts(limit?: number, excludeSlug?: string) {
    const rawPosts = await prisma.post.findMany({
        where: {
            status: PostStatus.PUBLISHED,
            NOT: excludeSlug ? { slug: excludeSlug } : undefined,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePicture: true,
                    name: true,
                    lastName: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    const posts: BlogPost[] = rawPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        description: post.description ?? undefined,
        image: post.image ?? undefined,
        status: post.status as PostStatus,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        category: {
            name: post.category.name,
            slug: post.category.slug,
        },
        categoryId: post.category.id,
        author: {
            id: post.author.id,
            name: post.author.name ?? '',
            lastName: post.author.lastName ?? undefined,
            username: post.author.username,
            profilePicture: post.author.profilePicture ?? undefined,
        },
        type: post.type,
    }));

    return posts;
}


export async function getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
        where: { slug },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    lastName: true,
                    username: true,
                    profilePicture: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!post) return null;

    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        description: post.description ?? undefined,
        image: post.image ?? undefined,
        status: post.status as PostStatus,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        category: {
            name: post.category.name,
            slug: post.category.slug,
        },
        categoryId: post.category.id,
        author: {
            id: post.author.id,
            name: post.author.name ?? '',
            lastName: post.author.lastName ?? undefined,
            username: post.author.username,
            profilePicture: post.author.profilePicture ?? undefined,
        },
        type: post.type
    } satisfies BlogPost;
}