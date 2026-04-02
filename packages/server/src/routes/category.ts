import { categorySchema } from "@honeylemon/cms";
import { z } from "zod";
import { verifyToken } from "@honeylemon/server/auth";
import type { CategoryService } from "../blog/category-service";
import { handleError, successResponse, UnauthorizedError } from "../http/error-handler";

export interface CategoryApiHandlerDeps {
    jwtSecret: string;
    categoryService: CategoryService;
}

export function createCategoryApiHandlers(deps: CategoryApiHandlerDeps) {
    const { jwtSecret, categoryService } = deps;
    const {
        getAllCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    } = categoryService;

    async function GET() {
        try {
            const categories = await getAllCategories();
            return successResponse({ categories }, 200);
        } catch (error) {
            return handleError(error);
        }
    }

    async function POST(req: Request) {
        try {
            const token = req.headers.get("authorization")?.split(" ")[1];
            const decoded = verifyToken(token || "", jwtSecret);

            if (!decoded) {
                throw new UnauthorizedError();
            }

            const body = await req.json();
            const validatedData = categorySchema.parse(body);
            const newCategory = await createCategory(validatedData);

            return successResponse({ category: newCategory }, 201);
        } catch (error) {
            return handleError(error);
        }
    }

    async function PATCH(req: Request) {
        try {
            const token = req.headers.get("authorization")?.split(" ")[1];
            const decoded = verifyToken(token || "", jwtSecret);

            if (!decoded) {
                throw new UnauthorizedError();
            }

            const body = await req.json();
            const schema = z.object({
                id: z.string().min(1, "Category ID is required"),
                name: z.string().min(3).optional(),
                slug: z.string().optional(),
            });
            const validatedData = schema.parse(body);

            const updatedCategory = await updateCategory(validatedData.id, {
                name: validatedData.name,
                slug: validatedData.slug,
            });

            return successResponse({ category: updatedCategory }, 200);
        } catch (error) {
            return handleError(error);
        }
    }

    async function DELETE(req: Request) {
        try {
            const token = req.headers.get("authorization")?.split(" ")[1];
            const decoded = verifyToken(token || "", jwtSecret);

            if (!decoded) {
                throw new UnauthorizedError();
            }

            const body = await req.json();
            const schema = z.object({
                id: z.string().min(1, "Category ID is required"),
            });
            const validatedData = schema.parse(body);

            await deleteCategory(validatedData.id);

            return successResponse({ message: "Category deleted successfully" }, 200);
        } catch (error) {
            return handleError(error);
        }
    }

    return { GET, POST, PATCH, DELETE };
}
