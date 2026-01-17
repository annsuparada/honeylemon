/**
 * @jest-environment node
 */

process.env.SECRET_KEY = 'mocked_secret_key';

import prisma from '@/prisma/client';
import bcrypt from 'bcrypt';

jest.mock('@/prisma/client', () => ({
    user: {
        findFirst: jest.fn(),
    },
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mocked.jwt.token'),
}));

describe('Login API', () => {
    let POST: (req: Request) => Promise<Response>;

    beforeAll(async () => {
        // Import the handler AFTER setting env
        POST = (await import('../../app/api/login/route')).POST;
    });
    const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'USER',
    };

    it('POST: should login successfully with valid credentials', async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);

        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'validpassword' }),
        });

        const res = await POST(req as any);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.message).toBe('Login successful');
        expect(json.token).toBe('mocked.jwt.token');
        expect(json.user.email).toBe('test@example.com');
    });

    it('POST: should fail with invalid email', async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'wrong@example.com', password: 'password' }),
        });

        const res = await POST(req as any);
        const json = await res.json();

        expect(res.status).toBe(402);
        expect(json.message).toBe('Email is invalid');
    });

    it('POST: should fail with wrong password', async () => {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
        });

        const res = await POST(req as any);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.message).toBe('Password is invalid');
    });

    it('POST: should handle server error', async () => {
        (prisma.user.findFirst as jest.Mock).mockRejectedValue(new Error('Server error'));

        const req = new Request('http://localhost/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        });

        const res = await POST(req as any);
        const json = await res.json();

        expect(res.status).toBe(500);
        expect(json.error).toBe('Internal server error');
    });
});
