import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/campaign/route'
import prisma from '@/prisma/client'

// Mock Prisma
jest.mock('@/prisma/client', () => ({
    __esModule: true,
    default: {
        newsletter: {
            findMany: jest.fn(),
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
}))

describe('/api/campaign', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset crypto mocks
        mockHmac.update.mockClear()
        mockHmac.digest.mockClear()
        const crypto = require('crypto')
        crypto.createHmac.mockClear()
    })

    describe('POST - Send campaign', () => {
        const mockSubscribers = [
            { email: 'test1@example.com', isActive: true },
            { email: 'test2@example.com', isActive: true },
            { email: 'test3@example.com', isActive: false },
        ]

        it('should send campaign to active subscribers successfully', async () => {
            const { sendEmail } = require('@/utils/services/emailService')
            sendEmail.mockResolvedValue(true)

            mockPrisma.newsletter.findMany.mockResolvedValue(
                mockSubscribers.filter(sub => sub.isActive)
            )

            const requestBody = {
                subject: 'Test Campaign',
                content: 'This is a test campaign content',
                recipientType: 'active'
            }

            const request = new NextRequest('http://localhost:3000/api/campaign', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.sentCount).toBe(2)
            expect(data.failedCount).toBe(0)
            expect(data.totalRecipients).toBe(2)
            expect(sendEmail).toHaveBeenCalledTimes(2)
        })

        it('should send campaign to all subscribers successfully', async () => {
            const { sendEmail } = require('@/utils/services/emailService')
            sendEmail.mockResolvedValue(true)

            mockPrisma.newsletter.findMany.mockResolvedValue(mockSubscribers)

            const requestBody = {
                subject: 'Test Campaign',
                content: 'This is a test campaign content',
                recipientType: 'all'
            }

            const request = new NextRequest('http://localhost:3000/api/campaign', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.sentCount).toBe(3)
            expect(data.failedCount).toBe(0)
            expect(data.totalRecipients).toBe(3)
            expect(sendEmail).toHaveBeenCalledTimes(3)
        })

        it('should handle email sending failures', async () => {
            const { sendEmail } = require('@/utils/services/emailService')
            sendEmail.mockResolvedValueOnce(true) // First email succeeds
            sendEmail.mockResolvedValueOnce(false) // Second email fails

            mockPrisma.newsletter.findMany.mockResolvedValue(
                mockSubscribers.filter(sub => sub.isActive)
            )

            const requestBody = {
                subject: 'Test Campaign',
                content: 'This is a test campaign content',
                recipientType: 'active'
            }

            const request = new NextRequest('http://localhost:3000/api/campaign', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.sentCount).toBe(1)
            expect(data.failedCount).toBe(1)
            expect(data.totalRecipients).toBe(2)
            expect(data.errors).toHaveLength(1)
            expect(data.errors[0]).toContain('Failed to send to')
        })

        it('should return error when no subscribers found', async () => {
            mockPrisma.newsletter.findMany.mockResolvedValue([])

            const requestBody = {
                subject: 'Test Campaign',
                content: 'This is a test campaign content',
                recipientType: 'active'
            }

            const request = new NextRequest('http://localhost:3000/api/campaign', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('No active subscribers found')
        })

        it('should return error for invalid request body', async () => {
            const requestBody = {
                subject: '', // Empty subject
                content: 'This is a test campaign content',
                recipientType: 'active'
            }

            const request = new NextRequest('http://localhost:3000/api/campaign', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Subject is required')
        })

        it('should return error for invalid recipient type', async () => {
            const requestBody = {
                subject: 'Test Campaign',
                content: 'This is a test campaign content',
                recipientType: 'invalid' // Invalid recipient type
            }

            const request = new NextRequest('http://localhost:3000/api/campaign', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toContain('Invalid enum value')
        })
    })

    describe('GET - Campaign statistics', () => {
        it('should return campaign statistics for active subscribers', async () => {
            const mockSubscribers = [
                { email: 'test1@example.com', isActive: true },
                { email: 'test2@example.com', isActive: true },
            ]

            mockPrisma.newsletter.findMany.mockResolvedValue(mockSubscribers)

            const request = new NextRequest('http://localhost:3000/api/campaign?recipientType=active')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.recipientType).toBe('active')
            expect(data.count).toBe(2)
            expect(data.subscribers).toHaveLength(2)
            expect(data.subscribers[0]).toEqual({
                email: 'test1@example.com',
                isActive: true,
            })
        })

        it('should return campaign statistics for all subscribers by default', async () => {
            const mockSubscribers = [
                { email: 'test1@example.com', isActive: true },
                { email: 'test2@example.com', isActive: false },
                { email: 'test3@example.com', isActive: true },
            ]

            mockPrisma.newsletter.findMany.mockResolvedValue(mockSubscribers)

            const request = new NextRequest('http://localhost:3000/api/campaign')

            const response = await GET(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.recipientType).toBe('all')
            expect(data.count).toBe(3)
            expect(data.subscribers).toHaveLength(3)
        })
    })
})
