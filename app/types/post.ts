import { PageType, PostStatus } from '@prisma/client';
import { IconType } from 'react-icons';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    description?: string;
    image?: string;
    heroImage?: string;
    status: PostStatus;
    type: PageType;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    category: {
        name: string;
        slug: string;
    };
    categoryId: string;
    author: {
        id: string;
        name: string;
        lastName?: string;
        username: string;
        profilePicture?: string;
    };
    authorId: string;
    tags: Array<{
        id: string;
        name: string;
        slug: string;
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
    // SEO Fields
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    // Special Flags
    featured?: boolean;
    pillarPage?: boolean;
    trending?: boolean;
    // Analytics & Metadata
    views?: number;
    readTime?: number;
    wordCount?: number;
}

export type BlogPostInput = {
    title: string;
    slug?: string;
    content: string;
    description?: string;
    image?: string;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    authorId: string; // Ensure we pass only the ID
    category?: { id?: string; slug?: string };
};

export interface FeatureCard {
    name: string;
    description: string;
    icon: IconType;
}

