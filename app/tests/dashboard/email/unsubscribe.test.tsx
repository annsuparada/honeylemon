import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import EmailList from '@/app/dashboard/email/components/EmailList'

// Mock fetch
global.fetch = jest.fn()

// Mock FormattedDate component
jest.mock('@/app/components/FormattedDate', () => {
    return function MockFormattedDate({ dateString }: { dateString: string }) {
        return <span data-testid="formatted-date">{new Date(dateString).toLocaleDateString()}</span>
    }
})

const mockSubscriptions = [
    {
        id: '1',
        email: 'active@example.com',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        email: 'inactive@example.com',
        isActive: false,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
    }
]

describe('EmailList Unsubscribe Functionality', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear()
        // Mock window.confirm and alert
        window.confirm = jest.fn()
        window.alert = jest.fn()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('shows unsubscribe button for active subscribers', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButtons = screen.getAllByText('Unsubscribe')
        expect(unsubscribeButtons).toHaveLength(1) // Only one active subscriber
    })

    it('shows unsubscribed badge for inactive subscribers', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribedBadges = screen.getAllByText('Unsubscribed')
        expect(unsubscribedBadges).toHaveLength(1) // Only one inactive subscriber
    })

    it('calls confirmation dialog before unsubscribing', () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: 'Successfully unsubscribed' })
            })

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getByText('Unsubscribe')
        fireEvent.click(unsubscribeButton)

        expect(window.confirm).toHaveBeenCalledWith(
            'Are you sure you want to unsubscribe active@example.com from the newsletter?'
        )
    })

    it('does not unsubscribe when confirmation is cancelled', () => {
        window.confirm = jest.fn(() => false)

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getByText('Unsubscribe')
        fireEvent.click(unsubscribeButton)

        expect(fetch).not.toHaveBeenCalled()
    })

    it('shows loading state during unsubscribe', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({ success: true, message: 'Successfully unsubscribed' })
                }), 100))
            )

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getByText('Unsubscribe')
        fireEvent.click(unsubscribeButton)

        // Should show loading state
        expect(screen.getByText('Unsubscribing...')).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.queryByText('Unsubscribing...')).not.toBeInTheDocument()
        })
    })

    it('calls API with correct parameters', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: 'Successfully unsubscribed' })
            })

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getByText('Unsubscribe')
        fireEvent.click(unsubscribeButton)

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'active@example.com',
                    action: 'unsubscribe'
                }),
            })
        })
    })

    it('updates UI after successful unsubscribe', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: 'Successfully unsubscribed' })
            })

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getByText('Unsubscribe')
        fireEvent.click(unsubscribeButton)

        await waitFor(() => {
            // Should show unsubscribed badge instead of unsubscribe button
            expect(screen.getByText('Unsubscribed')).toBeInTheDocument()
            expect(screen.queryByText('Unsubscribe')).not.toBeInTheDocument()
        })
    })

    it('shows error alert on API failure', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Failed to unsubscribe' })
            })

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getByText('Unsubscribe')
        fireEvent.click(unsubscribeButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to unsubscribe: Failed to unsubscribe')
        })
    })

    it('shows error alert on network error', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getByText('Unsubscribe')
        fireEvent.click(unsubscribeButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to unsubscribe. Please try again.')
        })
    })

    it('disables button during unsubscribe process', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    json: async () => ({ success: true, message: 'Successfully unsubscribed' })
                }), 100))
            )

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getByText('Unsubscribe')
        fireEvent.click(unsubscribeButton)

        // Button should be disabled during loading
        expect(unsubscribeButton).toBeDisabled()

        await waitFor(() => {
            expect(screen.queryByText('Unsubscribing...')).not.toBeInTheDocument()
        })
    })

    it('updates statistics after successful unsubscribe', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: 'Successfully unsubscribed' })
            })

        render(<EmailList subscriptions={mockSubscriptions} />)

        // Initial stats: 2 total, 1 active, 1 inactive
        expect(screen.getByText('2')).toBeInTheDocument() // Total
        expect(screen.getAllByText('1')).toHaveLength(2) // Active count appears twice (stats + table)

        const unsubscribeButton = screen.getByText('Unsubscribe')
        fireEvent.click(unsubscribeButton)

        await waitFor(() => {
            // After unsubscribe: 2 total, 0 active, 2 inactive
            expect(screen.getByText('0')).toBeInTheDocument() // Active count
            expect(screen.getAllByText('2')).toHaveLength(2) // Total count and inactive count
        })
    })

    it('handles multiple unsubscribe actions correctly', async () => {
        const multipleSubscriptions = [
            {
                id: '1',
                email: 'user1@example.com',
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z'
            },
            {
                id: '2',
                email: 'user2@example.com',
                isActive: true,
                createdAt: '2024-01-02T00:00:00Z',
                updatedAt: '2024-01-02T00:00:00Z'
            }
        ]

        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({ success: true, message: 'Successfully unsubscribed' })
            })

        render(<EmailList subscriptions={multipleSubscriptions} />)

        const unsubscribeButtons = screen.getAllByText('Unsubscribe')
        expect(unsubscribeButtons).toHaveLength(2)

        // Unsubscribe first user
        fireEvent.click(unsubscribeButtons[0])

        await waitFor(() => {
            expect(screen.getByText('Unsubscribed')).toBeInTheDocument()
            expect(screen.getAllByText('Unsubscribe')).toHaveLength(1) // One remaining
        })

        // Unsubscribe second user
        const remainingButton = screen.getByText('Unsubscribe')
        fireEvent.click(remainingButton)

        await waitFor(() => {
            expect(screen.getAllByText('Unsubscribed')).toHaveLength(2)
            expect(screen.queryByText('Unsubscribe')).not.toBeInTheDocument()
        })
    })
})
