import prisma from "@/prisma/client";
import { PageType } from "@prisma/client";

/**
 * Parameters for checking if a pillar page exists
 */
export interface PillarCheckParams {
    pageType: string;
    tagId?: string;
    tagSlug?: string;
    excludePostId?: string;
}

/**
 * Check if a pillar page already exists for the given page type and tag combination.
 * 
 * Rules:
 * - For DESTINATION/ITINERARY/GUIDE types: Only ONE pillar per tag is allowed
 * - For BLOG_POST type: No restriction (multiple pillars allowed, returns false)
 * 
 * This function is used to prevent duplicate pillar pages for destinations.
 * Only one pillar page is allowed per destination (type + tag combination).
 * 
 * @param params - Parameters including pageType, optional tagId, and optional excludePostId
 * @param params.pageType - The page type (e.g., DESTINATION, ITINERARY, GUIDE, BLOG_POST)
 * @param params.tagId - The tag ID to check for duplicates (required for DESTINATION/ITINERARY/GUIDE)
 * @param params.excludePostId - Post ID to exclude from check (useful when editing existing pillar)
 * @returns true if a pillar exists, false otherwise
 */
export async function checkPillarExists({
    pageType,
    tagId,
    tagSlug,
    excludePostId
}: PillarCheckParams): Promise<boolean> {
    // For page types that use tags (DESTINATION, ITINERARY, GUIDE, etc.)
    if (pageType !== PageType.BLOG_POST && (tagId || tagSlug)) {
        // If tagSlug is provided, look up the tag to get its ID
        let finalTagId = tagId;
        if (!finalTagId && tagSlug) {
            const tag = await prisma.tag.findFirst({
                where: { slug: tagSlug.toLowerCase() },
                select: { id: true }
            });
            if (!tag) {
                // Tag doesn't exist, so no pillar can exist
                return false;
            }
            finalTagId = tag.id;
        }

        // If we still don't have a tagId, can't check
        if (!finalTagId) {
            return false;
        }

        const existing = await prisma.post.findFirst({
            where: {
                type: pageType as PageType,
                pillarPage: true,
                tags: {
                    some: {
                        tagId: finalTagId
                    }
                },
                status: { in: ['PUBLISHED', 'DRAFT'] }, // Check both statuses
                ...(excludePostId && { id: { not: excludePostId } })
            }
        });
        return !!existing;
    }

    // For BLOG_POST pillars, no restriction (can have multiple pillars)
    // Return false to allow creation
    return false;
}

