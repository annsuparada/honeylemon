import { NextRequest } from 'next/server'
import { POST } from '@/app/api/campaign/preview/route'

// Mock email service
jest.mock('@/utils/emailService', () => ({
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

describe('/api/campaign/preview', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset crypto mocks
        mockHmac.update.mockClear()
        mockHmac.digest.mockClear()
        const crypto = require('crypto')
        crypto.createHmac.mockClear()
    })

    describe('POST - Send preview email', () => {
        it('should send preview email successfully', async () => {
            const { sendEmail } = require('@/utils/emailService')
            sendEmail.mockResolvedValue(true)

            const requestBody = {
                to: 'test@example.com',
                subject: 'Test Campaign',
                content: 'This is a test campaign content'
            }

            const request = new NextRequest('http://localhost:3000/api/campaign/preview', {
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
            expect(data.message).toBe('Preview email sent successfully')
            expect(sendEmail).toHaveBeenCalledWith({
                to: 'test@example.com',
                subject: '[PREVIEW] Test Campaign',
                html: expect.stringContaining('PREVIEW EMAIL')
            })
        })

        it('should handle email sending failure', async () => {
            const { sendEmail } = require('@/utils/emailService')
            sendEmail.mockResolvedValue(false)

            const requestBody = {
                to: 'test@example.com',
                subject: 'Test Campaign',
                content: 'This is a test campaign content'
            }

            const request = new NextRequest('http://localhost:3000/api/campaign/preview', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.success).toBe(false)
            expect(data.error).toBe('Failed to send preview email. Please check your email configuration.')
        })

        it('should return error for invalid email', async () => {
            const requestBody = {
                to: 'invalid-email',
                subject: 'Test Campaign',
                content: 'This is a test campaign content'
            }

            const request = new NextRequest('http://localhost:3000/api/campaign/preview', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.success).toBe(false)
            expect(data.error).toBe('Please enter a valid email address')
        })

        it('should return error for empty subject', async () => {
            const requestBody = {
                to: 'test@example.com',
                subject: '',
                content: 'This is a test campaign content'
            }

            const request = new NextRequest('http://localhost:3000/api/campaign/preview', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.success).toBe(false)
            expect(data.error).toBe('Subject is required')
        })

        it('should return error for empty content', async () => {
            const requestBody = {
                to: 'test@example.com',
                subject: 'Test Campaign',
                content: ''
            }

            const request = new NextRequest('http://localhost:3000/api/campaign/preview', {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.success).toBe(false)
            expect(data.error).toBe('Content is required')
        })
    })
})

