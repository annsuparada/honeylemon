import { PageType } from '@prisma/client';

/**
 * Maps PageType to route prefix
 */
export const PAGE_TYPE_ROUTES: Record<PageType, string> = {
    BLOG_POST: '/blog',
    DESTINATION: '/destinations',
    ITINERARY: '/itineraries',
    DEAL: '/deal',
    GUIDE: '/guides',
};

/**
 * Get the route for a post based on its type and slug
 * For DESTINATION posts, uses the tag slug (country name) instead of post slug
 */
export function getPostRoute(
    pageType: PageType | string | undefined,
    slug: string,
    tagSlug?: string
): string {
    const type = pageType as PageType;
    const routePrefix = PAGE_TYPE_ROUTES[type] || PAGE_TYPE_ROUTES.BLOG_POST;

    // For DESTINATION posts, use the tag slug (country name) instead of post slug
    if (type === PageType.DESTINATION && tagSlug) {
        return `${routePrefix}/${tagSlug}`;
    }

    return `${routePrefix}/${slug}`;
}

/**
 * Get the route prefix for a PageType
 */
export function getRoutePrefix(pageType: PageType | string | undefined): string {
    const type = pageType as PageType;
    return PAGE_TYPE_ROUTES[type] || PAGE_TYPE_ROUTES.BLOG_POST;
}

/**
 * Get the blog route for a post slug
 * Helper function for generating /blog/[slug] routes
 */
export function getBlogRoute(slug: string): string {
    return `/blog/${slug}`;
}

