// utils/postSaveHandler.ts

import { Dispatch, SetStateAction } from "react";
import { getPostRoute } from "../routeHelpers";
import { PageType } from "@prisma/client";

/**
 * Page types that require exactly 1 tag
 * Add page types here that should have this restriction
 */
const PAGE_TYPES_REQUIRING_SINGLE_TAG: PageType[] = [PageType.DESTINATION];

/**
 * Page types that require publishing (cannot be saved as draft)
 * These page types need to be published to be accessible via their routes
 */
const PAGE_TYPES_REQUIRING_PUBLISHING: PageType[] = [
    PageType.DESTINATION,
    PageType.ITINERARY,
    PageType.DEAL,
    // Add other page types that require publishing here
];

/**
 * Check if a page type requires exactly 1 tag
 */
const requiresSingleTag = (pageType?: string): boolean => {
    if (!pageType) return false;
    return PAGE_TYPES_REQUIRING_SINGLE_TAG.includes(pageType as PageType);
};

/**
 * Check if a page type requires publishing (cannot be saved as draft)
 */
const requiresPublishing = (pageType?: string): boolean => {
    if (!pageType) return false;
    return PAGE_TYPES_REQUIRING_PUBLISHING.includes(pageType as PageType);
};

/**
 * Get the display name for a page type (for error messages)
 */
const getPageTypeDisplayName = (pageType: string): string => {
    return pageType.charAt(0) + pageType.slice(1).toLowerCase().replace(/_/g, ' ');
};

export interface SavePostParams {
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

export const handleSavePost = async ({
    title,
    content,
    description,
    excerpt,
    selectedCategory,
    image,
    heroImage,
    pageType,
    status,
    postId,
    slug,
    user,
    isPublish,
    tagIds,
    tagSlug,
    metaTitle,
    metaDescription,
    focusKeyword,
    featured,
    pillarPage,
    trending,
    publishedAt,
    faqs,
    itemListItems,
    createPost,
    updatePost,
    router,
    setMessage,
    setLoading
}: SavePostParams) => {
    if (!title.trim()) {
        setMessage({ type: 'error', text: 'Title is required!' });
        return;
    }

    if (!user?.id) {
        setMessage({ type: 'error', text: 'Author ID is missing! Please log in.' });
        return;
    }

    if (!selectedCategory.trim()) {
        setMessage({ type: 'error', text: 'Category is required!' });
        return;
    }

    if (content.length < 10) {
        setMessage({ type: 'error', text: 'Content must be at least 10 characters long!' });
        return;
    }

    if (description.length > 300) {
        setMessage({ type: 'error', text: 'Description must not be longer than 300 characters!' });
        return;
    }

    // Validate that pillar pages cannot be saved as draft (only for non-BLOG_POST types)
    if (!isPublish && pageType && pageType !== PageType.BLOG_POST && pillarPage) {
        const pageTypeName = getPageTypeDisplayName(pageType);
        setMessage({
            type: 'error',
            text: `${pageTypeName} pillar pages must be published to be accessible. Please use the "Publish" button instead.`
        });
        return;
    }

    // Validate page types that require exactly 1 tag
    if (pageType && requiresSingleTag(pageType)) {
        const pageTypeName = getPageTypeDisplayName(pageType);

        if (!tagIds || tagIds.length === 0) {
            setMessage({ type: 'error', text: `${pageTypeName} pages require exactly 1 tag.` });
            return;
        }
        if (tagIds.length > 1) {
            setMessage({ type: 'error', text: `${pageTypeName} pages can only have 1 tag. Please remove extra tags.` });
            return;
        }
        // Validate tag slug is available when publishing (for page types that use tag slug in routing)
        // Note: We allow tagSlug to be undefined here because it can be extracted from API response
        // The validation will happen in the routing logic if tagSlug is still missing
    }

    // Check for duplicate pillar pages
    if (pillarPage && pageType) {
        // For page types that use tags (DESTINATION, ITINERARY, GUIDE, etc.)
        if (pageType !== PageType.BLOG_POST && tagIds && tagIds.length > 0) {
            try {
                // Call API endpoint instead of using Prisma directly (can't run in browser)
                const checkUrl = `/api/check-pillar?type=${encodeURIComponent(pageType)}&tagId=${encodeURIComponent(tagIds[0])}${postId ? `&excludePostId=${encodeURIComponent(postId)}` : ''}`;
                const response = await fetch(checkUrl);
                const data = await response.json();

                if (data.exists) {
                    const pageTypeName = getPageTypeDisplayName(pageType);
                    setMessage({
                        type: 'error',
                        text: `A pillar page already exists for this ${pageTypeName.toLowerCase()}. Only one pillar page is allowed per ${pageTypeName.toLowerCase()}. Please edit the existing pillar or create a regular article instead.`
                    });
                    return;
                }
            } catch (error) {
                // If API call fails, log error but don't block save
                // (This allows saves to work even if API is temporarily unavailable)
                console.error('Error checking pillar existence:', error);
            }
        }
    }

    // Validate that non-BLOG_POST page types require at least 1 tag when publishing
    if (isPublish && pageType && pageType !== PageType.BLOG_POST && (!tagIds || tagIds.length === 0)) {
        const pageTypeName = getPageTypeDisplayName(pageType);
        setMessage({
            type: 'error',
            text: `${pageTypeName} pages require at least 1 tag when publishing. Please add a tag.`
        });
        return;
    }

    setLoading(true);
    setMessage(null);

    const postData = {
        title,
        content,
        image: image && image.trim() ? image : undefined,
        heroImage: heroImage && heroImage.trim() ? heroImage : undefined,
        description,
        excerpt,
        status: status || (isPublish ? 'PUBLISHED' : 'DRAFT'),
        authorId: user.id,
        categoryId: selectedCategory,
        type: pageType ?? undefined,
        tagIds: tagIds || [],
        metaTitle: metaTitle || undefined,
        metaDescription: metaDescription || undefined,
        focusKeyword: focusKeyword || undefined,
        featured: featured || false,
        pillarPage: pillarPage || false,
        trending: trending || false,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : (isPublish ? new Date().toISOString() : undefined),
        faqs: faqs && faqs.length > 0 ? faqs : undefined,
        itemListItems: itemListItems && itemListItems.length > 0 ? itemListItems : undefined
    };

    try {
        const result = postId
            ? await updatePost({ id: postId, ...postData })
            : await createPost(postData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Post saved successfully!' });
            const postType = pageType || result.post?.type;
            const param = slug || result.post?.slug;

            if (isPublish && param) {
                // For DESTINATION posts, use the tag slug instead of post slug (only for pillar pages)
                let route: string;

                // Get pillar page status - use passed parameter (user's selection), fallback to result if not provided
                const isPillarPage = pillarPage !== undefined ? pillarPage : (result.post?.pillarPage ?? false);

                // Get tag slug - try from passed tagSlug first, then from API response
                let finalTagSlug = tagSlug;
                if (!finalTagSlug && postType === PageType.DESTINATION && result.post?.tags) {
                    // API response structure: tags is an array of PostTag objects with nested tag
                    const postTags = result.post.tags;
                    if (Array.isArray(postTags) && postTags.length > 0) {
                        // Check if it's the nested structure (tags[0].tag.slug) or flat (tags[0].slug)
                        const firstTag = postTags[0];
                        finalTagSlug = firstTag?.tag?.slug || firstTag?.slug;
                    }
                }

                // Only use destination route (/destinations/[tag-slug]) for pillar pages
                // Non-pillar destination pages use blog route (/blog/[slug])
                if (postType === PageType.DESTINATION && finalTagSlug && isPillarPage) {
                    // Ensure tag slug is lowercase for consistency with destination route
                    const normalizedTagSlug = finalTagSlug.toLowerCase();
                    route = getPostRoute(postType, param, normalizedTagSlug);
                } else {
                    // For non-pillar destination pages or other types, use standard route
                    route = getPostRoute(postType === PageType.DESTINATION ? PageType.BLOG_POST : postType, param);
                }
                router.push(route);
            } else if (param) {
                // Redirect to draft preview page
                router.push(`/blog/draft/${param}`);
            } else {
                router.push('/dashboard/blogs');
            }
        } else {
            const fallback = 'Failed to save post. Try again later.';
            const message = result.validationErrors?.[0]?.message || result.error || fallback;
            setMessage({ type: 'error', text: message });
        }
    } catch (error) {
        setMessage({ type: 'error', text: 'An error occurred while saving the post.' });
    } finally {
        setLoading(false);
    }
};
