'use client'

import { useState } from 'react'
import EmailList from './EmailList'
import EmailCampaign from './EmailCampaign'

interface NewsletterSubscription {
    id: string
    email: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface EmailDashboardTabsProps {
    subscriptions: NewsletterSubscription[]
}

type TabType = 'subscribers' | 'campaign'

export default function EmailDashboardTabs({ subscriptions }: EmailDashboardTabsProps) {
    const [activeTab, setActiveTab] = useState<TabType>('subscribers')

    const tabs = [
        {
            id: 'subscribers' as TabType,
            name: 'Subscribers',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            description: 'Manage your newsletter subscribers'
        },
        {
            id: 'campaign' as TabType,
            name: 'Email Campaigns',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            description: 'Create and send email campaigns'
        }
    ]
    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
                        >
                            {tab.icon}
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {tabs.find(tab => tab.id === activeTab)?.icon}
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            {tabs.find(tab => tab.id === activeTab)?.name}
                        </h3>
                        <p className="text-sm text-blue-700">
                            {tabs.find(tab => tab.id === activeTab)?.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="w-full">
                {activeTab === 'subscribers' && (
                    <EmailList subscriptions={subscriptions} />
                )}

                {activeTab === 'campaign' && (
                    <EmailCampaign subscriptions={subscriptions} />
                )}
            </div>
        </div>
    )
}

