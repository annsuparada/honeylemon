export const revalidate = 60;

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SinglePostPage from '@/app/components/SinglePostPage';
import { getDestinationPostByTagSlug, getPublishedPosts } from '@/app/lip/postService';
import { generatePostMetadata } from '@/app/lip/metadata-helpers';
import { PageType } from '@prisma/client';

// Generate static params for all destination posts
export async function generateStaticParams() {
    const destinationPosts = await getPublishedPosts(undefined, undefined, PageType.DESTINATION);

    // Extract unique tag slugs from destination posts
    const countrySlugs = new Set<string>();
    destinationPosts.forEach((post: { tags: Array<{ slug: string }> }) => {
        post.tags?.forEach((tag: { slug: string }) => {
            if (tag.slug) {
                countrySlugs.add(tag.slug);
            }
        });
    });

    return Array.from(countrySlugs).map((slug) => ({ country: slug }));
}

export async function generateMetadata({ params }: { params: { country: string } }): Promise<Metadata> {
    const post = await getDestinationPostByTagSlug(params.country);

    if (!post) {
        const countryName = params.country
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        return {
            title: `${countryName} Travel Guide | Destinations | Travomad`,
            description: `Travel guide for ${countryName}`,
        };
    }

    const authorName = `${post.author.name}${post.author.lastName ? ` ${post.author.lastName}` : ''}`;
    const tagNames = post.tags.map(tag => tag.name);
    const keywords = [post.category.name, ...tagNames, "travel"].join(', ');
    const url = `/destinations/${params.country}`;
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;

    return {
        title: `${post.title} | Travomad`,
        description: post.description || `Discover travel tips, destination guides, and exclusive deals for ${params.country}`,
        keywords: keywords,
        authors: [{ name: authorName }],
        creator: authorName,
        publisher: "Travomad",
        category: post.category.name,
        openGraph: {
            siteName: "Travomad",
            locale: "en_US",
            url: fullUrl,
            title: post.title,
            description: post.description || '',
            type: "article",
            publishedTime: post.createdAt,
            modifiedTime: post.updatedAt,
            authors: [authorName],
            section: post.category.name,
            tags: [post.category.name, ...tagNames],
            images: [{
                url: post.image || '/default-og-image.jpg',
                width: 1200,
                height: 630,
                alt: post.title,
                type: "image/jpeg" as const,
            }],
        },
        twitter: {
            card: "summary_large_image" as const,
            title: post.title,
            description: post.description || "Discover travel tips and destination guides on Travomad",
            images: [post.image || '/default-og-image.jpg'],
            creator: "@travomad",
            site: "@travomad",
        },
        alternates: {
            canonical: fullUrl,
        },
        robots: {
            index: post.status === 'PUBLISHED',
            follow: post.status === 'PUBLISHED',
            googleBot: {
                index: post.status === 'PUBLISHED',
                follow: post.status === 'PUBLISHED',
                'max-image-preview': 'large' as const,
                'max-snippet': -1,
            },
        },
    };
}

export default async function CountryDestinationPage({ params }: { params: { country: string } }) {
    const { country } = params;
    const post = await getDestinationPostByTagSlug(country);

    if (!post) {
        notFound();
    }

    // Get related posts - other articles about the same country (tag)
    const relatedPosts = await getPublishedPosts(
        6,
        post.slug,
        PageType.ARTICLE, // Get ARTICLE posts, not DESTINATION posts
        undefined
    );

    // Filter to only show posts with the same country tag
    const countryTag = post.tags.find(tag => tag.slug.toLowerCase() === country.toLowerCase());
    const filteredRelatedPosts = countryTag
        ? relatedPosts.filter((p: { tags: Array<{ slug: string }> }) =>
            p.tags?.some((tag: { slug: string }) => tag.slug === countryTag.slug)
        )
        : [];

    // Get country name from tag (capitalize first letter)
    const countryName = countryTag?.name || country
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return (
        <SinglePostPage
            post={post}
            relatedPosts={filteredRelatedPosts}
            routePrefix="/destinations"
            breadcrumbLabel="Destinations"
            blogSectionTitle={`More ${countryName} Travel Guides`}
            blogSectionSubtitle={`Discover more travel guides and tips for ${countryName}`}
            countryName={countryName}
            countrySlug={country}
        />
    );
}

