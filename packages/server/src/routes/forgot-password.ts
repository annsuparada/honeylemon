import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import crypto from "crypto";
import type { CampaignSendEmailFn } from "./campaign-preview";

export interface ForgotPasswordApiHandlerDeps {
    prisma: PrismaClient;
    sendEmail: CampaignSendEmailFn;
    /** Base URL for reset link, e.g. `https://example.com` (no trailing path) */
    publicSiteUrl: string;
    /** HTML builder for reset email */
    createPasswordResetEmailHtml: (resetLink: string) => string;
    resetTokenTtlMinutes?: number;
    emailSubject: string;
    resetPath?: string;
}

export function createForgotPasswordApiHandlers(deps: ForgotPasswordApiHandlerDeps) {
    const {
        prisma,
        sendEmail,
        publicSiteUrl,
        createPasswordResetEmailHtml,
        resetTokenTtlMinutes = 15,
        emailSubject,
        resetPath = "/reset-password",
    } = deps;

    async function POST(req: Request) {
        try {
            const { email } = await req.json();

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "No account found with this email address",
                    },
                    { status: 404 }
                );
            }

            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(
                Date.now() + resetTokenTtlMinutes * 60 * 1000
            );

            await prisma.passwordResetToken.create({
                data: {
                    userId: user.id,
                    token,
                    expiresAt,
                },
            });

            const base = publicSiteUrl.replace(/\/$/, "");
            const path = resetPath.startsWith("/") ? resetPath : `/${resetPath}`;
            const resetLink = `${base}${path}?token=${token}`;

            const emailSent = await sendEmail({
                to: email,
                subject: emailSubject,
                html: createPasswordResetEmailHtml(resetLink),
            });

            if (!emailSent) {
                return NextResponse.json(
                    { success: false, error: "Email failed to send" },
                    { status: 500 }
                );
            }

            return NextResponse.json({ success: true });
        } catch (error) {
            console.error("Email sending failed:", error);
            return NextResponse.json(
                { success: false, error: "Email failed" },
                { status: 500 }
            );
        }
    }

    return { POST };
}
