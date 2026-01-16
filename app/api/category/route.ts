import { NextResponse } from "next/server";
import { z } from "zod";
import { categorySchema } from "@/schemas/categorySchema";
import { verifyToken } from "@/utils/auth";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "@/lib/services/categoryService";

// GET: Retrieve all categories (Public Access)
export async function GET() {
    try {
        const categories = await getAllCategories();

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

        // Create category using service
        const newCategory = await createCategory(validatedData);

        return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        if (error instanceof Error) {
            if (error.message === "Category already exists") {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
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

        // Update category using service
        const updatedCategory = await updateCategory(validatedData.id, {
            name: validatedData.name,
            slug: validatedData.slug,
        });

        return NextResponse.json({ success: true, category: updatedCategory }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        if (error instanceof Error) {
            if (error.message === "Category not found") {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
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

        // Delete category using service
        await deleteCategory(validatedData.id);

        return NextResponse.json({ success: true, message: "Category deleted successfully" }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        if (error instanceof Error) {
            if (error.message === "Category not found") {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }
        }

        console.error("Error deleting category:", error);
        return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
    }
}