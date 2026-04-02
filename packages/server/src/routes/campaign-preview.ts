import { NextResponse } from "next/server";
import { z } from "zod";
import type { NewsletterMailSiteContext } from "../email/newsletter-mail-html";
import { createCampaignPreviewEmailHtml } from "../email/newsletter-mail-html";

const previewSchema = z.object({
    to: z.string().email("Please enter a valid email address"),
    subject: z.string().min(1, "Subject is required"),
    content: z.string().min(1, "Content is required"),
});

export type CampaignSendEmailFn = (opts: {
    to: string;
    subject: string;
    html: string;
}) => Promise<boolean>;

export interface CampaignPreviewApiHandlerDeps {
    sendEmail: CampaignSendEmailFn;
    mailCtx: NewsletterMailSiteContext;
}

export function createCampaignPreviewApiHandlers(deps: CampaignPreviewApiHandlerDeps) {
    const { sendEmail, mailCtx } = deps;

    async function POST(req: Request) {
        try {
            const body = await req.json();
            const validatedData = previewSchema.parse(body);
            const { to, subject, content } = validatedData;

            const emailSent = await sendEmail({
                to,
                subject: `[PREVIEW] ${subject}`,
                html: createCampaignPreviewEmailHtml(subject, content, to, mailCtx),
            });

            if (!emailSent) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Failed to send preview email. Please check your email configuration.",
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    message: "Preview email sent successfully",
                },
                { status: 200 }
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { success: false, error: error.errors[0].message },
                    { status: 400 }
                );
            }

            console.error("Error sending preview email:", error);
            return NextResponse.json(
                { success: false, error: "Failed to send preview email" },
                { status: 500 }
            );
        }
    }

    return { POST };
}
