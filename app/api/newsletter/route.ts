import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { z } from "zod";
import { sendEmail } from "@/utils/services/emailService";
import crypto from "crypto";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Newsletter subscription schema
const newsletterSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

// Generate unsubscribe token
function generateUnsubscribeToken(email: string): string {
    const secret = process.env.SECRET_KEY || 'fallback-secret';
    const data = `unsubscribe:${email}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// Verify unsubscribe token
function verifyUnsubscribeToken(token: string, email: string): boolean {
    const expectedToken = generateUnsubscribeToken(email);
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

// POST: Subscribe to newsletter or admin unsubscribe
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, action } = body;

        // Handle admin unsubscribe
        if (action === 'unsubscribe') {
            if (!email) {
                return NextResponse.json(
                    { error: "Email is required" },
                    { status: 400 }
                );
            }

            // Find the subscription
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

            // Deactivate subscription
            await prisma.newsletter.update({
                where: { email },
                data: { isActive: false, updatedAt: new Date() },
            });

            return NextResponse.json(
                { success: true, message: "Successfully unsubscribed from newsletter" },
                { status: 200 }
            );
        }

        // Handle subscription (existing logic)
        // Validate input
        const validatedData = newsletterSchema.parse(body);
        const { email: validatedEmail } = validatedData;

        // Check if email already exists
        const existingSubscription = await prisma.newsletter.findUnique({
            where: { email: validatedEmail },
        });

        if (existingSubscription) {
            if (existingSubscription.isActive) {
                return NextResponse.json(
                    { error: "This email is already subscribed to our newsletter" },
                    { status: 400 }
                );
            } else {
                // Reactivate subscription
                const reactivatedSubscription = await prisma.newsletter.update({
                    where: { email: validatedEmail },
                    data: { isActive: true, updatedAt: new Date() },
                });

                // Send welcome back email
                await sendEmail({
                    to: validatedEmail,
                    subject: "Welcome back to Travomad Newsletter!",
                    html: createWelcomeBackEmail(validatedEmail),
                });

                return NextResponse.json(
                    {
                        success: true,
                        message: "Successfully resubscribed to our newsletter!",
                        subscription: reactivatedSubscription
                    },
                    { status: 200 }
                );
            }
        }

        // Create new subscription
        const newSubscription = await prisma.newsletter.create({
            data: {
                email: validatedEmail,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        // Send welcome email
        const emailSent = await sendEmail({
            to: validatedEmail,
            subject: "Welcome to Travomad Newsletter!",
            html: createWelcomeEmail(validatedEmail),
        });

        if (!emailSent) {
            console.error("Failed to send welcome email to:", validatedEmail);
        }

        return NextResponse.json(
            {
                success: true,
                message: "Successfully subscribed to our newsletter!",
                subscription: newSubscription
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

// GET: Get all newsletter subscriptions (Admin only)
export async function GET(req: Request) {
    try {
        // In a real app, you'd want to add admin authentication here
        const subscriptions = await prisma.newsletter.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, subscriptions }, { status: 200 });
    } catch (error) {
        console.error("Error fetching newsletter subscriptions:", error);
        return NextResponse.json(
            { error: "Failed to fetch subscriptions" },
            { status: 500 }
        );
    }
}


// DELETE: Unsubscribe from newsletter
export async function DELETE(req: Request) {
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

        // Verify token
        if (!verifyUnsubscribeToken(token, email)) {
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

        // Deactivate subscription instead of deleting
        await prisma.newsletter.update({
            where: { email },
            data: { isActive: false, updatedAt: new Date() },
        });

        return NextResponse.json(
            { success: true, message: "Successfully unsubscribed from newsletter" },
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

// Email templates
function createWelcomeEmail(email: string): string {
    const unsubscribeToken = generateUnsubscribeToken(email);
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Travomad Newsletter!</title>
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
            .feature {
                background: white;
                padding: 20px;
                margin: 15px 0;
                border-radius: 6px;
                border-left: 4px solid #667eea;
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
            <h1>🎉 Welcome to Travomad!</h1>
            <p>You're now part of our travel community!</p>
        </div>
        
        <div class="content">
            <p>Hello there!</p>
            
            <p>Thank you for subscribing to our newsletter! We're thrilled to have you join our community of travel enthusiasts.</p>
            
            <div class="feature">
                <h3>📧 What to expect:</h3>
                <ul>
                    <li><strong>Weekly travel tips</strong> - Smart advice from our travel experts</li>
                    <li><strong>Destination guides</strong> - Discover amazing places around the world</li>
                    <li><strong>Exclusive deals</strong> - Hand-picked discounts on flights, stays, and packages</li>
                    <li><strong>Travel inspiration</strong> - Stories and photos from fellow travelers</li>
                </ul>
            </div>
            
            <p>We promise to only send you valuable, relevant content. No spam, no clutter, and you can unsubscribe anytime with a single click.</p>
            
            <p>Ready to start your next adventure? Check out our latest articles and travel deals!</p>
            
            <p>Happy travels!<br>The Travomad Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you because you subscribed to our newsletter. If you no longer wish to receive these emails, you can <a href="${unsubscribeUrl}" class="unsubscribe-link">unsubscribe here</a>.</p>
        </div>
    </body>
    </html>
  `;
}

function createWelcomeBackEmail(email: string): string {
    const unsubscribeToken = generateUnsubscribeToken(email);
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome back to Travomad Newsletter!</title>
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
            <h1>👋 Welcome back!</h1>
            <p>We're glad to have you back in our travel community!</p>
        </div>
        
        <div class="content">
            <p>Hello again!</p>
            
            <p>Great to see you back! We've reactivated your newsletter subscription and you'll start receiving our weekly travel updates again.</p>
            
            <p>While you were away, we've been busy creating amazing content and finding incredible travel deals. We can't wait to share them with you!</p>
            
            <p>Welcome back to the adventure!<br>The Travomad Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you because you resubscribed to our newsletter. If you no longer wish to receive these emails, you can <a href="${unsubscribeUrl}" class="unsubscribe-link">unsubscribe here</a>.</p>
        </div>
    </body>
    </html>
  `;
}
