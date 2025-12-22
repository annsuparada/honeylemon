// /lib/metadata-helpers.ts

export interface BaseMetadataProps {
    title: string;
    description: string;
    imageUrl?: string | null;
    imageAlt?: string;
}

/**
 * Shared Twitter card metadata
 */
export function getTwitterMetadata(title: string, description: string, imageUrl?: string | null) {
    return {
        card: "summary_large_image" as const,
        title: title,
        description: description,
        images: [imageUrl || '/default-og-image.jpg'],
        creator: "@travomad", // Update with your actual handle
        site: "@travomad",
    };
}

/**
 * Shared robots directive
 */
export function getRobotsMetadata(isPublished: boolean = true) {
    return {
        index: isPublished,
        follow: isPublished,
        googleBot: {
            index: isPublished,
            follow: isPublished,
            'max-image-preview': 'large' as const,
            'max-snippet': -1,
        },
    };
}

/**
 * Standardized Open Graph images
 */
export function getOpenGraphImages(imageUrl?: string | null, alt: string = 'Travomad') {
    return [
        {
            url: imageUrl || '/default-og-image.jpg',
            width: 1200,
            height: 630,
            alt: alt,
            type: "image/jpeg" as const,
        },
    ];
}

/**
 * Canonical URL helper
 */
export function getCanonicalUrl(path: string) {
    return {
        canonical: `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    };
}

/**
 * Base Open Graph shared properties
 */
export function getBaseOpenGraph(title: string, description: string, url: string) {
    return {
        siteName: "Travomad",
        locale: "en_US",
        url: url,
        title: title,
        description: description,
    };
}