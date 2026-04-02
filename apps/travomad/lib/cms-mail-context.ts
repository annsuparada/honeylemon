import type { NewsletterMailSiteContext } from "@honeylemon/server/email";
import { jwtConfig, nextjsConfig } from "@/lib/config";

export const travomadNewsletterMailCtx: NewsletterMailSiteContext = {
    publicSiteUrl: nextjsConfig.apiUrl,
    jwtSecret: jwtConfig.secret,
    brandName: "Honey Lemon",
};
