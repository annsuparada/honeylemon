import { NextRequest } from 'next/server'
import { POST, GET, DELETE } from '@/app/api/newsletter/route'
import prisma from '@/prisma/client'

// Mock Prisma
jest.mock('@/prisma/client', () => ({
    __esModule: true,
    default: {
        newsletter: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    },
}))

const mockPrisma = prisma as any

// Mock email service
jest.mock('@/utils/services/emailService', () => ({
    sendEmail: jest.fn(),
}))

// Mock crypto
const mockHmac = {
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => 'mock-token')
}

jest.mock('crypto', () => ({
    createHmac: jest.fn(() => mockHmac),
    timingSafeEqual: jest.fn(() => true)
}))

describe('/api/newsletter', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset crypto mocks
        mockHmac.update.mockClear()
        mockHmac.digest.mockClear()
        const crypto = require('crypto')
        crypto.createHmac.mockClear()
        crypto.timingSafeEqual.mockClear()
        // Reset timingSafeEqual to return true by default
        crypto.timingSafeEqual.mockReturnValue(true)
    })

    describe('POST - Subscribe to newsletter', () => {
        it('should create new subscription successfully', async () => {
            const mockSubscription = {
                id: '1',
                email: 'test@example.com',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrisma.newsletter.findUnique.mockResolvedValue(null)
            mockPrisma.newsletter.create.mockResolvedValue(mockSubscription)

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
                headers: { 'Content-Type': 'application/json' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(201)
            expect(data.success).toBe(true)
            expect(data.message).toBe('Successfully subscribed to our newsletter!')
            expect(mockPrisma.newsletter.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@example.com',
                    isActive: true,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                },
            })
        })

        it('should reactivate existing inactive subscription', async () => {
            const existingSubscription = {
                id: '1',
                email: 'test@example.com',
                isActive: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const reactivatedSubscription = {
                ...existingSubscription,
                isActive: true,
                updatedAt: new Date(),
            }

            mockPrisma.newsletter.findUnique.mockResolvedValue(existingSubscription)
            mockPrisma.newsletter.update.mockResolvedValue(reactivatedSubscription)

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
                headers: { 'Content-Type': 'application/json' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.message).toBe('Successfully resubscribed to our newsletter!')
            expect(mockPrisma.newsletter.update).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                data: { isActive: true, updatedAt: expect.any(Date) },
            })
        })

        it('should return error for already active subscription', async () => {
            const existingSubscription = {
                id: '1',
                email: 'test@example.com',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrisma.newsletter.findUnique.mockResolvedValue(existingSubscription)

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
                headers: { 'Content-Type': 'application/json' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('This email is already subscribed to our newsletter')
        })

        it('should return error for invalid email', async () => {
            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email: 'invalid-email' }),
                headers: { 'Content-Type': 'application/json' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Please enter a valid email address')
        })
    })

    describe('POST - Admin unsubscribe', () => {
        it('should unsubscribe active subscription successfully', async () => {
            const existingSubscription = {
                id: '1',
                email: 'test@example.com',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrisma.newsletter.findUnique.mockResolvedValue(existingSubscription)
            mockPrisma.newsletter.update.mockResolvedValue({
                ...existingSubscription,
                isActive: false,
                updatedAt: new Date(),
            })

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', action: 'unsubscribe' }),
                headers: { 'Content-Type': 'application/json' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.message).toBe('Successfully unsubscribed from newsletter')
            expect(mockPrisma.newsletter.update).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                data: { isActive: false, updatedAt: expect.any(Date) },
            })
        })

        it('should return error for non-existent email', async () => {
            mockPrisma.newsletter.findUnique.mockResolvedValue(null)

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email: 'nonexistent@example.com', action: 'unsubscribe' }),
                headers: { 'Content-Type': 'application/json' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(404)
            expect(data.error).toBe('Email not found in our newsletter list')
        })

        it('should return error for already inactive subscription', async () => {
            const existingSubscription = {
                id: '1',
                email: 'test@example.com',
                isActive: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrisma.newsletter.findUnique.mockResolvedValue(existingSubscription)

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', action: 'unsubscribe' }),
                headers: { 'Content-Type': 'application/json' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email is already unsubscribed')
        })

        it('should return error when email is missing', async () => {
            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ action: 'unsubscribe' }),
                headers: { 'Content-Type': 'application/json' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email is required')
        })
    })

    describe('GET - Fetch all subscriptions', () => {
        it('should return all subscriptions', async () => {
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
                    isActive: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]

            mockPrisma.newsletter.findMany.mockResolvedValue(mockSubscriptions)

            const request = new NextRequest('http://localhost:3000/api/newsletter')
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.subscriptions).toEqual(mockSubscriptions)
            expect(mockPrisma.newsletter.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
            })
        })

        it('should handle database errors', async () => {
            mockPrisma.newsletter.findMany.mockRejectedValue(new Error('Database error'))

            const request = new NextRequest('http://localhost:3000/api/newsletter')
            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Failed to fetch subscriptions')
        })
    })

    describe('DELETE - Unsubscribe with token', () => {
        it('should unsubscribe with valid token', async () => {
            const existingSubscription = {
                id: '1',
                email: 'test@example.com',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrisma.newsletter.findUnique.mockResolvedValue(existingSubscription)
            mockPrisma.newsletter.update.mockResolvedValue({
                ...existingSubscription,
                isActive: false,
                updatedAt: new Date(),
            })

            const request = new NextRequest('http://localhost:3000/api/newsletter?email=test@example.com&token=mock-token')
            const response = await DELETE(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.message).toBe('Successfully unsubscribed from newsletter')
            expect(mockPrisma.newsletter.update).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                data: { isActive: false, updatedAt: expect.any(Date) },
            })
        })

        it('should return error for missing email parameter', async () => {
            const request = new NextRequest('http://localhost:3000/api/newsletter?token=mock-token')
            const response = await DELETE(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email parameter is required')
        })

        it('should return error for missing token parameter', async () => {
            const request = new NextRequest('http://localhost:3000/api/newsletter?email=test@example.com')
            const response = await DELETE(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Token parameter is required')
        })

        it('should return error for invalid token', async () => {
            // Mock timingSafeEqual to return false for invalid token
            const crypto = require('crypto')
            crypto.timingSafeEqual.mockReturnValue(false)

            const request = new NextRequest('http://localhost:3000/api/newsletter?email=test@example.com&token=invalid-token')
            const response = await DELETE(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid unsubscribe token')
        })

        it('should return error for non-existent email', async () => {
            mockPrisma.newsletter.findUnique.mockResolvedValue(null)

            const request = new NextRequest('http://localhost:3000/api/newsletter?email=nonexistent@example.com&token=mock-token')
            const response = await DELETE(request)
            const data = await response.json()

            expect(response.status).toBe(404)
            expect(data.error).toBe('Email not found in our newsletter list')
        })

        it('should return error for already inactive subscription', async () => {
            const existingSubscription = {
                id: '1',
                email: 'test@example.com',
                isActive: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrisma.newsletter.findUnique.mockResolvedValue(existingSubscription)

            const request = new NextRequest('http://localhost:3000/api/newsletter?email=test@example.com&token=mock-token')
            const response = await DELETE(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email is already unsubscribed')
        })
    })

    describe('Error handling', () => {
        it('should handle database errors in POST', async () => {
            mockPrisma.newsletter.findUnique.mockRejectedValue(new Error('Database error'))

            const request = new NextRequest('http://localhost:3000/api/newsletter', {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com' }),
                headers: { 'Content-Type': 'application/json' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Failed to process newsletter request')
        })

        it('should handle database errors in DELETE', async () => {
            const existingSubscription = {
                id: '1',
                email: 'test@example.com',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            mockPrisma.newsletter.findUnique.mockResolvedValue(existingSubscription)
            mockPrisma.newsletter.update.mockRejectedValue(new Error('Database error'))

            const request = new NextRequest('http://localhost:3000/api/newsletter?email=test@example.com&token=mock-token')
            const response = await DELETE(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Failed to unsubscribe from newsletter')
        })
    })
})