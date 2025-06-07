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

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BlogPost = {
    id: string;
    title: string;
    slug: string;
    content: string;
    description?: string;
    image?: string;
    status: PostStatus;
    createdAt: string;
    updatedAt: string;
    category: { id: string; name: string; slug: string };
    author: {
        role?: string;
        id: string;
        name: string;
        lastName?: string;
        username: string;
        profilePicture?: string;
    };
};


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
