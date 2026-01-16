import prisma from "@/prisma/client";
import bcrypt from "bcrypt";
import { userSchema, editUserSchema, deleteUserSchema } from "@/schemas/userSchema";
import { z } from "zod";

/**
 * Get all users
 */
export async function getAllUsers() {
    return await prisma.user.findMany();
}

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean> {
    const existingEmail = await prisma.user.findFirst({
        where: { email }
    });
    return !!existingEmail;
}

/**
 * Check if username already exists
 */
export async function usernameExists(username: string): Promise<boolean> {
    const existingUsername = await prisma.user.findFirst({
        where: { username }
    });
    return !!existingUsername;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
    return await prisma.user.findFirst({
        where: { email }
    });
}

/**
 * Create a new user
 */
export async function createUser(data: z.infer<typeof userSchema>) {
    // Check if email already exists
    if (await emailExists(data.email)) {
        throw new Error("Email already exists");
    }

    // Check if username already exists
    if (await usernameExists(data.username)) {
        throw new Error("Username already exists");
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create new user
    const newUser = await prisma.user.create({
        data: {
            username: data.username,
            email: data.email,
            password: hashedPassword,
            bio: data.bio || "",
            profilePicture: data.profilePicture || "",
            role: data.role || "USER",
            name: data.name || "",
            lastName: data.lastName || "",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    return newUser;
}

/**
 * Update a user
 */
export async function updateUser(data: z.infer<typeof editUserSchema>) {
    // Check if user exists using the email
    const user = await getUserByEmail(data.email!);
    if (!user) {
        throw new Error("User not found");
    }

    // Check if a new email is provided and if it is already taken
    if (data.newEmail) {
        if (await emailExists(data.newEmail)) {
            throw new Error("Email already in use");
        }
    }

    // Update user, including email if provided
    const updatedUser = await prisma.user.update({
        where: { email: data.email! }, // Find user by current email
        data: {
            email: data.newEmail ?? user.email, // Change email only if provided
            name: data.name ?? user.name,
            lastName: data.lastName ?? user.lastName,
            username: data.username ?? user.username,
            bio: data.bio ?? user.bio,
            profilePicture: data.profilePicture ?? user.profilePicture,
            role: data.role ?? user.role,
            updatedAt: new Date(),
        },
    });

    return updatedUser;
}

/**
 * Delete a user
 */
export async function deleteUser(data: z.infer<typeof deleteUserSchema>) {
    // Check if user exists
    const user = await getUserByEmail(data.email);
    if (!user) {
        throw new Error("User not found");
    }

    // Delete the user
    await prisma.user.delete({
        where: { email: data.email },
    });
}

