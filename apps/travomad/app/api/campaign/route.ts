import prisma from "@/prisma/client";
import { sendEmail } from "@/utils/services/emailService";
import { travomadNewsletterMailCtx } from "@/lib/cms-mail-context";
import { createCampaignApiHandlers } from "@honeylemon/server/routes/campaign";

export const dynamic = "force-dynamic";

const { POST, GET } = createCampaignApiHandlers({
    prisma,
    sendEmail,
    mailCtx: travomadNewsletterMailCtx,
});

export { POST, GET };
