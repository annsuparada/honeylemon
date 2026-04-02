import prisma from "@/prisma/client";
import { jwtConfig } from "@/lib/config";
import { createLoginApiHandlers } from "@honeylemon/server/routes/login";

const { POST } = createLoginApiHandlers({
    prisma,
    jwtSecret: jwtConfig.secret,
});

export { POST };
