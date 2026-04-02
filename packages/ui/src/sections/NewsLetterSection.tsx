'use client'

import { CalendarDaysIcon, HandRaisedIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface NewsletterResponse {
    success: boolean
    message: string
    error?: string
}

export default function NewsLetterSection() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email) {
            setMessage('Please enter your email address')
            setIsSuccess(false)
            return
        }

        setIsLoading(true)
        setMessage('')

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data: NewsletterResponse = await response.json()

            if (data.success) {
                setMessage(data.message)
                setIsSuccess(true)
                setEmail('') // Clear the form
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

    return (
        <div className="relative isolate overflow-hidden bg-base-200 py-16 sm:py-24 lg:py-32 border-t border-b border-base-content/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                    <div className="max-w-xl lg:max-w-lg">
                        <h2 className="text-4xl font-semibold tracking-tight text-base-content">Subscribe to our newsletter</h2>
                        <p className="mt-4 text-lg text-base-content/80">
                            Get travel tips, guides, deals, and discounts — delivered weekly.
                        </p>
                        <form onSubmit={handleSubmit} className="mt-6 flex max-w-md gap-x-4">
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                autoComplete="email"
                                disabled={isLoading}
                                className="min-w-0 flex-auto rounded-md bg-white px-3.5 py-2 text-base text-base-content outline-1 -outline-offset-1 outline-base-content/20 placeholder:text-base-content/60 focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6 disabled:opacity-50 border border-base-content"
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className='btn btn-accent disabled:opacity-50'
                            >
                                {isLoading ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>

                        {/* Message display */}
                        {message && (
                            <div className={`mt-4 p-3 rounded-md ${isSuccess
                                ? 'bg-success/10 text-success border border-success/20'
                                : 'bg-error/10 text-error border border-error/20'
                                }`}>
                                {message}
                            </div>
                        )}
                    </div>
                    <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
                        <div className="flex flex-col items-start">
                            <div className="rounded-md bg-base-300 p-2 ring-1 ring-base-content/10">
                                <CalendarDaysIcon aria-hidden="true" className="size-6 text-base-content" />
                            </div>
                            <dt className="mt-4 text-base font-semibold text-base-content">Weekly articles</dt>
                            <dd className="mt-2 text-base/7 text-base-content/70">
                                Smart travel advice, destination inspiration, and planning tips.Hand-picked discounts on flights, stays, and packages.
                            </dd>
                        </div>
                        <div className="flex flex-col items-start">
                            <div className="rounded-md bg-base-300 p-2 ring-1 ring-base-content/10">
                                <HandRaisedIcon aria-hidden="true" className="size-6 text-base-content" />
                            </div>
                            <dt className="mt-4 text-base font-semibold text-base-content">No spam</dt>
                            <dd className="mt-2 text-base/7 text-base-content/70">
                                We only send helpful, relevant content. No clutter, no clickbait, and you can unsubscribe anytime with a single click.
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
            <div aria-hidden="true" className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
                <div
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                    className="aspect-1155/678 w-[72.1875rem] bg-gradient-to-tr from-accent to-primary opacity-30"
                />
            </div>
        </div>
    )
}

