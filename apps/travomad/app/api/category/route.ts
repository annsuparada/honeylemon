import prisma from "@/prisma/client";
import { jwtConfig } from "@/lib/config";
import { createCategoryService } from "@honeylemon/server/blog";
import { createCategoryApiHandlers } from "@honeylemon/server/routes/category";

const { GET, POST, PATCH, DELETE } = createCategoryApiHandlers({
    jwtSecret: jwtConfig.secret,
    categoryService: createCategoryService({ prisma }),
});

export { GET, POST, PATCH, DELETE };
