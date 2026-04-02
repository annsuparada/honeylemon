'use client'

import { useState, useEffect } from 'react'
import EmailDashboardTabs from './components/EmailDashboardTabs'

interface NewsletterSubscription {
    id: string
    email: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export default function DashboardEmailPage() {
    const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSubscriptions() {
            try {
                setLoading(true)
                const response = await fetch('/api/newsletter', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error(`Failed to fetch newsletter subscriptions: ${response.status}`)
                }

                const data = await response.json()
                setSubscriptions(data.subscriptions || [])
            } catch (error) {
                console.error('Error fetching newsletter subscriptions:', error)
                setError(error instanceof Error ? error.message : 'Failed to fetch subscriptions')
            } finally {
                setLoading(false)
            }
        }

        fetchSubscriptions()
    }, [])

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-base-content">Email Dashboard</h1>
                    <p className="mt-2 text-base-content/80">Manage your newsletter subscribers and email campaigns</p>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="loading loading-spinner loading-lg mb-4"></div>
                        <p className="text-base-content/80">Loading email dashboard...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-base-content">Email Dashboard</h1>
                    <p className="mt-2 text-base-content/80">Manage your newsletter subscribers and email campaigns</p>
                </div>
                <div className="bg-error/10 border border-error/20 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-error">Error loading email dashboard</h3>
                            <p className="text-sm text-error/80 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-base-content">Email Dashboard</h1>
                <p className="mt-2 text-base-content/80">Manage your newsletter subscribers and email campaigns</p>
            </div>

            {/* Tabbed Interface */}
            <EmailDashboardTabs subscriptions={subscriptions} />
        </div>
    )
}