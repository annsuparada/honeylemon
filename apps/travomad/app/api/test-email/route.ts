import { sendEmail, createTestEmail } from "@/utils/services/emailService";
import { createTestEmailApiHandlers } from "@honeylemon/server/routes/test-email";

const { POST } = createTestEmailApiHandlers({
    sendEmail,
    createTestEmailHtml: createTestEmail,
    subject: "Test Email - Honey Lemon",
});

export { POST };
