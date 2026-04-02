import { NextResponse } from "next/server";
import { verifyNewsletterUnsubscribeToken } from "../email/newsletter-tokens";

export interface NewsletterVerifyTokenApiHandlerDeps {
    jwtSecret: string;
}

export function createNewsletterVerifyTokenApiHandlers(
    deps: NewsletterVerifyTokenApiHandlerDeps
) {
    const { jwtSecret } = deps;

    async function GET(req: Request) {
        try {
            const { searchParams } = new URL(req.url);
            const email = searchParams.get("email");
            const token = searchParams.get("token");

            if (!email || !token) {
                return NextResponse.json(
                    { error: "Email and token parameters are required" },
                    { status: 400 }
                );
            }

            const isValid = verifyNewsletterUnsubscribeToken(
                token,
                email,
                jwtSecret
            );

            if (!isValid) {
                return NextResponse.json(
                    { error: "Invalid unsubscribe token" },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { success: true, message: "Token is valid" },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error verifying token:", error);
            return NextResponse.json(
                { error: "Failed to verify token" },
                { status: 500 }
            );
        }
    }

    return { GET };
}
