import { PageType } from '@prisma/client';

/**
 * Maps PageType to route prefix
 */
export const PAGE_TYPE_ROUTES: Record<PageType, string> = {
    ARTICLE: '/blog',
    DESTINATION: '/destinations',
    ITINERARY: '/itineraries',
    DEAL: '/deal',
};

/**
 * Get the route for a post based on its type and slug
 */
export function getPostRoute(pageType: PageType | string | undefined, slug: string): string {
    const type = pageType as PageType;
    const routePrefix = PAGE_TYPE_ROUTES[type] || PAGE_TYPE_ROUTES.ARTICLE;
    return `${routePrefix}/${slug}`;
}

/**
 * Get the route prefix for a PageType
 */
export function getRoutePrefix(pageType: PageType | string | undefined): string {
    const type = pageType as PageType;
    return PAGE_TYPE_ROUTES[type] || PAGE_TYPE_ROUTES.ARTICLE;
}

