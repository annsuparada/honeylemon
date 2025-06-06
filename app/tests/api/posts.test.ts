/**
 * @jest-environment node
 */

import { POST, GET, PATCH, DELETE } from '../../api/post/route';
import prisma from "@/prisma/client";

jest.mock('@/prisma/client', () => ({
    post: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    category: {
        findFirst: jest.fn(),
    },
}));

jest.mock('@/utils/auth', () => ({
    verifyToken: jest.fn(() => ({ id: 'user123' })),
}));

describe('Post API', () => {
    const validPostData = {
        title: 'Test Title',
        slug: 'test-title',
        content: 'Some content',
        description: 'Short desc',
        image: 'https://image.com',
        categoryId: 'cat123',
        authorId: 'user123',
        type: 'ARTICLE',
        status: 'DRAFT',
        createAt: "",
        updateAt: ""
    };

    it('POST: should create a post', async () => {
        (prisma.post.findFirst as jest.Mock).mockResolvedValue(null);
        (prisma.post.create as jest.Mock).mockResolvedValue({ ...validPostData, id: 'post123' });


        const req = new Request('http://localhost/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token',
            },
            body: JSON.stringify(validPostData),
        });

        const result = await POST(req as any);
        const json = await result.json();
        expect(json.success).toBe(true);
        expect(json.post.title).toBe('Test Title');
        expect(json.post.slug).toBe('test-title');
        expect(json.post.content).toBe('Some content');
        expect(json.post.description).toBe('Short desc');
        expect(json.post.image).toBe('https://image.com');
        expect(json.post.type).toBe('ARTICLE');
        expect(json.post.status).toBe('DRAFT');

    });

    it('POST: should fail to create a post with missing authorId (Zod validation)', async () => {
        const invalidPostData = {
            title: 'Test Title',
            slug: 'test-title',
            content: 'Some content',
            description: 'Short desc',
            image: 'https://image.com',
            categoryId: 'cat123',
            type: 'ARTICLE',
            status: 'DRAFT',
            // ❌ authorId is missing
        };

        // Mock Prisma to not interfere with validation phase
        (prisma.post.findFirst as jest.Mock).mockResolvedValue(null);

        const req = new Request('http://localhost/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token',
            },
            body: JSON.stringify(invalidPostData),
        });

        const result = await POST(req as any);
        const json = await result.json();

        expect(result.status).toBe(400);
        expect(Array.isArray(json.error)).toBe(true); // Zod error format
        expect(json.error[0]).toMatchObject({
            path: ['authorId'],
            message: expect.any(String),
        });
    });

    it('GET: should return posts', async () => {
        (prisma.post.findMany as jest.Mock).mockResolvedValue([
            { id: 'post1', title: 'Post 1' },
            { id: 'post2', title: 'Post 2' },
        ]);

        const req = { url: 'http://localhost/api/posts' } as Request;
        const res = await GET(req);
        const json = await res.json();

        expect(json.success).toBe(true);
        expect(json.posts.length).toBe(2);
    });

    it('GET: should return post by slug', async () => {
        const mockPost = {
            id: 'post123',
            title: 'Test Post',
            slug: 'test-post',
            content: 'This is the content.',
            author: {
                username: 'andrew',
                profilePicture: 'https://image.com/pic.jpg',
                name: 'Andrew',
                lastName: 'Kantos'
            },
            category: {
                name: 'Tech',
                slug: 'tech'
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        (prisma.post.findMany as jest.Mock).mockResolvedValue([mockPost]);

        const req = new Request('http://localhost/api/posts?slug=test-post', {
            method: 'GET',
        });

        const res = await GET(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(Array.isArray(json.posts)).toBe(true);
        expect(json.posts[0].slug).toBe('test-post');
        expect(json.posts[0].title).toBe('Test Post');
    });

    it('GET: should return posts by category slug', async () => {
        const mockCategory = { id: 'cat123' };
        const mockPosts = [
            {
                id: 'post123',
                title: 'Post in Tech',
                slug: 'post-in-tech',
                content: 'Sample content',
                author: {
                    username: 'ann',
                    profilePicture: 'https://image.com/pic.jpg',
                    name: 'Ann',
                    lastName: 'Keller',
                },
                category: {
                    name: 'Tech',
                    slug: 'tech',
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        // Mock category lookup by slug
        (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);

        // Mock post query using categoryId
        (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

        const req = new Request('http://localhost/api/posts?category=tech', {
            method: 'GET',
        });

        const res = await GET(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.posts).toHaveLength(1);
        expect(json.posts[0].category.slug).toBe('tech');
    });

    it('GET: should return empty posts array for non-existing category slug', async () => {
        // Category lookup returns null
        (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

        const req = new Request('http://localhost/api/posts?category=nonexistent-cat', {
            method: 'GET',
        });

        const res = await GET(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(Array.isArray(json.posts)).toBe(true);
        expect(json.posts).toHaveLength(0);
    });

    it('GET: should return posts by type', async () => {
        const mockPosts = [
            {
                id: 'post456',
                title: 'An Article Post',
                slug: 'article-post',
                content: 'Content of the article.',
                type: 'ARTICLE',
                author: {
                    username: 'ann',
                    profilePicture: 'https://image.com/profile.jpg',
                    name: 'Ann',
                    lastName: 'Keller',
                },
                category: {
                    name: 'General',
                    slug: 'general',
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);

        const req = new Request('http://localhost/api/posts?type=ARTICLE', {
            method: 'GET',
        });

        const res = await GET(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(Array.isArray(json.posts)).toBe(true);
        expect(json.posts[0].type).toBe('ARTICLE');
    });

    it('PATCH: should update a post', async () => {
        (prisma.post.findFirst as jest.Mock).mockResolvedValue({ id: 'post123', title: 'Old' });
        (prisma.post.update as jest.Mock).mockResolvedValue({ id: 'post123', title: 'Updated', type: 'ARTICLE' });

        const req = new Request('http://localhost/api/posts', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token',
            },
            body: JSON.stringify({
                id: 'post123',
                title: 'Updated',
                content: 'Updated content', // required by schema
                categoryId: 'cat123',       // required by schema
                type: 'ARTICLE',            // required by schema
            }),
        });

        const res = await PATCH(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.post.title).toBe('Updated');
    });

    it('PATCH: should fail to update a non-existent post', async () => {
        (prisma.post.findFirst as jest.Mock).mockResolvedValue(null); // Post not found

        const req = new Request('http://localhost/api/posts', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token',
            },
            body: JSON.stringify({
                id: 'nonexistent',
                title: 'Updated',
                content: 'This is updated content.',
                categoryId: 'cat123',
                type: 'ARTICLE',
            }),
        });

        const res = await PATCH(req as any);
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.error).toBe('Post not found');
    });

    it('DELETE: should delete a post', async () => {
        (prisma.post.findFirst as jest.Mock).mockResolvedValue({ id: 'post123' });
        (prisma.post.delete as jest.Mock).mockResolvedValue({ id: 'post123' });

        const req = new Request('http://localhost/api/posts', {
            method: 'DELETE',
            headers: { authorization: 'Bearer token' },
            body: JSON.stringify({ id: 'post123' }),
        });

        const res = await DELETE(req as any);
        const json = await res.json();

        expect(json.success).toBe(true);
        expect(json.message).toBe('Post deleted successfully');
    });

    it('DELETE: should fail to delete a non-existent post', async () => {
        (prisma.post.findFirst as jest.Mock).mockResolvedValue(null); // Post not found

        const req = new Request('http://localhost/api/posts', {
            method: 'DELETE',
            headers: { authorization: 'Bearer token' },
            body: JSON.stringify({ id: 'nonexistent-post' }),
        });

        const res = await DELETE(req as any);
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.error).toBe('Post not found');
    });

    it('DELETE: should fail to delete post without authorization', async () => {
        const req = new Request('http://localhost/api/posts', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // ❌ No Authorization header
            },
            body: JSON.stringify({ id: 'post123' }),
        });

        const res = await DELETE(req as any);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toBe('Unauthorized - No Token Provided');
    });
});
