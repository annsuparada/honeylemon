/**
 * @jest-environment jsdom
 */

import {
    fetchPosts,
    fetchPostBySlug,
    createPost,
    updatePost,
    deletePost
} from '@/utils/postActions';

import fetchMock from 'jest-fetch-mock';
import { PostStatus, PageType } from '@prisma/client';

beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();
});

describe('postActions', () => {
    const mockPosts = [
        { id: '1', title: 'Draft Post 1', status: 'DRAFT' },
        { id: '2', title: 'Draft Post 2', status: 'DRAFT' },
        { id: '3', title: 'Published Post', status: 'PUBLISHED' },
    ];

    describe('fetchPosts', () => {
        it('returns only posts with DRAFT status', async () => {
            // Simulate that the API is filtering by status=DRAFT
            fetchMock.mockResponseOnce(
                JSON.stringify({ posts: mockPosts.filter(p => p.status === 'DRAFT') })
            );

            const posts = await fetchPosts('DRAFT', 5);

            expect(posts).toEqual([
                { id: '1', title: 'Draft Post 1', status: 'DRAFT' },
                { id: '2', title: 'Draft Post 2', status: 'DRAFT' }
            ]);

            // Confirm the correct query string was used
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining('status=DRAFT'),
                expect.any(Object)
            );
        });

        it('returns all posts if no status is passed', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ posts: mockPosts }));

            const posts = await fetchPosts(); // no status

            expect(posts.length).toBe(3);
            expect(posts[0].title).toBe('Draft Post 1');

            expect(fetchMock).toHaveBeenCalledWith(
                expect.not.stringContaining('status='),
                expect.any(Object)
            );
        });

        it('returns [] on invalid JSON', async () => {
            fetchMock.mockResponseOnce('not-json');
            const posts = await fetchPosts();
            expect(posts).toEqual([]);
        });

        it('returns [] on fetch failure', async () => {
            fetchMock.mockRejectOnce(new Error('Network error'));
            const posts = await fetchPosts();
            expect(posts).toEqual([]);
        });
    });

    describe('fetchPostBySlug', () => {
        it('returns a single post', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ posts: [{ slug: 'test-post' }] }));
            const post = await fetchPostBySlug('test-post');
            expect(post?.slug).toBe('test-post');
        });

        it('returns null on bad JSON', async () => {
            fetchMock.mockResponseOnce('bad-json');
            const post = await fetchPostBySlug('test-post');
            expect(post).toBeNull();
        });

        it('returns null on fetch error', async () => {
            fetchMock.mockRejectOnce(new Error('Fetch failed'));
            const post = await fetchPostBySlug('test-post');
            expect(post).toBeNull();
        });
    });

    describe('createPost', () => {
        const validPost = {
            title: 'My Post',
            content: 'Valid content here',
            description: 'Short',
            image: 'https://valid.url/img.png',
            categoryId: 'cat1',
            authorId: 'auth1',
            status: PostStatus.DRAFT,
            type: PageType.ARTICLE,
        };

        it('creates a post successfully', async () => {
            localStorage.setItem('token', 'fake-token');
            fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

            const res = await createPost(validPost);
            expect(res.success).toBe(true);
        });

        it('fails validation with short title', async () => {
            const badPost = { ...validPost, title: 'Hi' }; // < 3 chars
            const res = await createPost(badPost as any);
            console.log('res--', res)
            expect(res).toBeNull();
        });

        it('returns null if no token', async () => {
            const res = await createPost(validPost);
            expect(res).toBeNull();
        });

        it('returns null on fetch error', async () => {
            localStorage.setItem('token', 'fake-token');
            fetchMock.mockRejectOnce(new Error('Fail'));
            const res = await createPost(validPost);
            expect(res).toBeNull();
        });
    });

    describe('updatePost', () => {
        const validUpdate = {
            id: 'post1',
            title: 'Updated Post',
            content: 'This is updated',
            description: 'Updated desc',
            image: 'https://img.com/photo.png',
            categoryId: 'cat2',
            status: PostStatus.PUBLISHED,
            type: PageType.ARTICLE,
        };

        it('updates a post successfully', async () => {
            localStorage.setItem('token', 'valid-token');
            fetchMock.mockResponseOnce(JSON.stringify({ success: true }));
            const res = await updatePost(validUpdate);
            expect(res.success).toBe(true);
        });

        it('fails validation with missing content', async () => {
            const badUpdate = { ...validUpdate, content: '' };
            const res = await updatePost(badUpdate as any);
            expect(res).toBeNull();
        });

        it('returns null without token', async () => {
            const res = await updatePost(validUpdate);
            expect(res).toBeNull();
        });
    });

    describe('deletePost', () => {
        it('deletes a post', async () => {
            localStorage.setItem('token', 'token');
            fetchMock.mockResponseOnce(JSON.stringify({ success: true }));
            const res = await deletePost('post123');
            expect(res.success).toBe(true);
        });

        it('returns null without token', async () => {
            const res = await deletePost('post123');
            expect(res).toBeNull();
        });

        it('returns null on error', async () => {
            localStorage.setItem('token', 'token');
            fetchMock.mockRejectOnce(new Error('Failed'));
            const res = await deletePost('post123');
            expect(res).toBeNull();
        });
    });
});
