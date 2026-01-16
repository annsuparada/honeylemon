import { NextResponse } from "next/server";
import { deleteUserSchema, editUserSchema, userSchema } from "@/schemas/userSchema";
import { ZodError } from 'zod'
import { verifyToken } from "@/utils/auth";
import { getAllUsers, createUser, updateUser, deleteUser } from "@/lib/services/userService";

// get all users (Protected)
export async function GET(req: Request) {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ error: "Unauthorized - No Token Provided" }, { status: 401 });
    }
    const decoded = verifyToken(token);
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
        return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
    }
}

// create user (Protected)
export async function POST(req: Request) {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ error: "Unauthorized - No Token Provided" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();

        // Validate input with Zod
        const validatedData = userSchema.parse(body);

        // Create user using service
        const newUser = await createUser(validatedData);

        return NextResponse.json({ success: true, user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
        }
        if (error instanceof Error) {
            if (error.message === "Email already exists" || error.message === "Username already exists") {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
        }
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}

// Handle PATCH requests (Update user)(Protected)
export async function PATCH(req: Request) {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ error: "Unauthorized - No Token Provided" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();

        // Validate input with Zod
        const validatedData = editUserSchema.parse(body);

        // Update user using service
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

// delete user (Protected)
export async function DELETE(req: Request) {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
        return NextResponse.json({ error: "Unauthorized - No Token Provided" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();

        // Validate input with Zod
        const validatedData = deleteUserSchema.parse(body);

        // Delete user using service
        await deleteUser(validatedData);

        return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });

    } catch (error) {
        //  Return Zod validation errors
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