'use client'

import { useState } from 'react'
import FormInput from '../components/FormInput'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus('sending')
        setErrorMessage('')

        const res = await fetch('/api/user/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })

        if (res.ok) {
            setStatus('sent')
        } else {
            const errorData = await res.json()
            setErrorMessage(errorData.error || 'Something went wrong.')
            setStatus('error')
        }
    }

    return (
        <>
            <div className='bg-primary h-20' />

            <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full">
                    <h1 className="text-xl font-bold mb-4">Forgot your password?</h1>
                    <p className="mb-4 text-sm text-gray-600">
                        Enter your email and we'll send you a password reset link.
                    </p>

                    <FormInput
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e)}
                        id={''}
                        label={''}
                    />

                    <button type="submit" className="btn btn-accent w-full" disabled={status === 'sending'}>
                        {status === 'sending' ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    {status === 'sent' && <p className="mt-4 text-green-600">Email sent! Check your inbox.</p>}
                    {status === 'error' && <p className="mt-4 text-red-600">{errorMessage}</p>}
                </form>
            </div>
        </>
    )
}
