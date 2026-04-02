import prisma from "@/prisma/client";
import { jwtConfig } from "@/lib/config";
import { createTagApiHandlers } from "@honeylemon/server/routes/tag";

const { GET, POST } = createTagApiHandlers({
    jwtSecret: jwtConfig.secret,
    prisma,
});

export { GET, POST };
