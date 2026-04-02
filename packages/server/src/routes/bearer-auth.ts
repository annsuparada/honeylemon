import { NextResponse } from "next/server";
import { verifyToken } from "@honeylemon/server/auth";

export type BearerAuthResult =
    | { success: true; userId: string }
    | { success: false; response: NextResponse };

/**
 * Reads `Authorization: Bearer <token>`, verifies JWT with `jwtSecret`.
 * Use in app-local AI / admin routes to avoid duplicating the 401 block.
 */
export function requireBearerUserId(
    req: Request,
    jwtSecret: string
): BearerAuthResult {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
        return {
            success: false,
            response: NextResponse.json(
                { error: "Unauthorized - No Token Provided" },
                { status: 401 }
            ),
        };
    }

    const decoded = verifyToken(token, jwtSecret);
    if (!decoded || !decoded.id) {
        return {
            success: false,
            response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        };
    }

    return { success: true, userId: decoded.id as string };
}
