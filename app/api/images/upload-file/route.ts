// app/api/images/upload-file/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/app/lip/uploadToCloudinary';

/**
 * POST /api/images/upload-file
 * 
 * Uploads an image file to Cloudinary
 * 
 * Request (multipart/form-data):
 * - file: File (image file)
 * 
 * Response:
 * {
 *   "success": true,
 *   "imageUrl": "https://res.cloudinary.com/.../image.webp"
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        // Validate file exists
        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadImage(buffer, file.name);

        return NextResponse.json({
            success: true,
            imageUrl: cloudinaryUrl,
            fileName: file.name,
            fileSize: file.size,
        });
    } catch (error) {
        console.error('Error uploading image file:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to upload image file',
            },
            { status: 500 }
        );
    }
}

