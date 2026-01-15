// app/api/images/search-unsplash/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchImages } from '@/lib/unsplash';

/**
 * POST /api/images/search-unsplash
 * 
 * Searches for images on Unsplash
 * 
 * Request body (JSON):
 * {
 *   "query": "tokyo travel",
 *   "count": 10 // optional, defaults to 10
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "images": [
 *     {
 *       "id": "abc123",
 *       "url": "https://images.unsplash.com/...",
 *       "thumbUrl": "https://images.unsplash.com/...",
 *       "photographer": "John Doe",
 *       "photographerUrl": "https://unsplash.com/@johndoe?utm_source=...",
 *       "description": "Beautiful landscape",
 *       "alt": "Tokyo travel destination"
 *     }
 *   ]
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, count = 10 } = body;

        // Validate input
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Query is required and must be a non-empty string' },
                { status: 400 }
            );
        }

        // Validate count
        const imageCount = Math.min(Math.max(1, parseInt(String(count), 10) || 10), 30); // Clamp between 1 and 30

        // Search Unsplash
        const images = await searchImages(query.trim(), imageCount);

        return NextResponse.json({
            success: true,
            images,
        });
    } catch (error) {
        console.error('Error searching Unsplash:', error);

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('UNSPLASH_ACCESS_KEY')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Unsplash API key not configured',
                    },
                    { status: 500 }
                );
            }
            if (error.message.includes('rate limit')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Unsplash rate limit reached. Please try again later.',
                    },
                    { status: 429 }
                );
            }
            if (error.message.includes('Invalid')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid Unsplash API configuration',
                    },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to search Unsplash images',
            },
            { status: 500 }
        );
    }
}

