import prisma from "@/prisma/client";
import { jwtConfig } from "@/lib/config";
import { createUserPasswordApiHandlers } from "@honeylemon/server/routes/user-password";

const { PATCH } = createUserPasswordApiHandlers({
    jwtSecret: jwtConfig.secret,
    prisma,
});

export { PATCH };
