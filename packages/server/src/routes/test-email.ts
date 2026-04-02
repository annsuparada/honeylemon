import { NextResponse } from "next/server";
import type { CampaignSendEmailFn } from "./campaign-preview";

export interface TestEmailApiHandlerDeps {
    sendEmail: CampaignSendEmailFn;
    /** Returns HTML body for the test message */
    createTestEmailHtml: () => string;
    subject: string;
}

export function createTestEmailApiHandlers(deps: TestEmailApiHandlerDeps) {
    const { sendEmail, createTestEmailHtml, subject } = deps;

    async function POST(req: Request) {
        try {
            const { email } = await req.json();

            const emailSent = await sendEmail({
                to: email,
                subject,
                html: createTestEmailHtml(),
            });

            if (emailSent) {
                return NextResponse.json({
                    success: true,
                    message: "Test email sent successfully",
                });
            }
            return NextResponse.json({
                success: false,
                message: "Failed to send test email",
            });
        } catch (error) {
            console.error("Test email failed:", error);
            return NextResponse.json({
                success: false,
                error: "Test email failed",
            });
        }
    }

    return { POST };
}
