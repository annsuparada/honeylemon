import { NextRequest, NextResponse } from 'next/server';
import { checkPillarExists } from '@/utils/pillarPageHelpers';

// Mark this route as dynamic since it uses searchParams
export const dynamic = 'force-dynamic';

/**
 * GET /api/check-pillar
 * Check if a pillar page already exists for the given page type and tag combination.
 * 
 * Query parameters:
 * - type (required): The page type (e.g., DESTINATION, ITINERARY, GUIDE)
 * - tagId (optional): The tag ID to check for duplicates
 * - tagSlug (optional): The tag slug to check for duplicates (used if tagId is not a valid ObjectID)
 * - excludePostId (optional): Post ID to exclude from check (useful when editing existing pillar)
 * 
 * Returns:
 * - { exists: boolean, message: string }
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const pageType = searchParams.get('type');
        const tagId = searchParams.get('tagId');
        const tagSlug = searchParams.get('tagSlug');
        const excludePostId = searchParams.get('excludePostId');

        if (!pageType) {
            return NextResponse.json(
                { error: 'Page type is required' },
                { status: 400 }
            );
        }

        // Check if tagId looks like a MongoDB ObjectID (24 hex characters)
        // If not, treat it as a slug
        const isObjectId = tagId && /^[0-9a-fA-F]{24}$/.test(tagId);
        const finalTagId = isObjectId ? tagId : undefined;
        const finalTagSlug = !isObjectId && tagId ? tagId : (tagSlug || undefined);

        const exists = await checkPillarExists({
            pageType,
            tagId: finalTagId,
            tagSlug: finalTagSlug,
            excludePostId: excludePostId || undefined
        });

        return NextResponse.json({
            exists,
            message: exists
                ? 'A pillar page already exists for this destination'
                : 'No pillar page exists'
        });
    } catch (error) {
        console.error('Error checking pillar:', error);
        return NextResponse.json(
            { error: 'Failed to check pillar existence' },
            { status: 500 }
        );
    }
}

