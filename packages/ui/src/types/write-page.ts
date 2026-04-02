import type { Dispatch, SetStateAction } from 'react';
import type { PageType, PostStatus } from '@prisma/client';

export interface WriteFormCategory {
    id: string;
    name: string;
    slug: string;
}

export interface WritePageTag {
    id: string;
    name: string;
    slug: string;
}

/** Shape returned by `fetchPostBySlug` for the write page loader */
export interface WritePageLoadedPost {
    id: string;
    title: string;
    content: string;
    description?: string | null;
    excerpt?: string | null;
    image?: string | null;
    heroImage?: string | null;
    categoryId: string;
    type: PageType;
    status?: PostStatus;
    metaTitle?: string | null;
    metaDescription?: string | null;
    focusKeyword?: string | null;
    featured?: boolean;
    pillarPage?: boolean;
    trending?: boolean;
    publishedAt?: string | Date | null;
    tags?: Array<WritePageTag>;
    faqs?: Array<{ question: string; answer: string }>;
    itemListItems?: Array<{ name: string; url: string }>;
}

export interface WritePageActions {
    fetchPostBySlug: (slug: string) => Promise<WritePageLoadedPost | null | undefined>;
    fetchAllCategories: () => Promise<WriteFormCategory[]>;
    fetchAllTags: () => Promise<WritePageTag[]>;
    createCategory: (name: string, token: string) => Promise<WriteFormCategory | null>;
    createTag: (name: string, token: string) => Promise<WritePageTag | null>;
}

/** Mirrors app `SavePostParams` so `handleSavePost` can be passed as `onSave` */
export interface WritePageSavePayload {
    title: string;
    content: string;
    description: string;
    excerpt?: string;
    selectedCategory: string;
    image: string;
    heroImage?: string;
    pageType?: string;
    status?: string;
    postId?: string | null;
    slug?: string | null;
    user: { id: string } | null;
    isPublish: boolean;
    tagIds?: string[];
    tagSlug?: string;
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    featured?: boolean;
    pillarPage?: boolean;
    trending?: boolean;
    publishedAt?: string;
    faqs?: Array<{ question: string; answer: string }>;
    itemListItems?: Array<{ name: string; url: string }>;
    createPost: (data: any) => Promise<any>;
    updatePost: (data: any) => Promise<any>;
    router: { push: (url: string) => void };
    setMessage: Dispatch<SetStateAction<{ type: 'success' | 'error'; text: string } | null>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
}
