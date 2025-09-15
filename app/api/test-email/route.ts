import { NextResponse } from 'next/server'
import { sendEmail, createTestEmail } from '@/utils/emailService'

export async function POST(req: Request) {
    try {
        const { email } = await req.json()

        const emailSent = await sendEmail({
            to: email,
            subject: 'Test Email - Travomad',
            html: createTestEmail(),
        })

        if (emailSent) {
            return NextResponse.json({ success: true, message: 'Test email sent successfully' })
        } else {
            return NextResponse.json({ success: false, message: 'Failed to send test email' })
        }
    } catch (error) {
        console.error('Test email failed:', error)
        return NextResponse.json({ success: false, error: 'Test email failed' })
    }
}
