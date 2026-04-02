import { NextRequest } from 'next/server';
import { GET } from '@/app/api/newsletter/verify-token/route';

// Mock crypto for token verification
jest.mock('crypto', () => ({
    createHmac: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid-token')
    })),
    timingSafeEqual: jest.fn().mockReturnValue(true)
}));

describe('/api/newsletter/verify-token', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should verify valid token successfully', async () => {
        const email = 'test@example.com';
        const token = 'valid-token';

        const request = new NextRequest(`http://localhost:3000/api/newsletter/verify-token?email=${email}&token=${token}`);
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('Token is valid');
    });

    it('should return error when email is missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/newsletter/verify-token?token=valid-token');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Email and token parameters are required');
    });

    it('should return error when token is missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/newsletter/verify-token?email=test@example.com');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Email and token parameters are required');
    });

    it('should return error when both parameters are missing', async () => {
        const request = new NextRequest('http://localhost:3000/api/newsletter/verify-token');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Email and token parameters are required');
    });

    it('should return error for invalid token', async () => {
        // Mock timingSafeEqual to return false for invalid token
        const crypto = require('crypto');
        crypto.timingSafeEqual.mockReturnValueOnce(false);

        const email = 'test@example.com';
        const token = 'invalid-token';

        const request = new NextRequest(`http://localhost:3000/api/newsletter/verify-token?email=${email}&token=${token}`);
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain('Invalid unsubscribe token');
    });
});
