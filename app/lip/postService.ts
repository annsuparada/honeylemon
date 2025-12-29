import prisma from "@/prisma/client";
import { PageType, PostStatus } from "@prisma/client";
import { BlogPost } from "../types";

export async function getPublishedPosts(
    limit?: number,
    excludeSlug?: string,
    pageType?: PageType,
    categorySlug?: string
) {
    const rawPosts = await prisma.post.findMany({
        where: {
            status: PostStatus.PUBLISHED,
            ...(excludeSlug && { NOT: { slug: excludeSlug } }),
            ...(pageType && { type: pageType }),
            ...(categorySlug && {
                category: {
                    slug: categorySlug,
                },
            }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePicture: true,
                    name: true,
                    lastName: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            tags: {
                include: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
        },
    });

    const posts: BlogPost[] = rawPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        description: post.description ?? undefined,
        image: post.image ?? undefined,
        status: post.status as PostStatus,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        category: {
            name: post.category.name,
            slug: post.category.slug,
        },
        categoryId: post.category.id,
        author: {
            id: post.author.id,
            name: post.author.name ?? '',
            lastName: post.author.lastName ?? undefined,
            username: post.author.username,
            profilePicture: post.author.profilePicture ?? undefined,
        },
        tags: post.tags.map(pt => ({
            id: pt.tag.id,
            name: pt.tag.name,
            slug: pt.tag.slug,
        })),
        type: post.type,
        featured: post.featured ?? undefined,
        pillarPage: post.pillarPage ?? undefined,
        trending: post.trending ?? undefined,
        views: post.views ?? undefined,
        readTime: post.readTime ?? undefined,
        metaTitle: post.metaTitle ?? undefined,
        metaDescription: post.metaDescription ?? undefined,
    }));

    return posts;
}

/**
 * Get featured post for a specific country
 * Looks for posts with a "featured-[country]" tag first, then falls back to latest post with country tag
 */
export async function getFeaturedPostByCountry(countrySlug: string): Promise<BlogPost | null> {
    const countryName = countrySlug.toLowerCase();

    // First, try to find a post with "featured-[country]" tag
    const featuredTagName = `featured-${countryName}`;

    const featuredPosts = await prisma.post.findMany({
        where: {
            status: PostStatus.PUBLISHED,
            type: PageType.DESTINATION,
            tags: {
                some: {
                    tag: {
                        OR: [
                            { slug: featuredTagName },
                            { name: { equals: featuredTagName, mode: 'insensitive' } }
                        ]
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePicture: true,
                    name: true,
                    lastName: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            tags: {
                include: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
            faqs: {
                select: {
                    id: true,
                    question: true,
                    answer: true,
                    order: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
            itemListItems: {
                select: {
                    id: true,
                    name: true,
                    url: true,
                    order: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    });

    // If found featured post, return it
    if (featuredPosts.length > 0) {
        const post = featuredPosts[0];
        return {
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            description: post.description ?? undefined,
            image: post.image ?? undefined,
            status: post.status as PostStatus,
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
            category: {
                name: post.category.name,
                slug: post.category.slug,
            },
            categoryId: post.category.id,
            author: {
                id: post.author.id,
                name: post.author.name ?? '',
                lastName: post.author.lastName ?? undefined,
                username: post.author.username,
                profilePicture: post.author.profilePicture ?? undefined,
            },
            tags: post.tags.map(pt => ({
                id: pt.tag.id,
                name: pt.tag.name,
                slug: pt.tag.slug,
            })),
            type: post.type,
            faqs: post.faqs || [],
            itemListItems: post.itemListItems || [],
            featured: post.featured ?? undefined,
            pillarPage: post.pillarPage ?? undefined,
            trending: post.trending ?? undefined,
            views: post.views ?? undefined,
            readTime: post.readTime ?? undefined,
            metaTitle: post.metaTitle ?? undefined,
            metaDescription: post.metaDescription ?? undefined,
        };
    }

    // Fallback: Get latest post with country tag
    const countryPosts = await prisma.post.findMany({
        where: {
            status: PostStatus.PUBLISHED,
            type: PageType.DESTINATION,
            tags: {
                some: {
                    tag: {
                        OR: [
                            { slug: countryName },
                            { name: { equals: countryName, mode: 'insensitive' } }
                        ]
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    profilePicture: true,
                    name: true,
                    lastName: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            tags: {
                include: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
            faqs: {
                select: {
                    id: true,
                    question: true,
                    answer: true,
                    order: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
            itemListItems: {
                select: {
                    id: true,
                    name: true,
                    url: true,
                    order: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    });

    if (countryPosts.length === 0) return null;

    const post = countryPosts[0];
    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        description: post.description ?? undefined,
        image: post.image ?? undefined,
        status: post.status as PostStatus,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        category: {
            name: post.category.name,
            slug: post.category.slug,
        },
        categoryId: post.category.id,
        author: {
            id: post.author.id,
            name: post.author.name ?? '',
            lastName: post.author.lastName ?? undefined,
            username: post.author.username,
            profilePicture: post.author.profilePicture ?? undefined,
        },
        tags: post.tags.map(pt => ({
            id: pt.tag.id,
            name: pt.tag.name,
            slug: pt.tag.slug,
        })),
        type: post.type,
        faqs: post.faqs || [],
        itemListItems: post.itemListItems || [],
        featured: post.featured ?? undefined,
        pillarPage: post.pillarPage ?? undefined,
        trending: post.trending ?? undefined,
        views: post.views ?? undefined,
        readTime: post.readTime ?? undefined,
    };
}

export async function getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
        where: { slug },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    lastName: true,
                    username: true,
                    profilePicture: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            tags: {
                include: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
            faqs: {
                select: {
                    id: true,
                    question: true,
                    answer: true,
                    order: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
            itemListItems: {
                select: {
                    id: true,
                    name: true,
                    url: true,
                    order: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    });

    if (!post) return null;

    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        description: post.description ?? undefined,
        image: post.image ?? undefined,
        status: post.status as PostStatus,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        category: {
            name: post.category.name,
            slug: post.category.slug,
        },
        categoryId: post.category.id,
        author: {
            id: post.author.id,
            name: post.author.name ?? '',
            lastName: post.author.lastName ?? undefined,
            username: post.author.username,
            profilePicture: post.author.profilePicture ?? undefined,
        },
        tags: post.tags.map(pt => ({
            id: pt.tag.id,
            name: pt.tag.name,
            slug: pt.tag.slug,
        })),
        type: post.type,
        faqs: post.faqs || [],
        itemListItems: post.itemListItems || [],
        featured: post.featured ?? undefined,
        pillarPage: post.pillarPage ?? undefined,
        trending: post.trending ?? undefined,
        views: post.views ?? undefined,
        readTime: post.readTime ?? undefined,
        metaTitle: post.metaTitle ?? undefined,
        metaDescription: post.metaDescription ?? undefined,
    } satisfies BlogPost;
}

/**
 * Get destination post by tag slug
 * For DESTINATION page type, we use the tag slug (country name) as the route
 */
export async function getDestinationPostByTagSlug(tagSlug: string): Promise<BlogPost | null> {
    const normalizedSlug = tagSlug.toLowerCase();

    const post = await prisma.post.findFirst({
        where: {
            type: PageType.DESTINATION,
            status: PostStatus.PUBLISHED,
            tags: {
                some: {
                    tag: {
                        slug: normalizedSlug,
                    },
                },
            },
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    lastName: true,
                    username: true,
                    profilePicture: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
            tags: {
                include: {
                    tag: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            },
            faqs: {
                select: {
                    id: true,
                    question: true,
                    answer: true,
                    order: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
            itemListItems: {
                select: {
                    id: true,
                    name: true,
                    url: true,
                    order: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
        orderBy: {
            updatedAt: 'desc', // Get the most recently updated destination post for this country
        },
    });

    if (!post) {
        // Debug: Check if there are any destination posts with this tag slug but different status
        const draftPost = await prisma.post.findFirst({
            where: {
                type: PageType.DESTINATION,
                status: PostStatus.DRAFT,
                tags: {
                    some: {
                        tag: {
                            slug: normalizedSlug,
                        },
                    },
                },
            },
        });

        return null;
    }

    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        description: post.description ?? undefined,
        image: post.image ?? undefined,
        status: post.status as PostStatus,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        category: {
            name: post.category.name,
            slug: post.category.slug,
        },
        categoryId: post.category.id,
        author: {
            id: post.author.id,
            name: post.author.name ?? '',
            lastName: post.author.lastName ?? undefined,
            username: post.author.username,
            profilePicture: post.author.profilePicture ?? undefined,
        },
        tags: post.tags.map(pt => ({
            id: pt.tag.id,
            name: pt.tag.name,
            slug: pt.tag.slug,
        })),
        type: post.type,
        faqs: post.faqs || [],
        itemListItems: post.itemListItems || [],
        featured: post.featured ?? undefined,
        pillarPage: post.pillarPage ?? undefined,
        trending: post.trending ?? undefined,
        views: post.views ?? undefined,
        readTime: post.readTime ?? undefined,
        metaTitle: post.metaTitle ?? undefined,
        metaDescription: post.metaDescription ?? undefined,
    } satisfies BlogPost;
}

