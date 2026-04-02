import prisma from "@/prisma/client";
import { createResetPasswordApiHandlers } from "@honeylemon/server/routes/reset-password";

const { POST } = createResetPasswordApiHandlers({ prisma });

export { POST };
