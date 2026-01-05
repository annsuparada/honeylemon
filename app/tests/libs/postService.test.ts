/**
 * @jest-environment node
 */

import { getPublishedPosts, getPostBySlug, getDestinationPostByTagSlug } from '@/app/lip/postService';
import prisma from '@/prisma/client';
import { PostStatus, PageType } from '@prisma/client';

jest.mock('@/prisma/client', () => ({
    __esModule: true,
    default: {
        post: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
        },
    },
}));

const mockedFindMany = prisma.post.findMany as jest.Mock;
const mockedFindUnique = prisma.post.findUnique as jest.Mock;
const mockedFindFirst = prisma.post.findFirst as jest.Mock;

describe('getPublishedPosts', () => {
    it('returns normalized published posts', async () => {
        mockedFindMany.mockResolvedValue([
            {
                id: 'post1',
                title: 'Title',
                slug: 'title',
                content: 'Some content',
                description: 'Desc',
                image: 'img.png',
                status: PostStatus.PUBLISHED,
                createdAt: new Date('2023-01-01'),
                updatedAt: new Date('2023-01-02'),
                type: PageType.BLOG_POST,
                category: {
                    id: 'cat1',
                    name: 'Tech',
                    slug: 'tech',
                },
                author: {
                    id: 'user1',
                    name: 'John',
                    lastName: 'Doe',
                    username: 'johndoe',
                    profilePicture: 'pfp.png',
                },
                tags: [],
            },
        ]);

        const posts = await getPublishedPosts();

        expect(posts).toHaveLength(1);
        expect(posts[0]).toMatchObject({
            id: 'post1',
            title: 'Title',
            slug: 'title',
            status: PostStatus.PUBLISHED,
            category: {
                name: 'Tech',
                slug: 'tech',
            },
            categoryId: 'cat1',
            author: {
                id: 'user1',
                name: 'John',
                username: 'johndoe',
            },
        });

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { status: PostStatus.PUBLISHED },
                orderBy: { createdAt: 'desc' },
            })
        );
    });

    it('excludes post by slug when excludeSlug is provided', async () => {
        mockedFindMany.mockResolvedValue([
            {
                id: 'post2',
                title: 'Another Post',
                slug: 'another-post',
                content: 'Another content',
                description: 'Another desc',
                image: 'img2.png',
                status: PostStatus.PUBLISHED,
                createdAt: new Date('2023-02-01'),
                updatedAt: new Date('2023-02-02'),
                type: PageType.BLOG_POST,
                category: {
                    id: 'cat2',
                    name: 'Business',
                    slug: 'business',
                },
                author: {
                    id: 'user2',
                    name: 'Jane',
                    lastName: 'Smith',
                    username: 'janesmith',
                    profilePicture: 'pfp2.png',
                },
                tags: [],
            },
        ]);

        const excludedSlug = 'exclude-this';
        await getPublishedPosts(undefined, excludedSlug);

        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    status: PostStatus.PUBLISHED,
                    NOT: { slug: excludedSlug },
                },
                orderBy: { createdAt: 'desc' },
            })
        );
    });

    it('filters posts by pageType when provided', async () => {
        mockedFindMany.mockResolvedValue([
            {
                id: 'post3',
                title: 'Article Post',
                slug: 'article-post',
                content: 'Content',
                description: null,
                image: null,
                status: PostStatus.PUBLISHED,
                createdAt: new Date('2023-03-01'),
                updatedAt: new Date('2023-03-02'),
                type: PageType.BLOG_POST,
                category: {
                    id: 'cat3',
                    name: 'Lifestyle',
                    slug: 'lifestyle',
                },
                author: {
                    id: 'user3',
                    name: 'Alice',
                    lastName: null,
                    username: 'alice',
                    profilePicture: null,
                },
                tags: [],
            },
        ]);

        const posts = await getPublishedPosts(undefined, undefined, PageType.BLOG_POST);

        expect(posts).toHaveLength(1);
        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    status: PostStatus.PUBLISHED,
                    type: PageType.BLOG_POST,
                },
            })
        );
    });

    it('filters posts by categorySlug when provided', async () => {
        mockedFindMany.mockResolvedValue([
            {
                id: 'post4',
                title: 'Travel Post',
                slug: 'travel-post',
                content: 'Content',
                description: null,
                image: null,
                status: PostStatus.PUBLISHED,
                createdAt: new Date('2023-04-01'),
                updatedAt: new Date('2023-04-02'),
                type: PageType.DESTINATION,
                category: {
                    id: 'cat4',
                    name: 'Travel',
                    slug: 'travel',
                },
                author: {
                    id: 'user4',
                    name: 'Bob',
                    lastName: null,
                    username: 'bob',
                    profilePicture: null,
                },
                tags: [],
            },
        ]);

        const posts = await getPublishedPosts(undefined, undefined, undefined, 'travel');

        expect(posts).toHaveLength(1);
        expect(mockedFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    status: PostStatus.PUBLISHED,
                    category: {
                        slug: 'travel',
                    },
                },
            })
        );
    });

});

describe('getPostBySlug', () => {
    it('returns a normalized post by slug', async () => {
        mockedFindUnique.mockResolvedValue({
            id: 'post2',
            title: 'Slug Post',
            slug: 'slug-post',
            content: 'Content here',
            description: null,
            image: null,
            status: PostStatus.PUBLISHED,
            createdAt: new Date('2023-03-03'),
            updatedAt: new Date('2023-03-04'),
            type: PageType.DEAL,
            category: {
                id: 'cat2',
                name: 'Deals',
                slug: 'deals',
            },
            author: {
                id: 'auth2',
                name: 'Alice',
                lastName: null,
                username: 'alice123',
                profilePicture: null,
            },
            tags: [],
        });

        const post = await getPostBySlug('slug-post');

        expect(post).not.toBeNull();
        expect(post?.slug).toBe('slug-post');
        expect(post?.type).toBe(PageType.DEAL);
        expect(post?.category.name).toBe('Deals');
        expect(post?.author.username).toBe('alice123');
    });

    it('returns null if post not found', async () => {
        mockedFindUnique.mockResolvedValue(null);

        const result = await getPostBySlug('nonexistent');
        expect(result).toBeNull();
    });
});

describe('getDestinationPostByTagSlug', () => {
    it('returns destination post by tag slug', async () => {
        const mockPost = {
            id: 'post1',
            title: 'Thailand Travel Guide',
            slug: 'thailand-travel-guide',
            content: 'Content about Thailand',
            description: 'Thailand destination guide',
            image: 'https://image.com/thailand.jpg',
            status: PostStatus.PUBLISHED,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-02'),
            type: PageType.DESTINATION,
            category: {
                id: 'cat1',
                name: 'Destinations',
                slug: 'destinations',
            },
            author: {
                id: 'user1',
                name: 'John',
                lastName: 'Doe',
                username: 'johndoe',
                profilePicture: 'pfp.png',
            },
            tags: [
                {
                    tag: {
                        id: 'tag1',
                        name: 'Thailand',
                        slug: 'thailand',
                    },
                },
            ],
            faqs: [],
            itemListItems: [],
        };

        mockedFindFirst.mockResolvedValue(mockPost);

        const result = await getDestinationPostByTagSlug('thailand');

        expect(result).not.toBeNull();
        expect(result?.slug).toBe('thailand-travel-guide');
        expect(result?.type).toBe(PageType.DESTINATION);
        expect(result?.tags).toHaveLength(1);
        expect(result?.tags[0].slug).toBe('thailand');

        expect(mockedFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    type: PageType.DESTINATION,
                    pillarPage: true, // Only show pillar pages in destinations
                    status: PostStatus.PUBLISHED,
                    tags: {
                        some: {
                            tag: {
                                slug: 'thailand',
                            },
                        },
                    },
                },
            })
        );
    });

    it('normalizes tag slug to lowercase', async () => {
        mockedFindFirst.mockResolvedValue(null);

        await getDestinationPostByTagSlug('THAILAND');

        expect(mockedFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    tags: {
                        some: {
                            tag: {
                                slug: 'thailand',
                            },
                        },
                    },
                }),
            })
        );
    });

    it('returns null if no destination post found', async () => {
        mockedFindFirst.mockResolvedValue(null);

        const result = await getDestinationPostByTagSlug('nonexistent');

        expect(result).toBeNull();
    });

    it('returns most recently updated post when multiple exist', async () => {
        const mockPost = {
            id: 'post1',
            title: 'Thailand Guide',
            slug: 'thailand-guide',
            content: 'Content',
            description: null,
            image: null,
            status: PostStatus.PUBLISHED,
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-03'),
            type: PageType.DESTINATION,
            category: {
                id: 'cat1',
                name: 'Destinations',
                slug: 'destinations',
            },
            author: {
                id: 'user1',
                name: 'John',
                lastName: null,
                username: 'johndoe',
                profilePicture: null,
            },
            tags: [
                {
                    tag: {
                        id: 'tag1',
                        name: 'Thailand',
                        slug: 'thailand',
                    },
                },
            ],
            faqs: [],
            itemListItems: [],
        };

        mockedFindFirst.mockResolvedValue(mockPost);

        await getDestinationPostByTagSlug('thailand');

        expect(mockedFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: {
                    updatedAt: 'desc',
                },
            })
        );
    });
});
