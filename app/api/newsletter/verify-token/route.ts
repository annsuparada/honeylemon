import { NextResponse } from "next/server";
import crypto from "crypto";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Generate unsubscribe token (same function as in newsletter route)
function generateUnsubscribeToken(email: string): string {
    const secret = process.env.SECRET_KEY || 'fallback-secret';
    const data = `unsubscribe:${email}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// Verify unsubscribe token
function verifyUnsubscribeToken(token: string, email: string): boolean {
    const expectedToken = generateUnsubscribeToken(email);
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
}

// GET: Verify unsubscribe token
export async function GET(req: Request) {
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

        const isValid = verifyUnsubscribeToken(token, email);

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
