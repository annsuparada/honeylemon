/**
 * @jest-environment node
 */

import { getPublishedPosts, getPostBySlug } from '@/app/lip/postService';
import prisma from '@/prisma/client';
import { PostStatus, PageType } from '@prisma/client';

jest.mock('@/prisma/client', () => ({
    __esModule: true,
    default: {
        post: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

const mockedFindMany = prisma.post.findMany as jest.Mock;
const mockedFindUnique = prisma.post.findUnique as jest.Mock;

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
                type: PageType.ARTICLE,
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
                id: 'cat1',
                name: 'Tech',
                slug: 'tech',
            },
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
