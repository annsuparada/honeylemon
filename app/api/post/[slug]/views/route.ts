import { NextResponse } from "next/server";
import prisma from "@/prisma/client";

// POST: Increment view count for a post by slug
export async function POST(
    req: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        if (!slug) {
            return NextResponse.json(
                { error: "Slug is required" },
                { status: 400 }
            );
        }

        // Skip incrementing views in development/localhost
        const origin = req.headers.get('origin') || req.headers.get('referer') || '';
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const isDevelopment = process.env.NODE_ENV === 'development';

        if (isDevelopment || isLocalhost) {
            // In development, just return the current view count without incrementing
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

        // In production, increment views atomically
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
        // If post not found, return 404
        if ((error as any)?.code === 'P2025') {
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

