/**
 * @jest-environment node
 */

import { PATCH } from '@/app/api/user/password/route';
import prisma from '@/prisma/client';
import bcrypt from 'bcrypt';
import { verifyToken } from '@/utils/helpers/auth';

jest.mock('@/prisma/client');
jest.mock('@/utils/helpers/auth');
jest.mock('bcrypt');
jest.mock('@/prisma/client', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));
jest.mock('@/utils/helpers/auth', () => ({
    verifyToken: jest.fn(),
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));



const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-old-password',
};

function createMockRequestWithToken(authHeader: string, body: object) {
    return new Request('http://localhost/api/user/password', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
        },
        body: JSON.stringify(body),
    });
}


describe('PATCH /api/user/password', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 401 if token is missing', async () => {
        const req = new Request('http://localhost/api/user/password', {
            method: 'PATCH',
        });

        const res = await PATCH(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.message).toBe('Unauthorized - No token provided');
    });

    it('returns 401 if token is invalid', async () => {
        (verifyToken as jest.Mock).mockReturnValue(null);

        const req = createMockRequestWithToken('Bearer invalid', {
            currentPassword: 'old123',
            newPassword: 'new1234',
        });

        const res = await PATCH(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.message).toBe('Invalid token');
    });

    it('returns 400 if passwords are missing', async () => {
        (verifyToken as jest.Mock).mockReturnValue({ id: mockUser.id });

        const req = createMockRequestWithToken('Bearer token', {});

        const res = await PATCH(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.message).toBe('Both current and new passwords are required');
    });

    it('returns 404 if user is not found', async () => {
        (verifyToken as jest.Mock).mockReturnValue({ id: mockUser.id });
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const req = createMockRequestWithToken('Bearer token', {
            currentPassword: 'old123',
            newPassword: 'new1234',
        });

        const res = await PATCH(req);
        const json = await res.json();

        expect(res.status).toBe(404);
        expect(json.message).toBe('User not found');
    });

    it('returns 401 if current password is incorrect', async () => {
        (verifyToken as jest.Mock).mockReturnValue({ id: mockUser.id });
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false); // current password mismatch

        const req = createMockRequestWithToken('Bearer token', {
            currentPassword: 'wrong-password',
            newPassword: 'new1234',
        });

        const res = await PATCH(req);
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json.message).toBe('Current password is incorrect');
    });

    it('returns 400 if new password is same as old', async () => {
        (verifyToken as jest.Mock).mockReturnValue({ id: mockUser.id });
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock)
            .mockResolvedValueOnce(true)  // current password valid
            .mockResolvedValueOnce(true); // new password same

        const req = createMockRequestWithToken('Bearer token', {
            currentPassword: 'old123',
            newPassword: 'old123',
        });

        const res = await PATCH(req);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.message).toBe('New password must be different than current password');
    });

    it('updates password successfully', async () => {
        (verifyToken as jest.Mock).mockReturnValue({ id: mockUser.id });
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock)
            .mockResolvedValueOnce(true)  // current password valid
            .mockResolvedValueOnce(false); // new password different
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-new-password');
        (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, password: 'hashed-new-password' });

        const req = createMockRequestWithToken('Bearer token', {
            currentPassword: 'old123',
            newPassword: 'new1234',
        });

        const res = await PATCH(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.message).toBe('Password updated successfully');
        expect(prisma.user.update).toHaveBeenCalled();
    });
});
