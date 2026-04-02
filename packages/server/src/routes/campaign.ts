import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { NewsletterMailSiteContext } from "../email/newsletter-mail-html";
import { createCampaignBroadcastEmailHtml } from "../email/newsletter-mail-html";
import type { CampaignSendEmailFn } from "./campaign-preview";

const campaignSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    content: z.string().min(1, "Content is required"),
    recipientType: z.enum(["all", "active", "inactive"]),
});

export interface CampaignApiHandlerDeps {
    prisma: PrismaClient;
    sendEmail: CampaignSendEmailFn;
    mailCtx: NewsletterMailSiteContext;
    batchSize?: number;
    batchDelayMs?: number;
}

export function createCampaignApiHandlers(deps: CampaignApiHandlerDeps) {
    const {
        prisma,
        sendEmail,
        mailCtx,
        batchSize = 10,
        batchDelayMs = 1000,
    } = deps;

    async function POST(req: Request) {
        try {
            const body = await req.json();
            const validatedData = campaignSchema.parse(body);
            const { subject, content, recipientType } = validatedData;

            let whereClause: { isActive?: boolean } = {};
            if (recipientType === "active") {
                whereClause = { isActive: true };
            } else if (recipientType === "inactive") {
                whereClause = { isActive: false };
            }

            const subscribers = await prisma.newsletter.findMany({
                where: whereClause,
                select: {
                    email: true,
                    isActive: true,
                },
            });

            if (subscribers.length === 0) {
                return NextResponse.json(
                    { error: `No ${recipientType} subscribers found` },
                    { status: 400 }
                );
            }

            let sentCount = 0;
            let failedCount = 0;
            const errors: string[] = [];

            for (let i = 0; i < subscribers.length; i += batchSize) {
                const batch = subscribers.slice(i, i + batchSize);

                const batchPromises = batch.map(
                    async (subscriber: (typeof subscribers)[number]) => {
                        try {
                            const emailSent = await sendEmail({
                                to: subscriber.email,
                                subject,
                                html: createCampaignBroadcastEmailHtml(
                                    subject,
                                    content,
                                    subscriber.email,
                                    mailCtx
                                ),
                            });

                            if (emailSent) {
                                sentCount++;
                                return { success: true, email: subscriber.email };
                            }
                            failedCount++;
                            errors.push(`Failed to send to ${subscriber.email}`);
                            return { success: false, email: subscriber.email };
                        } catch (error) {
                            failedCount++;
                            errors.push(
                                `Error sending to ${subscriber.email}: ${error}`
                            );
                            return { success: false, email: subscriber.email };
                        }
                    }
                );

                await Promise.all(batchPromises);

                if (i + batchSize < subscribers.length) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, batchDelayMs)
                    );
                }
            }

            return NextResponse.json(
                {
                    success: true,
                    message: `Campaign sent successfully`,
                    sentCount,
                    failedCount,
                    totalRecipients: subscribers.length,
                    errors: errors.slice(0, 10),
                },
                { status: 200 }
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: error.errors[0].message },
                    { status: 400 }
                );
            }

            console.error("Error sending campaign:", error);
            return NextResponse.json(
                { error: "Failed to send campaign" },
                { status: 500 }
            );
        }
    }

    async function GET(req: Request) {
        try {
            const { searchParams } = new URL(req.url);
            const recipientType = searchParams.get("recipientType") || "all";

            let whereClause: { isActive?: boolean } = {};
            if (recipientType === "active") {
                whereClause = { isActive: true };
            } else if (recipientType === "inactive") {
                whereClause = { isActive: false };
            }

            const subscribers = await prisma.newsletter.findMany({
                where: whereClause,
                select: {
                    email: true,
                    isActive: true,
                },
            });

            return NextResponse.json(
                {
                    success: true,
                    recipientType,
                    count: subscribers.length,
                    subscribers: subscribers.map(
                        (sub: (typeof subscribers)[number]) => ({
                            email: sub.email,
                            isActive: sub.isActive,
                        })
                    ),
                },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error fetching campaign statistics:", error);
            return NextResponse.json(
                { error: "Failed to fetch campaign statistics" },
                { status: 500 }
            );
        }
    }

    return { POST, GET };
}
