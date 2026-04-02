import prisma from "@/prisma/client";
import { jwtConfig } from "@/lib/config";
import { createUserService } from "@honeylemon/server/blog";
import { createUserApiHandlers } from "@honeylemon/server/routes/user";

const { GET, POST, PATCH, DELETE } = createUserApiHandlers({
    jwtSecret: jwtConfig.secret,
    userService: createUserService({ prisma }),
});

export { GET, POST, PATCH, DELETE };
