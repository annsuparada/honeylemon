import prisma from "@/prisma/client";
import { categorySchema } from "@/schemas/categorySchema";
import { z } from "zod";

/**
 * Get all categories
 */
export async function getAllCategories() {
    return await prisma.category.findMany({
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Check if category already exists by name
 */
export async function categoryExistsByName(name: string): Promise<boolean> {
    const existingCategory = await prisma.category.findUnique({
        where: { name },
    });
    return !!existingCategory;
}

/**
 * Generate slug from name
 */
export function generateCategorySlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Create a new category
 */
export async function createCategory(data: z.infer<typeof categorySchema>) {
    // Check if category already exists
    if (await categoryExistsByName(data.name)) {
        throw new Error("Category already exists");
    }

    // Generate slug if not provided
    const slug = data.slug || generateCategorySlug(data.name);

    // Create category
    const newCategory = await prisma.category.create({
        data: {
            name: data.name,
            slug,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    return newCategory;
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string) {
    return await prisma.category.findUnique({
        where: { id }
    });
}

/**
 * Update a category
 */
export async function updateCategory(id: string, data: { name?: string; slug?: string }) {
    // Check if category exists
    const category = await getCategoryById(id);
    if (!category) {
        throw new Error("Category not found");
    }

    // Update category
    const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
            name: data.name ?? category.name,
            slug: data.slug ?? category.slug,
            updatedAt: new Date(),
        },
    });

    return updatedCategory;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
    // Check if category exists
    const category = await getCategoryById(id);
    if (!category) {
        throw new Error("Category not found");
    }

    // Delete category
    await prisma.category.delete({
        where: { id }
    });
}

