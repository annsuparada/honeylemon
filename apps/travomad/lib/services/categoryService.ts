import prisma from "@/prisma/client";
import { createCategoryService } from "@honeylemon/server/blog";

const categoryService = createCategoryService({ prisma });

export const getAllCategories = categoryService.getAllCategories;
export const categoryExistsByName = categoryService.categoryExistsByName;
export const generateCategorySlug = categoryService.generateCategorySlug;
export const createCategory = categoryService.createCategory;
export const getCategoryById = categoryService.getCategoryById;
export const updateCategory = categoryService.updateCategory;
export const deleteCategory = categoryService.deleteCategory;
