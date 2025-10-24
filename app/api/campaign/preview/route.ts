import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/utils/emailService";
import crypto from "crypto";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Preview schema
const previewSchema = z.object({
    to: z.string().email("Please enter a valid email address"),
    subject: z.string().min(1, "Subject is required"),
    content: z.string().min(1, "Content is required"),
});

// Generate unsubscribe token
function generateUnsubscribeToken(email: string): string {
    const secret = process.env.SECRET_KEY || 'fallback-secret';
    const data = `unsubscribe:${email}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// Create email template
function createEmailTemplate(subject: string, content: string, recipientEmail: string, isPreview: boolean = false): string {
    const unsubscribeToken = generateUnsubscribeToken(recipientEmail);
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${unsubscribeToken}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isPreview ? '[PREVIEW] ' : ''}${subject}</title>
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
            .preview-notice {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 6px;
                margin-bottom: 20px;
                text-align: center;
                font-weight: bold;
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
            ${isPreview ? '<div class="preview-notice">📧 PREVIEW EMAIL - This is a test email</div>' : ''}
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

// POST: Send preview email
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = previewSchema.parse(body);
        const { to, subject, content } = validatedData;

        // Send preview email
        const emailSent = await sendEmail({
            to,
            subject: `[PREVIEW] ${subject}`,
            html: createEmailTemplate(subject, content, to, true)
        });

        if (!emailSent) {
            return NextResponse.json(
                { success: false, error: "Failed to send preview email. Please check your email configuration." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Preview email sent successfully"
        }, { status: 200 });

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
