import { PageType, PostStatus } from '@prisma/client';
import { IconType } from 'react-icons'

export interface Author {
    id: string;
    bio?: string;
    name: string;
    lastName?: string;
    email?: string;
    username: string;
    profilePicture?: string;
    role?: string;
}

export interface AuthorUpdateData extends Partial<Author> {
    newPassword?: string;
    confirmPassword?: string;
}


export interface Category {
    id: string;
    name: string;
    slug: string;
}


export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    description?: string;
    image?: string;
    status: PostStatus;
    createdAt: string;
    updatedAt: string;
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
    tags: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
    type: PageType;
}


export interface FeatureCard {
    name: string
    description: string
    icon: IconType
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

export type ApiSuccess<T> = {
    success: true;
    post?: T;
};

export type ApiError = {
    success: false;
    error: string;
    validationErrors?: {
        path: (string | number)[];
        message: string;
    }[];
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
