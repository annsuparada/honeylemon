// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/app/lip/uploadToCloudinary';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Convert to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary (returns URL)
        const imageUrl = await uploadImage(buffer, file.name);

        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to upload image',
            },
            { status: 500 }
        );
    }
}