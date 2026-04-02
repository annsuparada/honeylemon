import { buildNewsletterUnsubscribeUrl } from "./newsletter-tokens";

export interface NewsletterMailSiteContext {
    /** Base URL for links (e.g. `nextjsConfig.apiUrl` or `NEXT_PUBLIC_API_URL`). */
    publicSiteUrl: string;
    jwtSecret: string;
    brandName: string;
    /** HTML for campaign header `<h1>`; default includes plane emoji + brand. */
    campaignHeaderInnerHtml?: string;
}

function unsubscribeUrl(email: string, ctx: NewsletterMailSiteContext): string {
    return buildNewsletterUnsubscribeUrl(email, ctx.publicSiteUrl, ctx.jwtSecret);
}

function campaignHeader(ctx: NewsletterMailSiteContext): string {
    return (
        ctx.campaignHeaderInnerHtml ??
        `✈️ ${escapeHtml(ctx.brandName)}`
    );
}

function escapeHtml(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Mass / broadcast campaign body (per-recipient unsubscribe). */
export function createCampaignBroadcastEmailHtml(
    subject: string,
    content: string,
    recipientEmail: string,
    ctx: NewsletterMailSiteContext
): string {
    const u = unsubscribeUrl(recipientEmail, ctx);
    const safeSubject = escapeHtml(subject);
    const header = campaignHeader(ctx);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${safeSubject}</title>
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
            <h1>${header}</h1>
        </div>
        
        <div class="content">
            ${content.replace(/\n/g, "<br>")}
        </div>
        
        <div class="footer">
            <p>This email was sent from ${escapeHtml(ctx.brandName)}. If you no longer wish to receive these emails, you can <a href="${u}" class="unsubscribe-link">unsubscribe here</a>.</p>
        </div>
    </body>
    </html>
    `;
}

/** Single preview send with optional banner. */
export function createCampaignPreviewEmailHtml(
    subject: string,
    content: string,
    recipientEmail: string,
    ctx: NewsletterMailSiteContext
): string {
    const u = unsubscribeUrl(recipientEmail, ctx);
    const safeSubject = escapeHtml(subject);
    const header = campaignHeader(ctx);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>[PREVIEW] ${safeSubject}</title>
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
            <h1>${header}</h1>
            <div class="preview-notice">📧 PREVIEW EMAIL - This is a test email</div>
        </div>
        
        <div class="content">
            ${content.replace(/\n/g, "<br>")}
        </div>
        
        <div class="footer">
            <p>This email was sent from ${escapeHtml(ctx.brandName)}. If you no longer wish to receive these emails, you can <a href="${u}" class="unsubscribe-link">unsubscribe here</a>.</p>
        </div>
    </body>
    </html>
    `;
}

export function createNewsletterWelcomeEmailHtml(
    email: string,
    ctx: NewsletterMailSiteContext
): string {
    const u = unsubscribeUrl(email, ctx);
    const brand = escapeHtml(ctx.brandName);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${brand} Newsletter!</title>
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
            <h1>🎉 Welcome to ${brand}!</h1>
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
            
            <p>Happy travels!<br>The ${brand} Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you because you subscribed to our newsletter. If you no longer wish to receive these emails, you can <a href="${u}" class="unsubscribe-link">unsubscribe here</a>.</p>
        </div>
    </body>
    </html>
  `;
}

export function createNewsletterWelcomeBackEmailHtml(
    email: string,
    ctx: NewsletterMailSiteContext
): string {
    const u = unsubscribeUrl(email, ctx);
    const brand = escapeHtml(ctx.brandName);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome back to ${brand} Newsletter!</title>
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
            
            <p>Welcome back to the adventure!<br>The ${brand} Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to you because you resubscribed to our newsletter. If you no longer wish to receive these emails, you can <a href="${u}" class="unsubscribe-link">unsubscribe here</a>.</p>
        </div>
    </body>
    </html>
  `;
}
