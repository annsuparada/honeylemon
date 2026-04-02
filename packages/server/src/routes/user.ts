import {
    deleteUserSchema,
    editUserSchema,
    userSchema,
} from "@honeylemon/cms";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyToken } from "@honeylemon/server/auth";
import type { UserService } from "../blog/user-service";

export interface UserApiHandlerDeps {
    jwtSecret: string;
    userService: UserService;
}

export function createUserApiHandlers(deps: UserApiHandlerDeps) {
    const { jwtSecret, userService } = deps;
    const { getAllUsers, createUser, updateUser, deleteUser } = userService;

    async function GET(req: Request) {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized - No Token Provided" },
                { status: 401 }
            );
        }
        const decoded = verifyToken(token, jwtSecret);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
            const users = await getAllUsers();

            if (!users || users.length === 0) {
                return NextResponse.json({ success: true, users: [] }, { status: 200 });
            }

            return NextResponse.json({ success: true, users }, { status: 200 });
        } catch (error) {
            console.error("Error fetching users:", error);
            return NextResponse.json(
                { success: false, error: "Failed to fetch users" },
                { status: 500 }
            );
        }
    }

    async function POST(req: Request) {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized - No Token Provided" },
                { status: 401 }
            );
        }
        const decoded = verifyToken(token, jwtSecret);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
            const body = await req.json();
            const validatedData = userSchema.parse(body);
            const newUser = await createUser(validatedData);

            return NextResponse.json({ success: true, user: newUser }, { status: 201 });
        } catch (error) {
            console.error("Error creating user:", error);
            if (error instanceof ZodError) {
                return NextResponse.json({ error: error.errors }, { status: 400 });
            }
            if (error instanceof Error) {
                if (
                    error.message === "Email already exists" ||
                    error.message === "Username already exists"
                ) {
                    return NextResponse.json({ error: error.message }, { status: 400 });
                }
            }
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }
    }

    async function PATCH(req: Request) {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized - No Token Provided" },
                { status: 401 }
            );
        }
        const decoded = verifyToken(token, jwtSecret);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
            const body = await req.json();
            const validatedData = editUserSchema.parse(body);
            const updatedUser = await updateUser(validatedData);

            return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
        } catch (error) {
            console.error("Error updating user:", error);
            if (error instanceof Error) {
                if (error.message === "User not found") {
                    return NextResponse.json({ error: error.message }, { status: 404 });
                }
                if (error.message === "Email already in use") {
                    return NextResponse.json({ error: error.message }, { status: 400 });
                }
            }
            return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
        }
    }

    async function DELETE(req: Request) {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized - No Token Provided" },
                { status: 401 }
            );
        }
        const decoded = verifyToken(token, jwtSecret);
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
            const body = await req.json();
            const validatedData = deleteUserSchema.parse(body);

            await deleteUser(validatedData);

            return NextResponse.json(
                { success: true, message: "User deleted successfully" },
                { status: 200 }
            );
        } catch (error) {
            if (error instanceof ZodError) {
                return NextResponse.json({ error: error.errors }, { status: 400 });
            }

            if (error instanceof Error) {
                if (error.message === "User not found") {
                    return NextResponse.json({ error: error.message }, { status: 404 });
                }
            }

            console.error("Error deleting user:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }
    }

    return { GET, POST, PATCH, DELETE };
}
