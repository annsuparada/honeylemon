export { createEmailService } from "./service";
export type { EmailOptions, EmailService, EmailServiceConfig } from "./service";
export {
    createPasswordResetEmail,
    createTestEmail,
} from "./templates";
export type { EmailTemplateBranding } from "./templates";
export {
    buildNewsletterUnsubscribeUrl,
    generateNewsletterUnsubscribeToken,
    verifyNewsletterUnsubscribeToken,
} from "./newsletter-tokens";
export {
    createCampaignBroadcastEmailHtml,
    createCampaignPreviewEmailHtml,
    createNewsletterWelcomeBackEmailHtml,
    createNewsletterWelcomeEmailHtml,
} from "./newsletter-mail-html";
export type { NewsletterMailSiteContext } from "./newsletter-mail-html";
