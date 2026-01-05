/**
 * Content Assembler
 * Combines article text with images and creates final HTML
 */

import { UnsplashImage } from '@/lib/unsplash';
import { uploadImageFromUrl } from '@/app/lip/uploadToCloudinary';

export interface ImagePlacement {
    image: UnsplashImage;
    position: number; // Word position where image should be inserted
    cloudinaryUrl?: string; // URL after upload to Cloudinary
}

/**
 * Calculate word count in HTML content
 */
function countWords(html: string): number {
    // Remove HTML tags and count words
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Find insertion points for images (every ~400 words or after H2 tags)
 */
export function calculateImagePlacements(
    content: string,
    images: UnsplashImage[],
    imagesEveryWords: number = 400
): ImagePlacement[] {
    const wordCount = countWords(content);
    const placements: ImagePlacement[] = [];

    if (images.length === 0) {
        return placements;
    }

    // Strategy: Insert images every ~400 words or after H2 tags
    const words = content.split(/\s+/);
    let currentWordIndex = 0;
    let imageIndex = 0;

    // First, try to insert after H2 tags
    const h2Regex = /<h2[^>]*>.*?<\/h2>/gi;
    const h2Matches: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    while ((match = h2Regex.exec(content)) !== null) {
        h2Matches.push(match);
    }
    
    const h2Positions: number[] = [];
    for (const m of h2Matches) {
        if (m.index !== undefined) {
            const textBefore = content.substring(0, m.index);
            const wordPos = countWords(textBefore);
            h2Positions.push(wordPos);
        }
    }

    // Combine H2 positions with regular intervals
    const insertionPoints: number[] = [];
    
    // Add H2 positions (skip first one as it's usually right after intro)
    for (let i = 1; i < h2Positions.length; i++) {
        insertionPoints.push(h2Positions[i]);
    }

    // Add regular intervals (every imagesEveryWords words)
    for (let pos = imagesEveryWords; pos < wordCount; pos += imagesEveryWords) {
        // Only add if not too close to an H2 position
        const tooCloseToH2 = h2Positions.some(h2Pos => Math.abs(pos - h2Pos) < 200);
        if (!tooCloseToH2) {
            insertionPoints.push(pos);
        }
    }

    // Sort and deduplicate
    insertionPoints.sort((a, b) => a - b);
    const uniquePoints = Array.from(new Set(insertionPoints));

    // Map images to positions
    for (let i = 0; i < Math.min(images.length, uniquePoints.length); i++) {
        placements.push({
            image: images[i],
            position: uniquePoints[i],
        });
    }

    // If we have more images than insertion points, add them at the end
    for (let i = uniquePoints.length; i < images.length; i++) {
        const lastPosition = uniquePoints.length > 0 
            ? uniquePoints[uniquePoints.length - 1] + (imagesEveryWords * (i - uniquePoints.length + 1))
            : imagesEveryWords * (i + 1);
        placements.push({
            image: images[i],
            position: lastPosition,
        });
    }

    return placements.sort((a, b) => a.position - b.position);
}

/**
 * Insert images into HTML content at calculated positions
 */
export function insertImagesIntoContent(
    content: string,
    placements: ImagePlacement[]
): string {
    if (placements.length === 0) {
        return content;
    }

    // Convert content to array of words with their positions
    const words = content.split(/(\s+)/);
    let currentWordCount = 0;
    let result = '';
    let placementIndex = 0;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Count words (skip whitespace-only tokens)
        if (word.trim().length > 0) {
            currentWordCount++;
        }

        result += word;

        // Check if we should insert an image here
        if (placementIndex < placements.length && currentWordCount >= placements[placementIndex].position) {
            const placement = placements[placementIndex];
            const imageUrl = placement.cloudinaryUrl || placement.image.url;
            const altText = placement.image.alt;
            const photographer = placement.image.photographer;
            const photographerUrl = placement.image.photographerUrl;

            const imageHtml = `
<figure class="article-image my-8">
    <img src="${imageUrl}" alt="${altText.replace(/"/g, '&quot;')}" class="w-full rounded-lg" />
    <figcaption class="text-sm text-gray-600 mt-2 text-center">
        Photo by <a href="${photographerUrl}" target="_blank" rel="noopener noreferrer" class="underline">${photographer}</a> on <a href="https://unsplash.com/?utm_source=travomad&utm_medium=referral" target="_blank" rel="noopener noreferrer" class="underline">Unsplash</a>
    </figcaption>
</figure>`;

            result += imageHtml;
            placementIndex++;
        }
    }

    return result;
}

/**
 * Upload images to Cloudinary and update placements
 */
export async function uploadImagesToCloudinary(
    placements: ImagePlacement[],
    userId: string,
    postId?: string
): Promise<ImagePlacement[]> {
    const folder = postId 
        ? `travomad/${userId}/articles/${postId}`
        : `travomad/${userId}/articles/temp`;

    const updatedPlacements = await Promise.all(
        placements.map(async (placement) => {
            try {
                const fileName = `image-${placement.image.id}`;
                const cloudinaryUrl = await uploadImageFromUrl(placement.image.url, fileName);
                return {
                    ...placement,
                    cloudinaryUrl,
                };
            } catch (error) {
                console.error(`Failed to upload image ${placement.image.id}:`, error);
                // Return original placement if upload fails
                return placement;
            }
        })
    );

    return updatedPlacements;
}

/**
 * Separate hero image from content images
 */
export function separateHeroImage(images: Array<UnsplashImage & { suggestion?: any }>): {
    heroImage: UnsplashImage | null;
    contentImages: UnsplashImage[];
} {
    if (images.length === 0) {
        return { heroImage: null, contentImages: [] };
    }

    // Extract just the UnsplashImage part
    const heroImage = images[0];
    const contentImages = images.slice(1).map(img => ({
        id: img.id,
        url: img.url,
        thumbUrl: img.thumbUrl,
        photographer: img.photographer,
        photographerUrl: img.photographerUrl,
        description: img.description,
        alt: img.alt,
    }));

    return {
        heroImage: {
            id: heroImage.id,
            url: heroImage.url,
            thumbUrl: heroImage.thumbUrl,
            photographer: heroImage.photographer,
            photographerUrl: heroImage.photographerUrl,
            description: heroImage.description,
            alt: heroImage.alt,
        },
        contentImages,
    };
}

