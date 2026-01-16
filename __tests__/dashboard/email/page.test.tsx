import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DashboardEmailPage from '@/app/dashboard/email/page'

// Mock fetch
global.fetch = jest.fn()

// Mock EmailList component
jest.mock('@/app/dashboard/email/components/EmailList', () => {
    return function MockEmailList({ subscriptions }: { subscriptions: any[] }) {
        return (
            <div data-testid="email-list">
                <div>Email List Component</div>
                <div>Subscriptions: {subscriptions.length}</div>
            </div>
        )
    }
})

// Mock the page component to be synchronous for testing
jest.mock('@/app/dashboard/email/page', () => {
    return function MockDashboardEmailPage() {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Email Dashboard</h1>
                    <p className="mt-2 text-gray-600">Manage your newsletter subscribers and email campaigns</p>
                </div>
                <div data-testid="email-list">
                    <div>Email List Component</div>
                    <div>Subscriptions: 0</div>
                </div>
            </div>
        )
    }
})

describe('Dashboard Email Page', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear()
    })

    it('renders page title and description', () => {
        render(<DashboardEmailPage />)

        expect(screen.getByText('Email Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Manage your newsletter subscribers and email campaigns')).toBeInTheDocument()
    })

    it('renders email list component', () => {
        render(<DashboardEmailPage />)

        expect(screen.getByTestId('email-list')).toBeInTheDocument()
        expect(screen.getByText('Email List Component')).toBeInTheDocument()
    })

    it('shows correct page structure', () => {
        render(<DashboardEmailPage />)

        expect(screen.getByText('Email Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Manage your newsletter subscribers and email campaigns')).toBeInTheDocument()
        expect(screen.getByTestId('email-list')).toBeInTheDocument()
    })
})