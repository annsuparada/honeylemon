import { PageType, PostStatus } from "@prisma/client";
import { postSchema, updatePostSchema } from "@honeylemon/cms";
import { z } from "zod";
import { verifyToken } from "@honeylemon/server/auth";
import type { PostService } from "../blog/post-service";
import { handleError, successResponse, UnauthorizedError } from "../http/error-handler";

export interface PostApiHandlerDeps {
    jwtSecret: string;
    postService: PostService;
}

export function createPostApiHandlers(deps: PostApiHandlerDeps) {
    const { jwtSecret, postService } = deps;
    const {
        buildPostFilter,
        getPosts,
        createPost,
        updatePost,
        deletePost,
    } = postService;

    async function GET(req: Request) {
        try {
            const { searchParams } = new URL(req.url);
            const slug = searchParams.get("slug");
            const statusParam = searchParams.get("status");
            const categoryParam = searchParams.get("category");
            const limitParam = searchParams.get("limit");
            const typeParam = searchParams.get("type");
            const featuredParam = searchParams.get("featured");
            const trendingParam = searchParams.get("trending");

            const validStatuses = Object.values(PostStatus);
            const status = validStatuses.includes(statusParam as PostStatus)
                ? (statusParam as PostStatus)
                : undefined;

            const validPageTypes = Object.values(PageType);
            const type = validPageTypes.includes(typeParam as PageType)
                ? (typeParam as PageType)
                : undefined;

            const filter = await buildPostFilter({
                slug: slug || undefined,
                status,
                category: categoryParam || undefined,
                type,
                featured: featuredParam === "true",
                trending: trendingParam === "true",
            });

            if (filter === null) {
                return successResponse({ posts: [] }, 200);
            }

            const limit = limitParam ? parseInt(limitParam, 10) : undefined;
            const posts = await getPosts(filter, limit);

            return successResponse({ posts }, 200);
        } catch (error) {
            return handleError(error);
        }
    }

    async function POST(req: Request) {
        try {
            const token = req.headers.get("authorization")?.split(" ")[1];

            if (!token) {
                throw new UnauthorizedError("No token provided");
            }

            const decoded = verifyToken(token, jwtSecret);

            if (!decoded || !decoded.id) {
                throw new UnauthorizedError();
            }

            const body = await req.json();
            const validatedData = postSchema.parse(body);
            const newPost = await createPost(validatedData, decoded.id as string);

            return successResponse({ post: newPost }, 201);
        } catch (error) {
            return handleError(error);
        }
    }

    async function PATCH(req: Request) {
        try {
            const token = req.headers.get("authorization")?.split(" ")[1];

            if (!token) {
                throw new UnauthorizedError("No token provided");
            }

            const decoded = verifyToken(token, jwtSecret);

            if (!decoded || !decoded.id) {
                throw new UnauthorizedError();
            }

            const body = await req.json();
            const validatedData = updatePostSchema.parse(body);
            const updatedPost = await updatePost(validatedData);

            return successResponse({ post: updatedPost }, 200);
        } catch (error) {
            return handleError(error);
        }
    }

    async function DELETE(req: Request) {
        try {
            const token = req.headers.get("authorization")?.split(" ")[1];

            if (!token) {
                throw new UnauthorizedError("No token provided");
            }

            const decoded = verifyToken(token, jwtSecret);

            if (!decoded || !decoded.id) {
                throw new UnauthorizedError();
            }

            const body = await req.json();
            const schema = z.object({
                id: z.string().min(1, "Post ID is required"),
            });
            const validatedData = schema.parse(body);

            await deletePost(validatedData.id);

            return successResponse({ message: "Post deleted successfully" }, 200);
        } catch (error) {
            return handleError(error);
        }
    }

    return { GET, POST, PATCH, DELETE };
}
