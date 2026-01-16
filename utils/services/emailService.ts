import nodemailer from 'nodemailer'
import { emailConfig } from '@/lib/config'

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailConfig.gmailUser,
        pass: emailConfig.gmailAppPassword,
    },
})

export interface EmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
    try {
        const mailOptions = {
            from: `"Travomad" <${emailConfig.gmailUser}>`,
            to,
            subject,
            html,
        }

        await transporter.sendMail(mailOptions)
        return true
    } catch (error) {
        console.error('Email sending failed:', error)
        return false
    }
}

export function createTestEmail(): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Test Email - Travomad</title>
        </head>
        <body>
            <h1>Test Email</h1>
            <p>This is a test email to verify Gmail SMTP is working correctly.</p>
            <p>Time: ${new Date().toISOString()}</p>
        </body>
        </html>
    `
}

export function createPasswordResetEmail(resetLink: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - Travomad</title>
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
                .button {
                    display: inline-block;
                    background: #667eea;
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }
                .button:hover {
                    background: #5a6fd8;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    font-size: 14px;
                    color: #666;
                }
                .warning {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    color: #856404;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🔐 Reset Your Password</h1>
                <p>We received a request to reset your password for your Travomad account.</p>
            </div>
            
            <div class="content">
                <p>Hello,</p>
                
                <p>You recently requested to reset your password for your Travomad account. Click the button below to reset it:</p>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Reset My Password</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> This link will expire in 15 minutes for security reasons. If you didn't request this password reset, please ignore this email.
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">
                    ${resetLink}
                </p>
                
                <p>If you have any questions, feel free to contact us.</p>
                
                <p>Best regards,<br>The Travomad Team</p>
            </div>
            
            <div class="footer">
                <p>This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.</p>
            </div>
        </body>
        </html>
    `
}
