import { PostStatus } from "@prisma/client";
import { BlogPost } from "../../types";

/**
 * Type for Prisma Post with includes (author, category, tags)
 * This represents the shape of a post returned from Prisma queries
 */
type PrismaPostWithIncludes = {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    description: string | null;
    image: string | null;
    heroImage: string | null;
    status: PostStatus;
    type: any;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    author: {
        id: string;
        username: string;
        profilePicture: string | null;
        name: string | null;
        lastName: string | null;
    };
    tags: Array<{
        tag: {
            id: string;
            name: string;
            slug: string;
        };
    }>;
    faqs?: Array<{
        id: string;
        question: string;
        answer: string;
        order: number;
    }>;
    itemListItems?: Array<{
        id: string;
        name: string;
        url: string;
        order: number;
    }>;
    metaTitle: string | null;
    metaDescription: string | null;
    focusKeyword: string | null;
    featured: boolean | null;
    pillarPage: boolean | null;
    trending: boolean | null;
    views: number | null;
    readTime: number | null;
    wordCount: number | null;
};

/**
 * Maps a Prisma Post (with includes) to a BlogPost type
 * Handles optional fields like faqs and itemListItems
 * 
 * @param post - Prisma post with author, category, tags, and optionally faqs/itemListItems
 * @returns BlogPost object
 */
export function mapPrismaPostToBlogPost(post: PrismaPostWithIncludes): BlogPost {
    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt ?? undefined,
        description: post.description ?? undefined,
        image: post.image ?? undefined,
        heroImage: post.heroImage ?? undefined,
        status: post.status as PostStatus,
        type: post.type,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        publishedAt: post.publishedAt?.toISOString() ?? undefined,
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
        authorId: post.author.id,
        tags: post.tags.map(pt => ({
            id: pt.tag.id,
            name: pt.tag.name,
            slug: pt.tag.slug,
        })),
        ...(post.faqs && { faqs: post.faqs }),
        ...(post.itemListItems && { itemListItems: post.itemListItems }),
        metaTitle: post.metaTitle ?? undefined,
        metaDescription: post.metaDescription ?? undefined,
        focusKeyword: post.focusKeyword ?? undefined,
        featured: post.featured ?? undefined,
        pillarPage: post.pillarPage ?? undefined,
        trending: post.trending ?? undefined,
        views: post.views ?? undefined,
        readTime: post.readTime ?? undefined,
        wordCount: post.wordCount ?? undefined,
    };
}

