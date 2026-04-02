import crypto from "crypto";

export function generateNewsletterUnsubscribeToken(
    email: string,
    jwtSecret: string
): string {
    const data = `unsubscribe:${email}`;
    return crypto.createHmac("sha256", jwtSecret).update(data).digest("hex");
}

export function verifyNewsletterUnsubscribeToken(
    token: string,
    email: string,
    jwtSecret: string
): boolean {
    const expected = generateNewsletterUnsubscribeToken(email, jwtSecret);
    try {
        return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
    } catch {
        return false;
    }
}

/** Full URL to the app unsubscribe page with signed token. */
export function buildNewsletterUnsubscribeUrl(
    email: string,
    publicSiteUrl: string,
    jwtSecret: string
): string {
    const base = publicSiteUrl.replace(/\/$/, "");
    const t = generateNewsletterUnsubscribeToken(email, jwtSecret);
    return `${base}/unsubscribe?email=${encodeURIComponent(email)}&token=${t}`;
}
