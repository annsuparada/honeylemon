import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export interface PostViewsApiHandlerDeps {
    prisma: PrismaClient;
}

export function createPostViewsApiHandlers(deps: PostViewsApiHandlerDeps) {
    const { prisma } = deps;

    async function POST(
        req: Request,
        context: { params: { slug: string } }
    ) {
        try {
            const { slug } = context.params;

            if (!slug) {
                return NextResponse.json(
                    { error: "Slug is required" },
                    { status: 400 }
                );
            }

            const origin =
                req.headers.get("origin") || req.headers.get("referer") || "";
            const isLocalhost =
                origin.includes("localhost") || origin.includes("127.0.0.1");
            const isDevelopment = process.env.NODE_ENV === "development";

            if (isDevelopment || isLocalhost) {
                const post = await prisma.post.findUnique({
                    where: { slug },
                    select: {
                        id: true,
                        slug: true,
                        views: true,
                    },
                });

                if (!post) {
                    return NextResponse.json(
                        { error: "Post not found" },
                        { status: 404 }
                    );
                }

                return NextResponse.json(
                    { success: true, views: post.views, skipped: true },
                    { status: 200 }
                );
            }

            const post = await prisma.post.update({
                where: { slug },
                data: {
                    views: {
                        increment: 1,
                    },
                },
                select: {
                    id: true,
                    slug: true,
                    views: true,
                },
            });

            return NextResponse.json(
                { success: true, views: post.views },
                { status: 200 }
            );
        } catch (error) {
            console.error("Error incrementing view count:", error);
            if ((error as { code?: string })?.code === "P2025") {
                return NextResponse.json(
                    { error: "Post not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { error: "Failed to increment view count" },
                { status: 500 }
            );
        }
    }

    return { POST };
}
