import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import EmailList from '@/app/dashboard/email/components/EmailList'

// Mock fetch
global.fetch = jest.fn()

jest.mock('@honeylemon/ui', () => {
    const actual = jest.requireActual('@honeylemon/ui');
    return {
        ...actual,
        FormattedDate: function MockFormattedDate({ dateString }: { dateString: string }) {
            return <span data-testid="formatted-date">{new Date(dateString).toLocaleDateString()}</span>
        },
    };
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
        window.confirm = jest.fn()
        window.alert = jest.fn()
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

    it('calls confirmation dialog before unsubscribing', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: 'Successfully unsubscribed' })
            })

        render(<EmailList subscriptions={mockSubscriptions} />)

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: /unsubscribe/i }))

        expect(window.confirm).toHaveBeenCalledWith(
            'Are you sure you want to unsubscribe active@example.com from the newsletter?'
        )
    })

    it('does not unsubscribe when confirmation is cancelled', async () => {
        window.confirm = jest.fn(() => false)

        render(<EmailList subscriptions={mockSubscriptions} />)

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: /unsubscribe/i }))

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

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: /unsubscribe/i }))

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

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: /unsubscribe/i }))

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

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: /unsubscribe/i }))

        expect(await screen.findAllByText('Unsubscribed')).toHaveLength(2)
        expect(screen.queryByRole('button', { name: /^unsubscribe$/i })).not.toBeInTheDocument()
    })

    it('shows error alert on API failure', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({ error: 'Failed to unsubscribe' })
            })

        render(<EmailList subscriptions={mockSubscriptions} />)

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: /unsubscribe/i }))

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to unsubscribe: Failed to unsubscribe')
        })
    })

    it('shows error alert on network error', async () => {
        window.confirm = jest.fn(() => true)
            ; (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

        render(<EmailList subscriptions={mockSubscriptions} />)

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: /unsubscribe/i }))

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

        const unsubscribeButton = screen.getByRole('button', { name: /unsubscribe/i })
        const user = userEvent.setup()
        await user.click(unsubscribeButton)

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

        expect(screen.getByText('2')).toBeInTheDocument() // Total
        expect(screen.getAllByText('1')).toHaveLength(2) // Active count appears twice (stats + table)

        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: /unsubscribe/i }))

        await waitFor(() => {
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

        const unsubscribeButtons = screen.getAllByRole('button', { name: /unsubscribe/i })
        expect(unsubscribeButtons).toHaveLength(2)

        const user = userEvent.setup()
        await user.click(unsubscribeButtons[0])

        expect(await screen.findByText('Unsubscribed')).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getAllByRole('button', { name: /unsubscribe/i })).toHaveLength(1)
        })

        const remainingButton = screen.getByRole('button', { name: /unsubscribe/i })
        await user.click(remainingButton)

        await waitFor(() => {
            expect(screen.getAllByText('Unsubscribed')).toHaveLength(2)
            expect(screen.queryByRole('button', { name: /^unsubscribe$/i })).not.toBeInTheDocument()
        })
    })
})
