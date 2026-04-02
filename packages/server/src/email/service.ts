import nodemailer from "nodemailer";

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export interface EmailServiceConfig {
    gmailUser: string;
    gmailAppPassword: string;
    brandName?: string;
}

export interface EmailService {
    sendEmail: (options: EmailOptions) => Promise<boolean>;
    brandName: string;
}

export function createEmailService(config: EmailServiceConfig): EmailService {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: config.gmailUser,
            pass: config.gmailAppPassword,
        },
    });
    const brandName = config.brandName ?? "Honey Lemon";

    async function sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions = {
                from: `"${brandName}" <${config.gmailUser}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
            };

            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error("Email sending failed:", error);
            return false;
        }
    }

    return { sendEmail, brandName };
}
