/**
 * @jest-environment node
 */

import { GET, POST, PATCH, DELETE } from '../../api/user/route';
import prisma from '@/prisma/client';

jest.mock('@/prisma/client', () => ({
    user: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('@/utils/auth', () => ({
    verifyToken: jest.fn(() => ({ id: 'user123' })),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn(() => 'hashedPassword'),
}));

describe('User API', () => {
    const validUser = {
        id: 'user123',
        username: 'annkeller',
        email: 'ann@example.com',
        password: 'hashedPassword',
        bio: 'Test bio',
        profilePicture: '',
        role: 'USER',
        name: 'Ann',
        lastName: 'Keller',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    it('GET: should return all users', async () => {
        (prisma.user.findMany as jest.Mock).mockResolvedValue([validUser]);

        const req = new Request('http://localhost/api/user', {
            method: 'GET',
            headers: { Authorization: 'Bearer token' },
        });

        const res = await GET(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.users).toHaveLength(1);
    });

    it('POST: should create a user', async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null); // email check
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null); // username check
        (prisma.user.create as jest.Mock).mockResolvedValue(validUser);

        const req = new Request('http://localhost/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
            body: JSON.stringify({
                username: 'annkeller',
                email: 'ann@example.com',
                password: 'securepassword',
            }),
        });

        const res = await POST(req as any);
        const json = await res.json();

        console.log('json-----', json)
        expect(res.status).toBe(201);
        expect(json.success).toBe(true);
        expect(json.user.email).toBe('ann@example.com');
    });

    it('POST: should fail to create user if email already exists', async () => {
        // Mock existing email
        (prisma.user.findFirst as jest.Mock)
            .mockResolvedValue({ id: 'existing-id' }); // email check

        const req = new Request('http://localhost/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer token',
            },
            body: JSON.stringify({
                username: 'newuser',
                email: 'ann@example.com', // Duplicate email
                password: 'securepassword',
            }),
        });

        const res = await POST(req as any);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toBe('Email already exists');
    });

    it('POST: should fail to create user without authorization', async () => {
        const req = new Request('http://localhost/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // ❌ No Authorization header
            },
            body: JSON.stringify({
                username: 'annkeller',
                email: 'ann@example.com',
                password: 'securepassword',
            }),
        });

        const res = await POST(req as any);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.error).toBe('Unauthorized - No Token Provided');
    });


    it('PATCH: should update a user', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(validUser); // current user
        (prisma.user.update as jest.Mock).mockResolvedValue({ ...validUser, name: 'Updated' });

        const req = new Request('http://localhost/api/user', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
            body: JSON.stringify({ email: 'ann@example.com', name: 'Updated' }),
        });

        const res = await PATCH(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.user.name).toBe('Updated');
    });

    it('DELETE: should delete a user', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(validUser);
        (prisma.user.delete as jest.Mock).mockResolvedValue(validUser);

        const req = new Request('http://localhost/api/user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
            body: JSON.stringify({ email: 'ann@example.com' }),
        });

        const res = await DELETE(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.message).toBe('User deleted successfully');
    });
});
