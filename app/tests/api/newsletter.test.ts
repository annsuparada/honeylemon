import { NextRequest } from 'next/server';
import { POST, GET, DELETE } from '@/app/api/newsletter/route';

// Mock Prisma
jest.mock('@/prisma/client', () => ({
    newsletter: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
    },
}));

// Mock email service
jest.mock('@/utils/emailService', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
}));

// Mock crypto for token verification
jest.mock('crypto', () => ({
    createHmac: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid-token')
    })),
    timingSafeEqual: jest.fn().mockReturnValue(true)
}));

import prisma from '@/prisma/client';
import { sendEmail } from '@/utils/emailService';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('/api/newsletter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST', () => {
        it('should subscribe a new email successfully', async () => {
            const email = 'test@example.com';
            const mockSubscription = {
                id: '1',
                email,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.newsletter.findUnique.mockResolvedValue(null);
            mockPrisma.newsletter.create.mockResolvedValue(mockSubscription);
            mockSendEmail.mockResolvedValue(true);

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.message).toContain('Successfully subscribed');
            expect(mockPrisma.newsletter.create).toHaveBeenCalledWith({
                data: {
                    email,
                    isActive: true,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                },
            });
            expect(mockSendEmail).toHaveBeenCalledWith({
                to: email,
                subject: 'Welcome to Travomad Newsletter!',
                html: expect.any(String),
            });
        });

        it('should return error for invalid email', async () => {
            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email: 'invalid-email' }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('valid email address');
        });

        it('should return error for already subscribed email', async () => {
            const email = 'existing@example.com';
            const existingSubscription = {
                id: '1',
                email,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.newsletter.findUnique.mockResolvedValue(existingSubscription);

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.error).toContain('already subscribed');
        });

        it('should reactivate inactive subscription', async () => {
            const email = 'inactive@example.com';
            const inactiveSubscription = {
                id: '1',
                email,
                isActive: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const reactivatedSubscription = {
                ...inactiveSubscription,
                isActive: true,
                updatedAt: new Date(),
            };

            mockPrisma.newsletter.findUnique.mockResolvedValue(inactiveSubscription);
            mockPrisma.newsletter.update.mockResolvedValue(reactivatedSubscription);
            mockSendEmail.mockResolvedValue(true);

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email }),
                headers: { 'Content-Type': 'application/json' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toContain('resubscribed');
            expect(mockPrisma.newsletter.update).toHaveBeenCalledWith({
                where: { email },
                data: { isActive: true, updatedAt: expect.any(Date) },
            });
        });
    });

    describe('GET', () => {
        it('should return all active subscriptions', async () => {
            const mockSubscriptions = [
                {
                    id: '1',
                    email: 'test1@example.com',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: '2',
                    email: 'test2@example.com',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            mockPrisma.newsletter.findMany.mockResolvedValue(mockSubscriptions);

            const request = new NextRequest('http://localhost:3000/api/newsletter');
            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.subscriptions).toHaveLength(2);
            expect(mockPrisma.newsletter.findMany).toHaveBeenCalledWith({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
            });
        });
    });

    describe('DELETE', () => {
        it('should unsubscribe email successfully', async () => {
            const email = 'test@example.com';
            const token = 'valid-token';
            const subscription = {
                id: '1',
                email,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrisma.newsletter.findUnique.mockResolvedValue(subscription);
            mockPrisma.newsletter.update.mockResolvedValue({
                ...subscription,
                isActive: false,
                updatedAt: new Date(),
            });

            const request = new NextRequest(`http://localhost:3000/api/newsletter?email=${email}&token=${token}`);
            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.message).toContain('unsubscribed');
            expect(mockPrisma.newsletter.update).toHaveBeenCalledWith({
                where: { email },
                data: { isActive: false, updatedAt: expect.any(Date) },
            });
        });

        it('should return error for non-existent email', async () => {
            const email = 'nonexistent@example.com';
            const token = 'valid-token';

            mockPrisma.newsletter.findUnique.mockResolvedValue(null);

            const request = new NextRequest(`http://localhost:3000/api/newsletter?email=${email}&token=${token}`);
            const response = await DELETE(request);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.error).toContain('not found');
        });
    });
});
