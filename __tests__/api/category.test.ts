/**
 * @jest-environment node
 */

import { POST, GET, PATCH, DELETE } from '../../app/api/category/route';
import prisma from '@/prisma/client';

jest.mock('@/prisma/client', () => ({
    category: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('@/utils/helpers/auth', () => ({
    verifyToken: jest.fn(() => ({ id: 'user123' })),
}));

describe('Category API', () => {
    const validCategory = {
        id: 'cat123',
        name: 'Tech',
        slug: 'tech',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('GET: should return all categories', async () => {
        (prisma.category.findMany as jest.Mock).mockResolvedValue([validCategory]);

        const res = await GET();
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.categories).toHaveLength(1);
        expect(json.categories[0].name).toBe('Tech');
    });

    it('POST: should create a category', async () => {
        (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);
        (prisma.category.create as jest.Mock).mockResolvedValue(validCategory);

        const req = new Request('http://localhost/api/category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token',
            },
            body: JSON.stringify({ name: 'Tech' }),
        });

        const res = await POST(req as any);
        const json = await res.json();

        expect(res.status).toBe(201);
        expect(json.success).toBe(true);
        expect(json.category.name).toBe('Tech');
    });

    it('PATCH: should update a category', async () => {
        (prisma.category.findUnique as jest.Mock).mockResolvedValue(validCategory);
        (prisma.category.update as jest.Mock).mockResolvedValue({ ...validCategory, name: 'Updated Tech' });

        const req = new Request('http://localhost/api/category', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token',
            },
            body: JSON.stringify({ id: 'cat123', name: 'Updated Tech' }),
        });

        const res = await PATCH(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.category.name).toBe('Updated Tech');
    });

    it('DELETE: should delete a category', async () => {
        (prisma.category.findUnique as jest.Mock).mockResolvedValue(validCategory);
        (prisma.category.delete as jest.Mock).mockResolvedValue(validCategory);

        const req = new Request('http://localhost/api/category', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token',
            },
            body: JSON.stringify({ id: 'cat123' }),
        });

        const res = await DELETE(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.message).toBe('Category deleted successfully');
    });

    it('POST: should fail to create category if name exists', async () => {
        (prisma.category.findUnique as jest.Mock).mockResolvedValue(validCategory);

        const req = new Request('http://localhost/api/category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token',
            },
            body: JSON.stringify({ name: 'Tech' }),
        });

        const res = await POST(req as any);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toBe('Category already exists');
    });

    it('PATCH: should fail to update a non-existent category', async () => {
        (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

        const req = new Request('http://localhost/api/category', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token',
            },
            body: JSON.stringify({ id: 'nonexistent', name: 'Update' }),
        });

        const res = await PATCH(req as any);
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.error).toBe('Category not found');
    });

    it('DELETE: should fail to delete non-existent category', async () => {
        (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

        const req = new Request('http://localhost/api/category', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token',
            },
            body: JSON.stringify({ id: 'nonexistent' }),
        });

        const res = await DELETE(req as any);
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.error).toBe('Category not found');
    });
});
