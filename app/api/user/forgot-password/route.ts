import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import crypto from 'crypto'
import { add } from 'date-fns'
import prisma from '@/prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            // Return success to avoid email discovery
            return NextResponse.json({ success: true })
        }

        const token = crypto.randomBytes(32).toString('hex')
        const expiresAt = add(new Date(), { minutes: 15 })

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt,
            },
        })

        const resetLink = `${baseUrl}/reset-password?token=${token}`

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Reset your password',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 15 minutes.</p>`,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Email sending failed:', error)
        return NextResponse.json({ success: false, error: 'Email failed' }, { status: 500 })
    }
}
