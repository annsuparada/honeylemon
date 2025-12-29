// /lib/metadata-helpers.ts
import { Metadata } from 'next';
import { BlogPost } from '@/app/types';
import { formatAuthorName } from './structured-data-helpers';

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

/**
 * Generate metadata for a post page
 */
export async function generatePostMetadata(
    slug: string,
    routePrefix: string,
    getPost: (slug: string) => Promise<BlogPost | null>
): Promise<Metadata> {
    const post = await getPost(slug);

    if (!post) {
        return { title: "Post Not Found", description: "This post does not exist." };
    }

    const authorName = formatAuthorName(post.author);
    const tagNames = post.tags.map(tag => tag.name);
    const keywords = [post.category.name, ...tagNames, "travel"].join(', ');
    const url = `${routePrefix}/${post.slug}`;
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;

    // Use metaTitle and metaDescription if available, otherwise fallback to title and description
    const seoTitle = post.metaTitle || post.title;
    const seoDescription = post.metaDescription || post.description || "Discover travel tips, destination guides, and exclusive deals on Travomad";

    return {
        title: `${seoTitle} | Travomad`,
        description: seoDescription,
        keywords: keywords,
        authors: [{ name: authorName }],
        creator: authorName,
        publisher: "Travomad",
        category: post.category.name,

        openGraph: {
            ...getBaseOpenGraph(seoTitle, seoDescription, fullUrl),
            type: "article",
            publishedTime: post.createdAt,
            modifiedTime: post.updatedAt,
            authors: [authorName],
            section: post.category.name,
            tags: [post.category.name, ...tagNames],
            images: getOpenGraphImages(post.image, seoTitle),
        },

        twitter: getTwitterMetadata(
            seoTitle,
            seoDescription,
            post.image
        ),

        alternates: getCanonicalUrl(url),

        robots: getRobotsMetadata(post.status === 'PUBLISHED'),
    };
}