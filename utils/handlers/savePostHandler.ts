// utils/postSaveHandler.ts

import { Dispatch, SetStateAction } from "react";
import { getPostRoute } from "../routeHelpers";

export interface SavePostParams {
    title: string;
    content: string;
    description: string;
    selectedCategory: string;
    image: string;
    pageType?: string;
    postId?: string | null;
    slug?: string | null;
    user: { id: string } | null;
    isPublish: boolean;
    tagIds?: string[];
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
    selectedCategory,
    image,
    pageType,
    postId,
    slug,
    user,
    isPublish,
    tagIds,
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

    // Validate DESTINATION page type requires exactly 1 tag
    if (pageType === 'DESTINATION') {
        if (!tagIds || tagIds.length === 0) {
            setMessage({ type: 'error', text: 'Destination pages require exactly 1 tag (the country name).' });
            return;
        }
        if (tagIds.length > 1) {
            setMessage({ type: 'error', text: 'Destination pages can only have 1 tag. Please remove extra tags.' });
            return;
        }
    }

    setLoading(true);
    setMessage(null);

    const postData = {
        title,
        content,
        image,
        description,
        status: isPublish ? 'PUBLISHED' : 'DRAFT',
        authorId: user.id,
        categoryId: selectedCategory,
        type: pageType ?? undefined,
        tagIds: tagIds || [],
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
                // For DESTINATION posts, use the tag slug instead of post slug
                let route: string;
                if (postType === 'DESTINATION' && result.post?.tags && result.post.tags.length > 0) {
                    const tagSlug = result.post.tags[0].slug;
                    route = getPostRoute(postType, param, tagSlug);
                } else {
                    route = getPostRoute(postType, param);
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
