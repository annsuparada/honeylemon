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
    },
    {
        id: '3',
        email: 'another@example.com',
        isActive: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
    }
]

describe('EmailList Component', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear()
    })

    it('renders statistics cards correctly', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        expect(screen.getByText('Total Subscribers')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument() // Total count

        expect(screen.getByText('Active Subscribers')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument() // Active count

        expect(screen.getByText('Inactive Subscribers')).toBeInTheDocument()
        expect(screen.getByText('1')).toBeInTheDocument() // Inactive count
    })

    it('renders all subscriptions by default', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        expect(screen.getByText('active@example.com')).toBeInTheDocument()
        expect(screen.getByText('inactive@example.com')).toBeInTheDocument()
        expect(screen.getByText('another@example.com')).toBeInTheDocument()
    })

    it('filters subscriptions by search term', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        const searchInput = screen.getByPlaceholderText('Search by email address...')
        fireEvent.change(searchInput, { target: { value: 'active' } })

        expect(screen.getByText('active@example.com')).toBeInTheDocument()
        expect(screen.getByText('inactive@example.com')).toBeInTheDocument() // Contains "active" as substring
        expect(screen.queryByText('another@example.com')).not.toBeInTheDocument()
    })

    it('filters subscriptions by status - active only', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        const activeButtons = screen.getAllByText('Active')
        const activeFilterButton = activeButtons.find(button => button.tagName === 'BUTTON')
        fireEvent.click(activeFilterButton!)

        expect(screen.getByText('active@example.com')).toBeInTheDocument()
        expect(screen.getByText('another@example.com')).toBeInTheDocument()
        expect(screen.queryByText('inactive@example.com')).not.toBeInTheDocument()
    })

    it('filters subscriptions by status - inactive only', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        const inactiveButtons = screen.getAllByText('Inactive')
        const inactiveFilterButton = inactiveButtons.find(button => button.tagName === 'BUTTON')
        fireEvent.click(inactiveFilterButton!)

        expect(screen.getByText('inactive@example.com')).toBeInTheDocument()
        expect(screen.queryByText('active@example.com')).not.toBeInTheDocument()
        expect(screen.queryByText('another@example.com')).not.toBeInTheDocument()
    })

    it('combines search and status filters', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        // Filter by active status
        const activeButtons = screen.getAllByText('Active')
        const activeFilterButton = activeButtons.find(button => button.tagName === 'BUTTON')
        fireEvent.click(activeFilterButton!)

        // Then search for specific email
        const searchInput = screen.getByPlaceholderText('Search by email address...')
        fireEvent.change(searchInput, { target: { value: 'another' } })

        expect(screen.getByText('another@example.com')).toBeInTheDocument()
        expect(screen.queryByText('active@example.com')).not.toBeInTheDocument()
        expect(screen.queryByText('inactive@example.com')).not.toBeInTheDocument()
    })

    it('shows correct status badges', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        const activeBadges = screen.getAllByText('Active')
        const inactiveBadges = screen.getAllByText('Inactive')

        // Should have 3 active elements (1 filter button + 2 status badges in table)
        expect(activeBadges).toHaveLength(3)
        // Should have 2 inactive elements (1 filter button + 1 status badge in table)
        expect(inactiveBadges).toHaveLength(2)
    })

    it('shows unsubscribe button for active subscribers', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButtons = screen.getAllByText('Unsubscribe')
        expect(unsubscribeButtons).toHaveLength(2) // Two active subscribers
    })

    it('shows unsubscribed badge for inactive subscribers', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribedBadges = screen.getAllByText('Unsubscribed')
        expect(unsubscribedBadges).toHaveLength(1) // One inactive subscriber
    })

    it('handles unsubscribe action successfully', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, message: 'Successfully unsubscribed' })
        })

        // Mock window.confirm
        window.confirm = jest.fn(() => true)

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getAllByText('Unsubscribe')[0]
        fireEvent.click(unsubscribeButton)

        // Should show loading state
        expect(screen.getByText('Unsubscribing...')).toBeInTheDocument()

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: 'active@example.com', action: 'unsubscribe' }),
            })
        })
    })

    it('handles unsubscribe action failure', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Failed to unsubscribe' })
        })

        // Mock window.confirm and alert
        window.confirm = jest.fn(() => true)
        window.alert = jest.fn()

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getAllByText('Unsubscribe')[0]
        fireEvent.click(unsubscribeButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to unsubscribe: Failed to unsubscribe')
        })
    })

    it('does not unsubscribe when confirmation is cancelled', () => {
        // Mock window.confirm to return false
        window.confirm = jest.fn(() => false)

        render(<EmailList subscriptions={mockSubscriptions} />)

        const unsubscribeButton = screen.getAllByText('Unsubscribe')[0]
        fireEvent.click(unsubscribeButton)

        expect(fetch).not.toHaveBeenCalled()
    })

    it('handles pagination correctly', () => {
        // Create more subscriptions to test pagination
        const manySubscriptions = Array.from({ length: 15 }, (_, i) => ({
            id: `${i + 1}`,
            email: `user${i + 1}@example.com`,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }))

        render(<EmailList subscriptions={manySubscriptions} />)

        // Should show pagination controls
        expect(screen.getByText(/Showing page/)).toBeInTheDocument()
        expect(screen.getAllByText('1')).toHaveLength(2) // Current page (span + button)
        expect(screen.getAllByText('2')).toHaveLength(2) // Total pages (span + button)
        expect(screen.getAllByText('Next')).toHaveLength(2) // Button and sr-only text

        // Click next page button (not the sr-only text)
        const nextButtons = screen.getAllByText('Next')
        const nextButton = nextButtons.find(button => button.tagName === 'BUTTON')
        fireEvent.click(nextButton!)

        expect(screen.getByText(/Showing page/)).toBeInTheDocument()
        expect(screen.getAllByText('Previous')).toHaveLength(2) // Button and sr-only text
    })

    it('shows empty state when no subscriptions match filter', () => {
        render(<EmailList subscriptions={mockSubscriptions} />)

        // Click the Inactive filter button (not the status badge)
        const inactiveButtons = screen.getAllByText('Inactive')
        const inactiveFilterButton = inactiveButtons.find(button => button.tagName === 'BUTTON')
        fireEvent.click(inactiveFilterButton!)

        // Clear the search to show only inactive
        const searchInput = screen.getByPlaceholderText('Search by email address...')
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

        expect(screen.getByText('No subscribers found matching your search.')).toBeInTheDocument()
    })

    it('resets pagination when filter changes', () => {
        const manySubscriptions = Array.from({ length: 15 }, (_, i) => ({
            id: `${i + 1}`,
            email: `user${i + 1}@example.com`,
            isActive: i < 5, // First 5 are active, rest inactive
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
        }))

        render(<EmailList subscriptions={manySubscriptions} />)

        // Go to page 2
        const nextButtons = screen.getAllByText('Next')
        const nextButton = nextButtons.find(button => button.tagName === 'BUTTON')
        fireEvent.click(nextButton!)
        expect(screen.getByText(/Showing page/)).toBeInTheDocument()

        // Filter by active - should reset to page 1 and hide pagination (only 5 items = 1 page)
        const activeButtons = screen.getAllByText('Active')
        const activeButton = activeButtons.find(button => button.tagName === 'BUTTON')
        fireEvent.click(activeButton!)

        // After filtering to active users (5 items), pagination should be hidden since there's only 1 page
        expect(screen.queryByText(/Showing page/)).not.toBeInTheDocument()
    })

    it('updates statistics when subscriptions change', () => {
        const { rerender } = render(<EmailList subscriptions={mockSubscriptions} />)

        expect(screen.getByText('3')).toBeInTheDocument() // Total
        expect(screen.getByText('2')).toBeInTheDocument() // Active
        expect(screen.getByText('1')).toBeInTheDocument() // Inactive

        // Update with new subscriptions
        const newSubscriptions = [
            ...mockSubscriptions,
            {
                id: '4',
                email: 'new@example.com',
                isActive: true,
                createdAt: '2024-01-04T00:00:00Z',
                updatedAt: '2024-01-04T00:00:00Z'
            }
        ]

        rerender(<EmailList subscriptions={newSubscriptions} />)

        expect(screen.getByText('4')).toBeInTheDocument() // Total
        expect(screen.getByText('3')).toBeInTheDocument() // Active
        expect(screen.getByText('1')).toBeInTheDocument() // Inactive
    })
})
