import prisma from "@/prisma/client";
import { createPostViewsApiHandlers } from "@honeylemon/server/routes/post-views";

const { POST } = createPostViewsApiHandlers({ prisma });

export { POST };
