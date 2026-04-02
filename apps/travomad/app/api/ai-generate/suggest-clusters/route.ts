import { NextResponse } from "next/server";
import { jwtConfig } from "@/lib/config";
import { requireBearerUserId } from "@honeylemon/server/routes/bearer-auth";
import { suggestClusterTopics } from "@/lib/claude";

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai-generate/suggest-clusters
 * Suggest cluster topics for a pillar page
 * 
 * Request body: { pillarId: string }
 * Response: { success: boolean, suggestions?: string[], error?: string }
 */
export async function POST(req: Request) {
    try {
        const auth = requireBearerUserId(req, jwtConfig.secret);
        if (!auth.success) {
            return auth.response;
        }

        // Validate environment variables
        if (!process.env.ANTHROPIC_API_KEY) {
            return NextResponse.json(
                {
                    error: "API configuration error",
                    message: "Missing required environment variable: ANTHROPIC_API_KEY",
                },
                { status: 500 }
            );
        }

        // Parse and validate request body
        let body: { pillarId: string };
        try {
            body = await req.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request data - JSON parsing failed" },
                { status: 400 }
            );
        }

        if (!body.pillarId) {
            return NextResponse.json(
                { error: "Invalid request data - pillarId is required" },
                { status: 400 }
            );
        }

        // Generate cluster topic suggestions using Claude API
        try {
            const suggestions = await suggestClusterTopics(body.pillarId);

            return NextResponse.json(
                {
                    success: true,
                    suggestions,
                    pillarId: body.pillarId,
                },
                { status: 200 }
            );
        } catch (error) {
            // Error handling is done in suggestClusterTopics, but we catch here to format response
            if (error instanceof Error) {
                if (error.message.includes('Rate limit')) {
                    return NextResponse.json(
                        { error: error.message },
                        { status: 429 }
                    );
                }
                if (error.message.includes('not found')) {
                    return NextResponse.json(
                        { error: error.message },
                        { status: 404 }
                    );
                }
            }

            // Re-throw to be caught by outer catch
            throw error;
        }

    } catch (error) {
        console.error("Error in cluster suggestion API:", error);

        // Handle database errors
        if (error instanceof Error && error.message.includes('prisma')) {
            return NextResponse.json(
                { error: "Database error - Failed to fetch pillar page" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error - Failed to process cluster suggestion request" },
            { status: 500 }
        );
    }
}

