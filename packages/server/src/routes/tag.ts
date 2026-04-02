import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@honeylemon/server/auth";

const tagSchema = z.object({
    name: z.string().min(1, "Tag name must be at least 1 character long"),
    slug: z.string().optional(),
});

export interface TagApiHandlerDeps {
    jwtSecret: string;
    prisma: PrismaClient;
}

export function createTagApiHandlers(deps: TagApiHandlerDeps) {
    const { jwtSecret, prisma } = deps;

    async function GET() {
        try {
            const tags = await prisma.tag.findMany({
                orderBy: { name: "asc" },
            });

            return NextResponse.json({ success: true, tags }, { status: 200 });
        } catch (error) {
            console.error("Error fetching tags:", error);
            return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
        }
    }

    async function POST(req: Request) {
        try {
            const token = req.headers.get("authorization")?.split(" ")[1];
            const decoded = verifyToken(token!, jwtSecret);

            if (!decoded) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = await req.json();
            const validatedData = tagSchema.parse(body);

            const normalizedName = validatedData.name.trim();

            if (!normalizedName) {
                return NextResponse.json({ error: "Tag name cannot be empty" }, { status: 400 });
            }

            const slug =
                validatedData.slug ||
                normalizedName.toLowerCase().trim().replace(/\s+/g, "-");

            const existingTagBySlug = await prisma.tag.findFirst({
                where: { slug: slug },
            });

            if (existingTagBySlug) {
                return NextResponse.json({ success: true, tag: existingTagBySlug }, { status: 200 });
            }

            const allTags = await prisma.tag.findMany();
            const normalizedInputName = normalizedName.toLowerCase().trim();
            const existingTagByName = allTags.find(
                (tag) => tag.name.toLowerCase().trim() === normalizedInputName
            );

            if (existingTagByName) {
                return NextResponse.json({ success: true, tag: existingTagByName }, { status: 200 });
            }

            const newTag = await prisma.tag.create({
                data: {
                    name: normalizedName,
                    slug,
                },
            });

            return NextResponse.json({ success: true, tag: newTag }, { status: 201 });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return NextResponse.json({ error: error.errors }, { status: 400 });
            }

            console.error("Error creating tag:", error);
            return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
        }
    }

    return { GET, POST };
}
