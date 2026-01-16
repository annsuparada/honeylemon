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
 * Images will be placed right after H2 or H3 tags, or at calculated word positions
 */
export function insertImagesIntoContent(
    content: string,
    placements: ImagePlacement[]
): string {
    if (placements.length === 0) {
        return content;
    }

    // Build image HTML for each placement
    const imageHtmls = placements.map((placement) => {
        const imageUrl = placement.cloudinaryUrl || placement.image.url;
        const altText = placement.image.alt;
        const photographer = placement.image.photographer;
        const photographerUrl = placement.image.photographerUrl;

        return `
<figure class="article-image my-8">
    <img src="${imageUrl}" alt="${altText.replace(/"/g, '&quot;')}" class="w-full rounded-lg" />
    <figcaption class="text-sm text-gray-600 mt-2 text-center">
        Photo by <a href="${photographerUrl}" target="_blank" rel="noopener noreferrer" class="underline">${photographer}</a> on <a href="https://unsplash.com/?utm_source=travomad&utm_medium=referral" target="_blank" rel="noopener noreferrer" class="underline">Unsplash</a>
    </figcaption>
</figure>`;
    });

    // Find all H2 and H3 tags with their positions
    const headingRegex = /<(h2|h3)[^>]*>.*?<\/(h2|h3)>/gi;
    const headingMatches: Array<{ tag: string; endIndex: number; wordPos: number }> = [];
    let match: RegExpExecArray | null;

    while ((match = headingRegex.exec(content)) !== null) {
        if (match.index !== undefined && match[0]) {
            const endIndex = match.index + match[0].length;
            const textBefore = content.substring(0, endIndex);
            const wordPos = countWords(textBefore);
            headingMatches.push({
                tag: match[1].toLowerCase(),
                endIndex,
                wordPos,
            });
        }
    }

    // For each placement, find the best insertion point
    let result = content;
    let offset = 0; // Track cumulative offset from previous insertions

    // Process placements in reverse order to maintain correct indices
    for (let i = placements.length - 1; i >= 0; i--) {
        const placement = placements[i];
        const imageHtml = imageHtmls[i];

        // Try to find a heading that's close to or after the target position
        let insertionIndex: number | null = null;

        // First, try to find an H2 or H3 that's at or just after the target word position
        for (const heading of headingMatches) {
            if (heading.wordPos >= placement.position && heading.wordPos <= placement.position + 100) {
                // Found a heading close to the target - insert right after it
                insertionIndex = heading.endIndex + offset;
                break;
            }
        }

        // If no heading found, look for the next heading after the position
        if (insertionIndex === null) {
            for (const heading of headingMatches) {
                if (heading.wordPos > placement.position) {
                    insertionIndex = heading.endIndex + offset;
                    break;
                }
            }
        }

        // If still no heading found, find insertion point by word count (fallback)
        if (insertionIndex === null) {
            const words = result.split(/(\s+)/);
            let currentWordCount = 0;
            let charIndex = 0;

            for (let j = 0; j < words.length; j++) {
                const word = words[j];
                if (word.trim().length > 0) {
                    currentWordCount++;
                }
                charIndex += word.length;

                if (currentWordCount >= placement.position) {
                    // Check if we're inside a paragraph - if so, find the end of current paragraph or next heading
                    const remainingContent = result.substring(charIndex);

                    // Look for next closing </p> tag
                    const nextPClose = remainingContent.search(/<\/p>/i);
                    // Look for next heading
                    const nextHeading = remainingContent.search(/<(h2|h3)/i);

                    if (nextHeading !== -1 && (nextPClose === -1 || nextHeading < nextPClose)) {
                        // Next is a heading, insert before it
                        insertionIndex = charIndex + nextHeading + offset;
                        break;
                    } else if (nextPClose !== -1) {
                        // Insert after closing </p> tag
                        insertionIndex = charIndex + nextPClose + 4 + offset; // +4 for </p>
                        break;
                    } else {
                        // Fallback: insert after current word
                        insertionIndex = charIndex + offset;
                        break;
                    }
                }
            }
        }

        // Insert the image
        if (insertionIndex !== null && insertionIndex >= 0 && insertionIndex <= result.length) {
            result = result.slice(0, insertionIndex) + imageHtml + result.slice(insertionIndex);
            offset += imageHtml.length;
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
        smallUrl: img.smallUrl,
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
            smallUrl: heroImage.smallUrl,
            photographer: heroImage.photographer,
            photographerUrl: heroImage.photographerUrl,
            description: heroImage.description,
            alt: heroImage.alt,
        },
        contentImages,
    };
}

