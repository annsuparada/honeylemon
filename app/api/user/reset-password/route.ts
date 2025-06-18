import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/prisma/client'

export async function POST(req: Request) {
    const { token, newPassword } = await req.json()

    const record = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!record || record.expiresAt < new Date()) {
        return NextResponse.json({ success: false, error: 'Token expired or invalid' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword },
    })

    await prisma.passwordResetToken.delete({ where: { token } })

    return NextResponse.json({ success: true })
}
