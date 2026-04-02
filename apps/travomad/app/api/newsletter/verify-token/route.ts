import { jwtConfig } from "@/lib/config";
import { createNewsletterVerifyTokenApiHandlers } from "@honeylemon/server/routes/newsletter-verify-token";

export const dynamic = "force-dynamic";

const { GET } = createNewsletterVerifyTokenApiHandlers({
    jwtSecret: jwtConfig.secret,
});

export { GET };
