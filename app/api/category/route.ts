import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { z } from "zod";
import { categorySchema } from "@/schemas/categorySchema";
import { verifyToken } from "@/utils/auth";


// GET: Retrieve all categories (Public Access)
export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, categories }, { status: 200 });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

// POST: Create a new category (Protected)
export async function POST(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1]
        const decoded = verifyToken(token!)

        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json();

        // Validate request body using Zod
        const validatedData = categorySchema.parse(body);

        // Check if category already exists
        const existingCategory = await prisma.category.findUnique({
            where: { name: validatedData.name },
        });
        if (existingCategory) {
            return NextResponse.json({ error: "Category already exists" }, { status: 400 });
        }

        // Generate slug if not provided
        const slug = validatedData.slug || validatedData.name.toLowerCase().replace(/\s+/g, "-");

        // Create category
        const newCategory = await prisma.category.create({
            data: {
                name: validatedData.name,
                slug,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        console.error("Error creating category:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

// PATCH: Update a category (by ID) (Protected)
export async function PATCH(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1]
        const decoded = verifyToken(token!)

        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json();

        // Validate input
        const schema = z.object({
            id: z.string().min(1, "Category ID is required"),
            name: z.string().min(3).optional(),
            slug: z.string().optional(),
        });

        const validatedData = schema.parse(body);

        // Check if category exists
        const category = await prisma.category.findUnique({ where: { id: validatedData.id } });
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Update category
        const updatedCategory = await prisma.category.update({
            where: { id: validatedData.id },
            data: {
                name: validatedData.name ?? category.name,
                slug: validatedData.slug ?? category.slug,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, category: updatedCategory }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        console.error("Error updating category:", error);
        return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
    }
}

// DELETE: Remove a category by ID
export async function DELETE(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1]
        const decoded = verifyToken(token!)

        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json();

        // Validate input
        const schema = z.object({
            id: z.string().min(1, "Category ID is required"),
        });

        const validatedData = schema.parse(body);

        // Check if category exists
        const category = await prisma.category.findUnique({ where: { id: validatedData.id } });
        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        // Delete category
        await prisma.category.delete({ where: { id: validatedData.id } });

        return NextResponse.json({ success: true, message: "Category deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        console.error("Error deleting category:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}