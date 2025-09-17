'use client'

import { useState, useEffect } from 'react'
import FormattedDate from '@/app/components/FormattedDate'

interface NewsletterSubscription {
    id: string
    email: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface EmailListProps {
    subscriptions: NewsletterSubscription[]
}

export default function EmailList({ subscriptions }: EmailListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [localSubscriptions, setLocalSubscriptions] = useState(subscriptions)
    const [filteredSubscriptions, setFilteredSubscriptions] = useState(subscriptions)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

    // Update local subscriptions when prop changes
    useEffect(() => {
        setLocalSubscriptions(subscriptions)
        setFilteredSubscriptions(subscriptions)
    }, [subscriptions])

    // Filter subscriptions based on search term and status
    useEffect(() => {
        let filtered = localSubscriptions.filter(subscription =>
            subscription.email.toLowerCase().includes(searchTerm.toLowerCase())
        )

        // Apply status filter
        if (statusFilter === 'active') {
            filtered = filtered.filter(subscription => subscription.isActive)
        } else if (statusFilter === 'inactive') {
            filtered = filtered.filter(subscription => !subscription.isActive)
        }

        setFilteredSubscriptions(filtered)
        setCurrentPage(1) // Reset to first page when filtering
    }, [searchTerm, localSubscriptions, statusFilter])

    // Calculate pagination
    const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentSubscriptions = filteredSubscriptions.slice(startIndex, endIndex)

    // Calculate statistics
    const totalSubscribers = localSubscriptions.length
    const activeSubscribers = localSubscriptions.filter(sub => sub.isActive).length
    const inactiveSubscribers = totalSubscribers - activeSubscribers

    // Handle unsubscribe
    const handleUnsubscribe = async (email: string, subscriptionId: string) => {
        if (!confirm(`Are you sure you want to unsubscribe ${email} from the newsletter?`)) {
            return
        }

        setLoadingStates(prev => ({ ...prev, [subscriptionId]: true }))

        try {
            // For admin unsubscribe, we'll directly update the database
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, action: 'unsubscribe' }),
            })

            if (response.ok) {
                // Update the local state to reflect the change
                // Note: In a real app, you'd want to update the parent component's state
                const updatedSubscription = { ...localSubscriptions.find(sub => sub.id === subscriptionId)!, isActive: false, updatedAt: new Date().toISOString() }

                setLocalSubscriptions(prev =>
                    prev.map(sub =>
                        sub.id === subscriptionId
                            ? updatedSubscription
                            : sub
                    )
                )

                setFilteredSubscriptions(prev =>
                    prev.map(sub =>
                        sub.id === subscriptionId
                            ? updatedSubscription
                            : sub
                    )
                )
            } else {
                const errorData = await response.json()
                alert(`Failed to unsubscribe: ${errorData.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Error unsubscribing:', error)
            alert('Failed to unsubscribe. Please try again.')
        } finally {
            setLoadingStates(prev => ({ ...prev, [subscriptionId]: false }))
        }
    }

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                            <p className="text-2xl font-bold text-gray-900">{totalSubscribers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Subscribers</p>
                            <p className="text-2xl font-bold text-gray-900">{activeSubscribers}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Inactive Subscribers</p>
                            <p className="text-2xl font-bold text-gray-900">{inactiveSubscribers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Controls */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        {/* Search Input */}
                        <div className="flex-1">
                            <label htmlFor="search" className="sr-only">Search subscribers</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Search by email address..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">Status:</span>
                            <div className="flex rounded-md shadow-sm">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-l-md ${statusFilter === 'all'
                                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setStatusFilter('active')}
                                    className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 ${statusFilter === 'active'
                                        ? 'bg-green-50 text-green-700 border-green-500'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Active
                                </button>
                                <button
                                    onClick={() => setStatusFilter('inactive')}
                                    className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-r-md ${statusFilter === 'inactive'
                                        ? 'bg-red-50 text-red-700 border-red-500'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Inactive
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredSubscriptions.length)} of {filteredSubscriptions.length} subscribers
                    </div>
                </div>
            </div>

            {/* Email List */}
            <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email Address
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subscribed
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Updated
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        {searchTerm ? 'No subscribers found matching your search.' : 'No subscribers found.'}
                                    </td>
                                </tr>
                            ) : (
                                currentSubscriptions.map((subscription) => (
                                    <tr key={subscription.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {subscription.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subscription.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {subscription.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <FormattedDate dateString={subscription.createdAt} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <FormattedDate dateString={subscription.updatedAt} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {subscription.isActive ? (
                                                <button
                                                    onClick={() => handleUnsubscribe(subscription.email, subscription.id)}
                                                    disabled={loadingStates[subscription.id]}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {loadingStates[subscription.id] ? (
                                                        <>
                                                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Unsubscribing...
                                                        </>
                                                    ) : (
                                                        'Unsubscribe'
                                                    )}
                                                </button>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Unsubscribed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                                    <span className="font-medium">{totalPages}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Page numbers */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === currentPage
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
