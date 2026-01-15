/**
 * Unsplash Image Service
 * Search and fetch images from Unsplash API
 */

export interface UnsplashImage {
    id: string;
    url: string; // High quality image (regular size, ~1080px)
    thumbUrl: string; // Thumbnail for grid display
    smallUrl: string; // Small size for better grid quality (~400px)
    photographer: string;
    photographerUrl: string;
    description?: string;
    alt: string;
}

export interface ImageSuggestion {
    placement: string;
    searchQuery: string;
    altText: string;
}

/**
 * Search for images on Unsplash
 */
export async function searchImages(query: string, count: number = 1): Promise<UnsplashImage[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        throw new Error('UNSPLASH_ACCESS_KEY is not configured');
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
            {
                headers: {
                    'Authorization': `Client-ID ${accessKey}`,
                },
            }
        );

        if (!response.ok) {
            if (response.status === 403 || response.status === 401) {
                throw new Error('Invalid Unsplash API key');
            }
            if (response.status === 429) {
                throw new Error('Unsplash rate limit reached');
            }
            throw new Error(`Unsplash API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return [];
        }

        return data.results.map((photo: any) => ({
            id: photo.id,
            url: photo.urls.regular, // High quality image (~1080px)
            thumbUrl: photo.urls.thumb, // Thumbnail (~200px)
            smallUrl: photo.urls.small || photo.urls.regular, // Small size (~400px) for grid, fallback to regular
            photographer: photo.user.name,
            photographerUrl: `${photo.user.links.html}?utm_source=travomad&utm_medium=referral`,
            description: photo.description || photo.alt_description,
            alt: photo.alt_description || photo.description || query,
        }));
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to search Unsplash images');
    }
}

/**
 * Get a random image from Unsplash based on query
 */
export async function getRandomImage(query: string): Promise<UnsplashImage | null> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        throw new Error('UNSPLASH_ACCESS_KEY is not configured');
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
            {
                headers: {
                    'Authorization': `Client-ID ${accessKey}`,
                },
            }
        );

        if (!response.ok) {
            if (response.status === 403 || response.status === 401) {
                throw new Error('Invalid Unsplash API key');
            }
            if (response.status === 429) {
                throw new Error('Unsplash rate limit reached');
            }
            throw new Error(`Unsplash API error: ${response.statusText}`);
        }

        const photo = await response.json();

        return {
            id: photo.id,
            url: photo.urls.regular,
            thumbUrl: photo.urls.thumb,
            smallUrl: photo.urls.small || photo.urls.regular,
            photographer: photo.user.name,
            photographerUrl: `${photo.user.links.html}?utm_source=travomad&utm_medium=referral`,
            description: photo.description || photo.alt_description,
            alt: photo.alt_description || photo.description || query,
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to get random Unsplash image');
    }
}

/**
 * Search for images based on AI suggestions with fallback logic
 */
export async function searchImagesForSuggestions(
    suggestions: ImageSuggestion[]
): Promise<Array<UnsplashImage & { suggestion: ImageSuggestion }>> {
    const results: Array<UnsplashImage & { suggestion: ImageSuggestion }> = [];

    for (const suggestion of suggestions) {
        try {
            // Try searching with the suggested query
            const images = await searchImages(suggestion.searchQuery, 1);

            if (images.length > 0) {
                results.push({
                    ...images[0],
                    suggestion,
                    alt: suggestion.altText || images[0].alt, // Use suggested alt text if provided
                });
            } else {
                // Fallback: try generic travel search
                const fallbackImages = await searchImages('travel destination', 1);
                if (fallbackImages.length > 0) {
                    results.push({
                        ...fallbackImages[0],
                        suggestion,
                        alt: suggestion.altText || fallbackImages[0].alt,
                    });
                }
            }
        } catch (error) {
            // If rate limit or other error, skip this image
            console.warn(`Failed to fetch image for suggestion "${suggestion.searchQuery}":`, error);
            // Try one more time with generic search as fallback
            try {
                const fallbackImages = await searchImages('travel', 1);
                if (fallbackImages.length > 0) {
                    results.push({
                        ...fallbackImages[0],
                        suggestion,
                        alt: suggestion.altText || fallbackImages[0].alt,
                    });
                }
            } catch (fallbackError) {
                // Skip this image if fallback also fails
                console.warn('Fallback image search also failed:', fallbackError);
            }
        }
    }

    return results;
}

/**
 * Extract location (city or country) from title/query
 * Examples:
 * - "Complete Guide to Tokyo" -> "Tokyo"
 * - "Best Things to Do in Paris" -> "Paris"
 * - "Mexico Travel Guide" -> "Mexico"
 * - "Tokyo Food Guide" -> "Tokyo"
 */
function extractLocation(text: string): string {
    if (!text) return text;

    // Common patterns to extract location
    const patterns = [
        // "Guide to [Location]", "Travel Guide to [Location]"
        /(?:guide to|travel guide to|complete guide to|ultimate guide to)\s+(.+?)(?:\s+guide|\s+travel|\s*$)/i,
        // "Things to Do in [Location]", "Best of [Location]"
        /(?:things to do in|best of|visit|exploring|explore)\s+(.+?)(?:\s+travel|\s+guide|\s*$)/i,
        // "[Location] Travel Guide", "[Location] Food Guide"
        /^(.+?)\s+(?:travel|food|complete|ultimate|best|top)\s+(?:guide|things|attractions|destinations)/i,
        // "[Location]" at the start
        /^(.+?)(?:\s+(?:guide|travel|food|best|top|things|attractions|destinations|cost|budget|itinerary))/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            let location = match[1].trim();
            // Clean up common prefixes/suffixes
            location = location.replace(/^(the|a|an)\s+/i, '').trim();
            return location;
        }
    }

    // If no pattern matches, try to get first significant word(s) before common keywords
    const words = text.split(/\s+/);
    if (words.length <= 3) {
        // Short titles - return first significant word
        return words[0];
    }

    // Return original text if we can't extract
    return text;
}

/**
 * Get hero image - searches for a specific image based on location in the title
 * Uses search instead of random to get more relevant images
 */
export async function getHeroImage(query: string): Promise<UnsplashImage | null> {
    try {
        // Extract location from the query/title
        const locationQuery = extractLocation(query);

        // Search for images using the extracted location
        // Use search instead of random to get better, more relevant results
        const images = await searchImages(locationQuery, 1);

        if (images.length > 0) {
            // Return the first (most relevant) result
            return images[0];
        }

        // If search fails, try with the original query
        console.warn(`No images found for "${locationQuery}", trying original query "${query}"`);
        const fallbackImages = await searchImages(query, 1);
        if (fallbackImages.length > 0) {
            return fallbackImages[0];
        }

        // Last fallback: generic travel destination
        console.warn(`No images found, using generic travel destination fallback`);
        const genericImages = await searchImages('travel destination', 1);
        if (genericImages.length > 0) {
            return genericImages[0];
        }

        return null;
    } catch (error) {
        console.warn('Failed to get hero image, trying fallback:', error);
        try {
            // Final fallback: try generic travel search
            const fallbackImages = await searchImages('travel', 1);
            if (fallbackImages.length > 0) {
                return fallbackImages[0];
            }
            return null;
        } catch (fallbackError) {
            console.error('Failed to get fallback hero image:', fallbackError);
            return null;
        }
    }
}

