import { NextResponse } from "next/server";

export interface PillarCheckQueryParams {
    pageType: string;
    tagId?: string;
    tagSlug?: string;
    excludePostId?: string;
}

export interface CheckPillarApiHandlerDeps {
    checkPillarExists: (params: PillarCheckQueryParams) => Promise<boolean>;
    /** Shown when `exists` is true */
    existsMessage?: string;
    /** Shown when `exists` is false */
    notExistsMessage?: string;
}

export function createCheckPillarApiHandlers(deps: CheckPillarApiHandlerDeps) {
    const {
        checkPillarExists,
        existsMessage = "A pillar page already exists for this destination",
        notExistsMessage = "No pillar page exists",
    } = deps;

    async function GET(request: Request) {
        try {
            const { searchParams } = new URL(request.url);
            const pageType = searchParams.get("type");
            const tagId = searchParams.get("tagId");
            const tagSlug = searchParams.get("tagSlug");
            const excludePostId = searchParams.get("excludePostId");

            if (!pageType) {
                return NextResponse.json(
                    { error: "Page type is required" },
                    { status: 400 }
                );
            }

            const isObjectId = tagId && /^[0-9a-fA-F]{24}$/.test(tagId);
            const finalTagId = isObjectId ? tagId : undefined;
            const finalTagSlug =
                !isObjectId && tagId ? tagId : tagSlug || undefined;

            const exists = await checkPillarExists({
                pageType,
                tagId: finalTagId,
                tagSlug: finalTagSlug,
                excludePostId: excludePostId || undefined,
            });

            return NextResponse.json({
                exists,
                message: exists ? existsMessage : notExistsMessage,
            });
        } catch (error) {
            console.error("Error checking pillar:", error);
            return NextResponse.json(
                { error: "Failed to check pillar existence" },
                { status: 500 }
            );
        }
    }

    return { GET };
}
