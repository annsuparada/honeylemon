import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import EmailDashboardTabs from '@/app/dashboard/email/components/EmailDashboardTabs'

// Mock the child components
jest.mock('@/app/dashboard/email/components/EmailList', () => {
    return function MockEmailList({ subscriptions }: { subscriptions: any[] }) {
        return <div data-testid="email-list">Email List Component - {subscriptions.length} subscriptions</div>
    }
})

jest.mock('@/app/dashboard/email/components/EmailCampaign', () => {
    return function MockEmailCampaign({ subscriptions }: { subscriptions: any[] }) {
        return <div data-testid="email-campaign">Email Campaign Component - {subscriptions.length} subscriptions</div>
    }
})

const mockSubscriptions = [
    {
        id: '1',
        email: 'test1@example.com',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
    },
    {
        id: '2',
        email: 'test2@example.com',
        isActive: false,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
    }
]

describe('EmailDashboardTabs', () => {
    it('renders with subscribers tab active by default', () => {
        render(<EmailDashboardTabs subscriptions={mockSubscriptions} />)

        // Check that subscribers tab is active - get the button specifically
        const subscribersTabButton = screen.getByRole('button', { name: /subscribers/i })
        expect(subscribersTabButton).toHaveClass('border-primary')
        expect(subscribersTabButton).toHaveClass('text-primary')

        // Check that campaign tab is not active
        const campaignTabButton = screen.getByRole('button', { name: /email campaigns/i })
        expect(campaignTabButton).toHaveClass('border-transparent')
        expect(campaignTabButton).toHaveClass('text-base-content/60')

        // Check that email list component is rendered
        expect(screen.getByTestId('email-list')).toBeInTheDocument()
        expect(screen.queryByTestId('email-campaign')).not.toBeInTheDocument()
    })

    it('switches to campaign tab when clicked', () => {
        render(<EmailDashboardTabs subscriptions={mockSubscriptions} />)

        // Click on campaign tab
        const campaignTabButton = screen.getByRole('button', { name: /email campaigns/i })
        fireEvent.click(campaignTabButton)

        // Check that campaign tab is now active
        expect(campaignTabButton).toHaveClass('border-primary')
        expect(campaignTabButton).toHaveClass('text-primary')

        // Check that subscribers tab is not active
        const subscribersTabButton = screen.getByRole('button', { name: /subscribers/i })
        expect(subscribersTabButton).toHaveClass('border-transparent')
        expect(subscribersTabButton).toHaveClass('text-base-content/60')

        // Check that campaign component is rendered
        expect(screen.getByTestId('email-campaign')).toBeInTheDocument()
        expect(screen.queryByTestId('email-list')).not.toBeInTheDocument()
    })

    it('switches back to subscribers tab when clicked', () => {
        render(<EmailDashboardTabs subscriptions={mockSubscriptions} />)

        // First switch to campaign tab
        const campaignTabButton = screen.getByRole('button', { name: /email campaigns/i })
        fireEvent.click(campaignTabButton)

        // Then switch back to subscribers tab
        const subscribersTabButton = screen.getByRole('button', { name: /subscribers/i })
        fireEvent.click(subscribersTabButton)

        // Check that subscribers tab is active again
        expect(subscribersTabButton).toHaveClass('border-primary')
        expect(subscribersTabButton).toHaveClass('text-primary')
        expect(campaignTabButton).toHaveClass('border-transparent')
        expect(campaignTabButton).toHaveClass('text-base-content/60')

        // Check that email list component is rendered again
        expect(screen.getByTestId('email-list')).toBeInTheDocument()
        expect(screen.queryByTestId('email-campaign')).not.toBeInTheDocument()
    })

    it('displays correct tab descriptions', () => {
        render(<EmailDashboardTabs subscriptions={mockSubscriptions} />)

        // Check subscribers tab description
        expect(screen.getByText('Manage your newsletter subscribers')).toBeInTheDocument()

        // Switch to campaign tab
        const campaignTabButton = screen.getByRole('button', { name: /email campaigns/i })
        fireEvent.click(campaignTabButton)

        // Check campaign tab description
        expect(screen.getByText('Create and send email campaigns')).toBeInTheDocument()
    })

    it('passes subscriptions to child components', () => {
        render(<EmailDashboardTabs subscriptions={mockSubscriptions} />)

        // Check that email list receives subscriptions
        expect(screen.getByTestId('email-list')).toHaveTextContent('2 subscriptions')

        // Switch to campaign tab
        const campaignTabButton = screen.getByRole('button', { name: /email campaigns/i })
        fireEvent.click(campaignTabButton)

        // Check that campaign component receives subscriptions
        expect(screen.getByTestId('email-campaign')).toHaveTextContent('2 subscriptions')
    })

    it('renders tab icons', () => {
        render(<EmailDashboardTabs subscriptions={mockSubscriptions} />)

        // Check that SVG icons are present (they should be rendered as SVG elements)
        const tabButtons = screen.getAllByRole('button')
        expect(tabButtons).toHaveLength(2)

        // Each tab button should contain an SVG element
        tabButtons.forEach(button => {
            const svg = button.querySelector('svg')
            expect(svg).toBeInTheDocument()
        })
    })

    it('has proper accessibility attributes', () => {
        render(<EmailDashboardTabs subscriptions={mockSubscriptions} />)

        // Check that nav has proper aria-label
        const nav = screen.getByLabelText('Tabs')
        expect(nav).toBeInTheDocument()

        // Check that tab buttons are properly labeled
        const subscribersTabButton = screen.getByRole('button', { name: /subscribers/i })
        const campaignTabButton = screen.getByRole('button', { name: /email campaigns/i })

        expect(subscribersTabButton).toBeInTheDocument()
        expect(campaignTabButton).toBeInTheDocument()
    })
})
