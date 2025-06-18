'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import FormInput from '../components/FormInput'
import HeroSection from '../components/HeroSection'

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const router = useRouter()

    const [password, setPassword] = useState('')
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!token) return

        setStatus('submitting')

        const res = await fetch('/api/user/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword: password }),
        })

        if (res.ok) {
            setStatus('success')
            setTimeout(() => router.push('/login'), 2000)
        } else {
            setStatus('error')
        }
    }

    if (!token) return <p className="p-8 text-center">Invalid or missing token.</p>

    return (
        <>
            <div className='bg-primary h-20' />

            <div className="min-h-screen flex items-center justify-center px-4 bg-gray-100">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full">
                    <h1 className="text-xl font-bold mb-4">Reset your password</h1>

                    <FormInput
                        type="password"
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e)} id={''} label={''} />

                    <button type="submit" className="btn btn-accent w-full" disabled={status === 'submitting'}>
                        {status === 'submitting' ? 'Resetting...' : 'Reset Password'}
                    </button>

                    {status === 'success' && <p className="mt-4 text-green-600">Password reset! Redirecting…</p>}
                    {status === 'error' && <p className="mt-4 text-red-600">Reset failed. Try again.</p>}
                </form>
            </div>
        </>
    )
}
