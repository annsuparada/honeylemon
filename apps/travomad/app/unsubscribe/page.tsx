'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface UnsubscribeResponse {
    success: boolean
    message: string
    error?: string
}

export default function UnsubscribePage() {
    const searchParams = useSearchParams()
    const email = searchParams.get('email')
    const token = searchParams.get('token')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [isUnsubscribed, setIsUnsubscribed] = useState(false)
    const [isValidToken, setIsValidToken] = useState(false)

    // Verify token on component mount
    useEffect(() => {
        const verifyToken = async () => {
            if (!email || !token) {
                setIsValidToken(false)
                return
            }

            try {
                const response = await fetch(`/api/newsletter/verify-token?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`)
                const data = await response.json()

                if (data.success) {
                    setIsValidToken(true)
                } else {
                    setIsValidToken(false)
                    setMessage('Invalid unsubscribe link. Please use the link from your email.')
                    setIsSuccess(false)
                }
            } catch (error) {
                setIsValidToken(false)
                setMessage('Failed to verify unsubscribe link. Please try again.')
                setIsSuccess(false)
            }
        }

        verifyToken()
    }, [email, token])

    const handleUnsubscribe = async () => {
        if (!email) {
            setMessage('No email address provided')
            setIsSuccess(false)
            return
        }

        if (!token) {
            setMessage('Invalid unsubscribe link. Please use the link from your email.')
            setIsSuccess(false)
            return
        }

        setIsLoading(true)
        setMessage('')

        try {
            const response = await fetch(`/api/newsletter?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, {
                method: 'DELETE',
            })

            const data: UnsubscribeResponse = await response.json()

            if (data.success) {
                setMessage(data.message)
                setIsSuccess(true)
                setIsUnsubscribed(true)
            } else {
                setMessage(data.error || 'Something went wrong. Please try again.')
                setIsSuccess(false)
            }
        } catch (error) {
            setMessage('Network error. Please check your connection and try again.')
            setIsSuccess(false)
        } finally {
            setIsLoading(false)
        }
    }

    if (!email || !token) {
        return (
            <div className="min-h-screen bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Invalid Unsubscribe Link
                            </h2>
                            <p className="text-gray-600 mb-6">
                                This unsubscribe link is invalid or incomplete. Please use the unsubscribe link from your email.
                            </p>
                            <a
                                href="/"
                                className="text-indigo-600 hover:text-indigo-500 font-medium"
                            >
                                Return to Homepage
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show loading state while verifying token
    if (!isValidToken && !message) {
        return (
            <div className="min-h-screen bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Verifying Unsubscribe Link
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Please wait while we verify your unsubscribe link...
                            </p>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show error if token verification failed
    if (!isValidToken && message) {
        return (
            <div className="min-h-screen bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Invalid Unsubscribe Link
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {message}
                            </p>
                            <a
                                href="/"
                                className="text-indigo-600 hover:text-indigo-500 font-medium"
                            >
                                Return to Homepage
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-primary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            {isUnsubscribed ? 'Successfully Unsubscribed' : 'Unsubscribe from Newsletter'}
                        </h2>

                        {!isUnsubscribed ? (
                            <>
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to unsubscribe <strong>{email}</strong> from our newsletter?
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    You'll no longer receive travel tips, guides, deals, and discounts from Honey Lemon.
                                </p>

                                <button
                                    onClick={handleUnsubscribe}
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Unsubscribing...' : 'Yes, Unsubscribe'}
                                </button>

                                <div className="mt-4">
                                    <a
                                        href="/"
                                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                                    >
                                        Cancel and return to Homepage
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                        <svg
                                            className="h-6 w-6 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-6">
                                    <strong>{email}</strong> has been successfully unsubscribed from our newsletter.
                                </p>
                                <p className="text-sm text-gray-500 mb-6">
                                    You can resubscribe anytime by visiting our homepage and entering your email address.
                                </p>
                                <a
                                    href="/"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Return to Homepage
                                </a>
                            </>
                        )}

                        {/* Message display */}
                        {message && (
                            <div className={`mt-4 p-3 rounded-md ${isSuccess
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
