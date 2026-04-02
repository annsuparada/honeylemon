import type { PrismaClient } from "@prisma/client";
import { categorySchema } from "@honeylemon/cms";
import { z } from "zod";

export function createCategoryService(deps: { prisma: PrismaClient }) {
    const { prisma } = deps;

    async function getAllCategories() {
        return await prisma.category.findMany({
            orderBy: { createdAt: "desc" },
        });
    }

    async function categoryExistsByName(name: string): Promise<boolean> {
        const existingCategory = await prisma.category.findUnique({
            where: { name },
        });
        return !!existingCategory;
    }

    function generateCategorySlug(name: string): string {
        return name.toLowerCase().replace(/\s+/g, "-");
    }

    async function createCategory(data: z.infer<typeof categorySchema>) {
        if (await categoryExistsByName(data.name)) {
            throw new Error("Category already exists");
        }

        const slug = data.slug || generateCategorySlug(data.name);

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

    async function getCategoryById(id: string) {
        return await prisma.category.findUnique({
            where: { id },
        });
    }

    async function updateCategory(
        id: string,
        data: { name?: string; slug?: string }
    ) {
        const category = await getCategoryById(id);
        if (!category) {
            throw new Error("Category not found");
        }

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

    async function deleteCategory(id: string) {
        const category = await getCategoryById(id);
        if (!category) {
            throw new Error("Category not found");
        }

        await prisma.category.delete({
            where: { id },
        });
    }

    return {
        getAllCategories,
        categoryExistsByName,
        generateCategorySlug,
        createCategory,
        getCategoryById,
        updateCategory,
        deleteCategory,
    };
}

export type CategoryService = ReturnType<typeof createCategoryService>;
