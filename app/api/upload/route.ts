// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/app/lip/uploadToCloudinary';
import prisma from '@/prisma/client';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('image') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    // Convert to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary (returns URL)
    const imageUrl = await uploadImage(buffer, file.name);

    // Save URL to MongoDB via Prisma
    const article = await prisma.article.update({
        where: { id: 'your-article-id' },
        data: {
            heroImage: imageUrl, // Store Cloudinary URL
        },
    });

    return NextResponse.json({ url: imageUrl });
}