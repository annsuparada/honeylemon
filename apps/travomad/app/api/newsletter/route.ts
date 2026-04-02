import prisma from "@/prisma/client";
import { sendEmail } from "@/utils/services/emailService";
import { travomadNewsletterMailCtx } from "@/lib/cms-mail-context";
import { createNewsletterApiHandlers } from "@honeylemon/server/routes/newsletter";

export const dynamic = "force-dynamic";

const { POST, GET, DELETE } = createNewsletterApiHandlers({
    prisma,
    sendEmail,
    mailCtx: travomadNewsletterMailCtx,
});

export { POST, GET, DELETE };
