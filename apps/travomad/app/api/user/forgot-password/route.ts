import prisma from "@/prisma/client";
import { nextjsConfig } from "@/lib/config";
import { sendEmail, createPasswordResetEmail } from "@/utils/services/emailService";
import { createForgotPasswordApiHandlers } from "@honeylemon/server/routes/forgot-password";

const { POST } = createForgotPasswordApiHandlers({
    prisma,
    sendEmail,
    publicSiteUrl: nextjsConfig.apiUrl,
    createPasswordResetEmailHtml: createPasswordResetEmail,
    emailSubject: "Reset your password - Honey Lemon",
});

export { POST };
