import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { deleteUserSchema, editUserSchema, userSchema } from "@/schemas/userSchema";
import bcrypt from "bcrypt"
import { ZodError } from 'zod'
import { verifyToken } from "@/utils/auth";

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
        const users = await prisma.user.findMany();

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

        //  Check if email already exists
        const existingEmail = await prisma.user.findFirst({ where: { email: validatedData.email } });
        if (existingEmail) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }

        //  Check if username already exists
        const existingUsername = await prisma.user.findFirst({ where: { username: validatedData.username } });
        if (existingUsername) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }


        // Hash password before storing
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                username: validatedData.username,
                email: validatedData.email,
                password: hashedPassword,
                bio: validatedData.bio || "",
                profilePicture: validatedData.profilePicture || "",
                role: validatedData.role || "USER",
                name: validatedData.name || "",
                lastName: validatedData.lastName || "",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, user: newUser }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 })
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

        // Check if user exists using the old email
        const user = await prisma.user.findFirst({ where: { email: validatedData.email } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if a new email is provided and if it is already taken
        if (validatedData.newEmail) {
            const emailExists = await prisma.user.findFirst({ where: { email: validatedData.newEmail } });
            if (emailExists) {
                return NextResponse.json({ error: "Email already in use" }, { status: 400 });
            }
        }

        // Update user, including email if provided
        const updatedUser = await prisma.user.update({
            where: { email: validatedData.email }, // Find user by current email
            data: {
                email: validatedData.newEmail ?? user.email, // Change email only if provided
                name: validatedData.name ?? user.name,
                lastName: validatedData.lastName ?? user.lastName,
                username: validatedData.username ?? user.username,
                bio: validatedData.bio ?? user.bio,
                profilePicture: validatedData.profilePicture ?? user.profilePicture,
                role: validatedData.role ?? user.role,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
    } catch (error) {
        console.error("Error updating user:", error);
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

        // Check if user exists
        const user = await prisma.user.findFirst({
            where: { email: validatedData.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete the user
        await prisma.user.delete({
            where: { email: validatedData.email },
        });

        return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });

    } catch (error) {
        //  Return Zod validation errors
        if (error instanceof ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }

        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}