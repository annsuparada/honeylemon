import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { z } from "zod";
import { sendEmail } from "@/utils/services/emailService";
import crypto from "crypto";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Campaign schema
const campaignSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    content: z.string().min(1, "Content is required"),
    recipientType: z.enum(['all', 'active', 'inactive']),
});

// Generate unsubscribe token
function generateUnsubscribeToken(email: string): string {
    const secret = process.env.SECRET_KEY || 'fallback-secret';
    const data = `unsubscribe:${email}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// Create email template
function createEmailTemplate(subject: string, content: string, recipientEmail: string): string {
    const unsubscribeToken = generateUnsubscribeToken(recipientEmail);
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${unsubscribeToken}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 0 0 8px 8px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 14px;
                color: #666;
            }
            .unsubscribe-link {
                color: #667eea;
                text-decoration: none;
            }
            .unsubscribe-link:hover {
                text-decoration: underline;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>✈️ Travomad</h1>
        </div>
        
        <div class="content">
            ${content.replace(/\n/g, '<br>')}
        </div>
        
        <div class="footer">
            <p>This email was sent from Travomad. If you no longer wish to receive these emails, you can <a href="${unsubscribeUrl}" class="unsubscribe-link">unsubscribe here</a>.</p>
        </div>
    </body>
    </html>
    `;
}

// POST: Send campaign to subscribers
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = campaignSchema.parse(body);
        const { subject, content, recipientType } = validatedData;

        // Get recipients based on type
        let whereClause = {};
        if (recipientType === 'active') {
            whereClause = { isActive: true };
        } else if (recipientType === 'inactive') {
            whereClause = { isActive: false };
        }
        // For 'all', we don't add any where clause

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

        // Send emails in batches to avoid overwhelming the email service
        const batchSize = 10; // Send 10 emails at a time
        let sentCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);

            // Process batch in parallel
            const batchPromises = batch.map(async (subscriber) => {
                try {
                    const emailSent = await sendEmail({
                        to: subscriber.email,
                        subject,
                        html: createEmailTemplate(subject, content, subscriber.email),
                    });

                    if (emailSent) {
                        sentCount++;
                        return { success: true, email: subscriber.email };
                    } else {
                        failedCount++;
                        errors.push(`Failed to send to ${subscriber.email}`);
                        return { success: false, email: subscriber.email };
                    }
                } catch (error) {
                    failedCount++;
                    errors.push(`Error sending to ${subscriber.email}: ${error}`);
                    return { success: false, email: subscriber.email };
                }
            });

            // Wait for batch to complete
            await Promise.all(batchPromises);

            // Add a small delay between batches to be respectful to the email service
            if (i + batchSize < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Campaign results logged via email service

        return NextResponse.json({
            success: true,
            message: `Campaign sent successfully`,
            sentCount,
            failedCount,
            totalRecipients: subscribers.length,
            errors: errors.slice(0, 10), // Only return first 10 errors to avoid huge responses
        }, { status: 200 });

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

// GET: Get campaign statistics (optional endpoint for future use)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const recipientType = searchParams.get("recipientType") || "all";

        let whereClause = {};
        if (recipientType === 'active') {
            whereClause = { isActive: true };
        } else if (recipientType === 'inactive') {
            whereClause = { isActive: false };
        }

        const subscribers = await prisma.newsletter.findMany({
            where: whereClause,
            select: {
                email: true,
                isActive: true,
            },
        });

        return NextResponse.json({
            success: true,
            recipientType,
            count: subscribers.length,
            subscribers: subscribers.map(sub => ({
                email: sub.email,
                isActive: sub.isActive,
            })),
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching campaign statistics:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaign statistics" },
            { status: 500 }
        );
    }
}
