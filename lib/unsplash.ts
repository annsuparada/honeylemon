/**
 * Unsplash Image Service
 * Search and fetch images from Unsplash API
 */

export interface UnsplashImage {
    id: string;
    url: string;
    thumbUrl: string;
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
            url: photo.urls.regular, // High quality image
            thumbUrl: photo.urls.thumb,
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
 * Get hero image - searches for a high-quality hero image
 */
export async function getHeroImage(query: string): Promise<UnsplashImage | null> {
    try {
        // Try to get a random image for the query
        const image = await getRandomImage(query);
        return image;
    } catch (error) {
        console.warn('Failed to get hero image, trying fallback:', error);
        try {
            // Fallback to generic travel image
            return await getRandomImage('travel destination');
        } catch (fallbackError) {
            console.error('Failed to get fallback hero image:', fallbackError);
            return null;
        }
    }
}

