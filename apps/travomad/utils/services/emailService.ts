import { emailConfig } from "@/lib/config";
import {
    createEmailService,
    createPasswordResetEmail as createPasswordResetEmailHtml,
    createTestEmail as createTestEmailHtml,
} from "@honeylemon/server/email";

const TRAVOMAD_BRAND = "Honey Lemon";

const { sendEmail } = createEmailService({
    gmailUser: emailConfig.gmailUser,
    gmailAppPassword: emailConfig.gmailAppPassword,
    brandName: TRAVOMAD_BRAND,
});

export { sendEmail };

export function createTestEmail(): string {
    return createTestEmailHtml({ brandName: TRAVOMAD_BRAND });
}

export function createPasswordResetEmail(resetLink: string): string {
    return createPasswordResetEmailHtml(resetLink, { brandName: TRAVOMAD_BRAND });
}
