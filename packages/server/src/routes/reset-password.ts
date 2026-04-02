import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export interface ResetPasswordApiHandlerDeps {
    prisma: PrismaClient;
    bcryptRounds?: number;
}

export function createResetPasswordApiHandlers(deps: ResetPasswordApiHandlerDeps) {
    const { prisma, bcryptRounds = 10 } = deps;

    async function POST(req: Request) {
        try {
            const { token, newPassword } = await req.json();

            const record = await prisma.passwordResetToken.findUnique({
                where: { token },
            });
            if (!record || record.expiresAt < new Date()) {
                return NextResponse.json(
                    { success: false, error: "Token expired or invalid" },
                    { status: 400 }
                );
            }

            const hashedPassword = await bcrypt.hash(newPassword, bcryptRounds);

            await prisma.user.update({
                where: { id: record.userId },
                data: { password: hashedPassword },
            });

            await prisma.passwordResetToken.delete({ where: { token } });

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error("Reset password error:", error);
            return NextResponse.json(
                { success: false, error: "Failed to reset password" },
                { status: 500 }
            );
        }
    }

    return { POST };
}
