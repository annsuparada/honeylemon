/**
 * AI to Post Mapper
 * Maps AI-generated content to post database structure
 */

import { AIArticleResponse } from '@/utils/promptBuilder';
import { GenerationFormData } from '@/utils/promptBuilder';
import { calculateReadTime, calculateWordCount } from '@/app/lib/readTime-helpers';
import { PageType, PostStatus } from '@prisma/client';
import slugify from 'slugify';
import { createTag } from './tagAction';

export interface MappedPostData {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    categoryId: string;
    authorId: string;
    status: PostStatus;
    type: PageType;
    tagIds: string[];
    faqs: Array<{
        question: string;
        answer: string;
    }>;
    heroImage?: string;
    pillarPage: boolean;
    publishedAt?: Date | string;
}

/**
 * Find or create tags and return tag IDs
 */
async function findOrCreateTags(tagNames: string[], token: string): Promise<string[]> {
    const tagIds: string[] = [];

    for (const tagName of tagNames) {
        if (!tagName.trim()) continue;

        try {
            // Try to find existing tag first
            const allTagsResponse = await fetch('/api/tag');
            const allTagsData = await allTagsResponse.json();
            const existingTag = allTagsData.tags?.find(
                (tag: any) => tag.name.toLowerCase().trim() === tagName.toLowerCase().trim()
            );

            if (existingTag) {
                tagIds.push(existingTag.id);
            } else {
                // Create new tag
                const newTag = await createTag(tagName.trim(), token);
                if (newTag) {
                    tagIds.push(newTag.id);
                }
            }
        } catch (error) {
            console.error(`Error finding/creating tag "${tagName}":`, error);
            // Continue with other tags even if one fails
        }
    }

    return tagIds;
}

/**
 * Map AI response to post structure
 */
export async function mapAIResponseToPost(
    aiResponse: AIArticleResponse,
    formData: GenerationFormData,
    heroImageUrl: string | undefined,
    userId: string,
    categoryId: string,
    status: 'DRAFT' | 'PUBLISHED',
    token: string
): Promise<MappedPostData> {
    // Generate slug from title
    const slug = slugify(aiResponse.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
    });

    // Find or create tags
    const tagIds = await findOrCreateTags(aiResponse.tags || [], token);

    // Calculate word count and read time
    const wordCount = calculateWordCount(aiResponse.content);
    const readTime = calculateReadTime(aiResponse.content);

    // Determine if this is a pillar page
    const isPillarPage = formData.contentType === 'pillar';

    // Set publishedAt if publishing
    const publishedAt = status === 'PUBLISHED' ? new Date() : undefined;

    return {
        title: aiResponse.title,
        slug,
        content: aiResponse.content,
        excerpt: aiResponse.excerpt || '',
        description: aiResponse.description || '',
        metaTitle: aiResponse.metaTitle || aiResponse.title,
        metaDescription: aiResponse.metaDescription || aiResponse.description || '',
        focusKeyword: aiResponse.focusKeyword || '',
        categoryId,
        authorId: userId,
        status: status as PostStatus,
        type: PageType.BLOG_POST,
        tagIds,
        faqs: aiResponse.faqs || [],
        heroImage: heroImageUrl,
        pillarPage: isPillarPage,
        publishedAt,
    };
}

