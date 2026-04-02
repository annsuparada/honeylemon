import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
    createNewsletterWelcomeBackEmailHtml,
    createNewsletterWelcomeEmailHtml,
} from "../email/newsletter-mail-html";
import type { NewsletterMailSiteContext } from "../email/newsletter-mail-html";
import { verifyNewsletterUnsubscribeToken } from "../email/newsletter-tokens";
import type { CampaignSendEmailFn } from "./campaign-preview";

const newsletterSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

export interface NewsletterApiHandlerDeps {
    prisma: PrismaClient;
    sendEmail: CampaignSendEmailFn;
    mailCtx: NewsletterMailSiteContext;
}

export function createNewsletterApiHandlers(deps: NewsletterApiHandlerDeps) {
    const { prisma, sendEmail, mailCtx } = deps;
    const brand = mailCtx.brandName;

    async function POST(req: Request) {
        try {
            const body = await req.json();
            const { email, action } = body;

            if (action === "unsubscribe") {
                if (!email) {
                    return NextResponse.json(
                        { error: "Email is required" },
                        { status: 400 }
                    );
                }

                const subscription = await prisma.newsletter.findUnique({
                    where: { email },
                });

                if (!subscription) {
                    return NextResponse.json(
                        { error: "Email not found in our newsletter list" },
                        { status: 404 }
                    );
                }

                if (!subscription.isActive) {
                    return NextResponse.json(
                        { error: "Email is already unsubscribed" },
                        { status: 400 }
                    );
                }

                await prisma.newsletter.update({
                    where: { email },
                    data: { isActive: false, updatedAt: new Date() },
                });

                return NextResponse.json(
                    {
                        success: true,
                        message: "Successfully unsubscribed from newsletter",
                    },
                    { status: 200 }
                );
            }

            const validatedData = newsletterSchema.parse(body);
            const { email: validatedEmail } = validatedData;

            const existingSubscription = await prisma.newsletter.findUnique({
                where: { email: validatedEmail },
            });

            if (existingSubscription) {
                if (existingSubscription.isActive) {
                    return NextResponse.json(
                        {
                            error: "This email is already subscribed to our newsletter",
                        },
                        { status: 400 }
                    );
                }

                const reactivatedSubscription = await prisma.newsletter.update({
                    where: { email: validatedEmail },
                    data: { isActive: true, updatedAt: new Date() },
                });

                await sendEmail({
                    to: validatedEmail,
                    subject: `Welcome back to ${brand} Newsletter!`,
                    html: createNewsletterWelcomeBackEmailHtml(
                        validatedEmail,
                        mailCtx
                    ),
                });

                return NextResponse.json(
                    {
                        success: true,
                        message: "Successfully resubscribed to our newsletter!",
                        subscription: reactivatedSubscription,
                    },
                    { status: 200 }
                );
            }

            const newSubscription = await prisma.newsletter.create({
                data: {
                    email: validatedEmail,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });

            const emailSent = await sendEmail({
                to: validatedEmail,
                subject: `Welcome to ${brand} Newsletter!`,
                html: createNewsletterWelcomeEmailHtml(validatedEmail, mailCtx),
            });

            if (!emailSent) {
                console.error("Failed to send welcome email to:", validatedEmail);
            }

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully subscribed to our newsletter!",
                    subscription: newSubscription,
                },
                { status: 201 }
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json(
                    { error: error.errors[0].message },
                    { status: 400 }
                );
            }

            console.error("Error with newsletter action:", error);
            return NextResponse.json(
                { error: "Failed to process newsletter request" },
                { status: 500 }
            );
        }
    }

    async function GET() {
        try {
            const subscriptions = await prisma.newsletter.findMany({
                orderBy: { createdAt: "desc" },
            });

            return NextResponse.json(
                { success: true, subscriptions },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error fetching newsletter subscriptions:", error);
            return NextResponse.json(
                { error: "Failed to fetch subscriptions" },
                { status: 500 }
            );
        }
    }

    async function DELETE(req: Request) {
        try {
            const { searchParams } = new URL(req.url);
            const email = searchParams.get("email");
            const token = searchParams.get("token");

            if (!email) {
                return NextResponse.json(
                    { error: "Email parameter is required" },
                    { status: 400 }
                );
            }

            if (!token) {
                return NextResponse.json(
                    { error: "Token parameter is required" },
                    { status: 400 }
                );
            }

            if (!verifyNewsletterUnsubscribeToken(token, email, mailCtx.jwtSecret)) {
                return NextResponse.json(
                    { error: "Invalid unsubscribe token" },
                    { status: 400 }
                );
            }

            const subscription = await prisma.newsletter.findUnique({
                where: { email },
            });

            if (!subscription) {
                return NextResponse.json(
                    { error: "Email not found in our newsletter list" },
                    { status: 404 }
                );
            }

            if (!subscription.isActive) {
                return NextResponse.json(
                    { error: "Email is already unsubscribed" },
                    { status: 400 }
                );
            }

            await prisma.newsletter.update({
                where: { email },
                data: { isActive: false, updatedAt: new Date() },
            });

            return NextResponse.json(
                {
                    success: true,
                    message: "Successfully unsubscribed from newsletter",
                },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error unsubscribing from newsletter:", error);
            return NextResponse.json(
                { error: "Failed to unsubscribe from newsletter" },
                { status: 500 }
            );
        }
    }

    return { POST, GET, DELETE };
}
