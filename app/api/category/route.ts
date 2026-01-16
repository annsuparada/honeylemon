import { NextResponse } from "next/server";
import { z } from "zod";
import { categorySchema } from "@/schemas/categorySchema";
import { verifyToken } from "@/utils/helpers/auth";
import { getAllCategories, createCategory, updateCategory, deleteCategory } from "@/lib/services/categoryService";
import { handleError, successResponse, UnauthorizedError } from "@/lib/middleware/errorHandler";

// GET: Retrieve all categories (Public Access)
export async function GET() {
    try {
        const categories = await getAllCategories();
        return successResponse({ categories }, 200);
    } catch (error) {
        return handleError(error);
    }
}

// POST: Create a new category (Protected)
export async function POST(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        const decoded = verifyToken(token || "");

        if (!decoded) {
            throw new UnauthorizedError();
        }

        const body = await req.json();

        // Validate request body using Zod
        const validatedData = categorySchema.parse(body);

        // Create category using service
        const newCategory = await createCategory(validatedData);

        return successResponse({ category: newCategory }, 201);
    } catch (error) {
        return handleError(error);
    }
}

// PATCH: Update a category (by ID) (Protected)
export async function PATCH(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        const decoded = verifyToken(token || "");

        if (!decoded) {
            throw new UnauthorizedError();
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

        return successResponse({ category: updatedCategory }, 200);
    } catch (error) {
        return handleError(error);
    }
}

// DELETE: Remove a category by ID
export async function DELETE(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        const decoded = verifyToken(token || "");

        if (!decoded) {
            throw new UnauthorizedError();
        }

        const body = await req.json();

        // Validate input
        const schema = z.object({
            id: z.string().min(1, "Category ID is required"),
        });

        const validatedData = schema.parse(body);

        // Delete category using service
        await deleteCategory(validatedData.id);

        return successResponse({ message: "Category deleted successfully" }, 200);
    } catch (error) {
        return handleError(error);
    }
}