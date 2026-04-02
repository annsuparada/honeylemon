import prisma from "@/prisma/client";
import { jwtConfig } from "@/lib/config";
import { createPostService } from "@honeylemon/server/blog";
import { createPostApiHandlers } from "@honeylemon/server/routes/post";

const { GET, POST, PATCH, DELETE } = createPostApiHandlers({
    jwtSecret: jwtConfig.secret,
    postService: createPostService({ prisma }),
});

export { GET, POST, PATCH, DELETE };
