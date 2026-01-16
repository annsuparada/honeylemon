import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { add } from 'date-fns'
import prisma from '@/prisma/client'
import { sendEmail, createPasswordResetEmail } from '@/utils/services/emailService'

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ success: false, error: 'No account found with this email address' }, { status: 404 })
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

        const emailSent = await sendEmail({
            to: email,
            subject: 'Reset your password - Travomad',
            html: createPasswordResetEmail(resetLink),
        })

        if (!emailSent) {
            return NextResponse.json({ success: false, error: 'Email failed to send' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Email sending failed:', error)
        return NextResponse.json({ success: false, error: 'Email failed' }, { status: 500 })
    }
}
