'use client'

import { loginUser } from '@/utils/actions/loginAction'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import FormInput from '../components/FormInput'

const LoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const result = await loginUser(email, password)

    if (result.success) {
      localStorage.setItem('token', result.token)
      router.push('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <>
      <HeroSection
        title={'Sign in to your account'}
        imageUrl="https://images.pexels.com/photos/210012/pexels-photo-210012.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      />
      <div className="h-full bg-white">
        <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <h2 className="mt-4 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
            <div className="bg-gray-100 px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleLogin} className="space-y-6">
                <FormInput
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={setEmail}
                />

                <FormInput
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={setPassword}
                />

                <button type="submit" className="btn btn-accent w-full">
                  Sign in
                </button>
              </form>

              <div className="mt-6 text-sm text-center">
                Forgot your password?{' '}
                <Link href="/forgot-password" className="text-blue-600 hover:underline">
                  Reset password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage
