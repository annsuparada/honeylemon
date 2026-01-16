import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { z } from "zod";
import { verifyToken } from "@/utils/helpers/auth";

const tagSchema = z.object({
    name: z.string().min(1, "Tag name must be at least 1 character long"),
    slug: z.string().optional()
});

// GET: Retrieve all tags (Public Access)
export async function GET() {
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

// POST: Create a new tag (Protected)
export async function POST(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1]
        const decoded = verifyToken(token!)

        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json();

        // Validate request body using Zod
        const validatedData = tagSchema.parse(body);

        // Normalize the tag name (trim whitespace)
        const normalizedName = validatedData.name.trim();

        if (!normalizedName) {
            return NextResponse.json({ error: "Tag name cannot be empty" }, { status: 400 });
        }

        // Generate slug if not provided (normalized: lowercase, no spaces, trimmed)
        const slug = validatedData.slug || normalizedName.toLowerCase().trim().replace(/\s+/g, "-");

        // Check if tag already exists by slug (slug is normalized)
        // Since slug is generated from name in lowercase, this prevents duplicates regardless of case
        const existingTagBySlug = await prisma.tag.findFirst({
            where: { slug: slug }
        });

        if (existingTagBySlug) {
            return NextResponse.json({ success: true, tag: existingTagBySlug }, { status: 200 });
        }

        // Also check for case-insensitive name match (for safety, in case slug generation differs)
        // Fetch all tags and compare normalized names
        const allTags = await prisma.tag.findMany();
        const normalizedInputName = normalizedName.toLowerCase().trim();
        const existingTagByName = allTags.find(
            tag => tag.name.toLowerCase().trim() === normalizedInputName
        );

        if (existingTagByName) {
            return NextResponse.json({ success: true, tag: existingTagByName }, { status: 200 });
        }

        // Create tag with normalized name (no duplicates found)
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

