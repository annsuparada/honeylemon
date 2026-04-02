import { sendEmail } from "@/utils/services/emailService";
import { travomadNewsletterMailCtx } from "@/lib/cms-mail-context";
import { createCampaignPreviewApiHandlers } from "@honeylemon/server/routes/campaign-preview";

export const dynamic = "force-dynamic";

const { POST } = createCampaignPreviewApiHandlers({
    sendEmail,
    mailCtx: travomadNewsletterMailCtx,
});

export { POST };
