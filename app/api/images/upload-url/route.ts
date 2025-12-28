// app/api/images/upload-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadImageFromUrl } from '@/app/lip/uploadToCloudinary';

/**
 * POST /api/images/upload-url
 * 
 * Uploads an image from a URL to Cloudinary
 * 
 * Request body (JSON):
 * {
 *   "imageUrl": "https://example.com/image.jpg",
 *   "fileName": "optional-custom-name" // optional
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "imageUrl": "https://res.cloudinary.com/.../image.webp"
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { imageUrl, fileName } = body;

        // Validate input
        if (!imageUrl) {
            return NextResponse.json(
                { success: false, error: 'imageUrl is required' },
                { status: 400 }
            );
        }

        // Validate URL format
        try {
            new URL(imageUrl);
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Upload image from URL to Cloudinary
        const cloudinaryUrl = await uploadImageFromUrl(imageUrl, fileName);

        return NextResponse.json({
            success: true,
            imageUrl: cloudinaryUrl,
        });
    } catch (error) {
        console.error('Error uploading image from URL:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload image from URL',
            },
            { status: 500 }
        );
    }
}

