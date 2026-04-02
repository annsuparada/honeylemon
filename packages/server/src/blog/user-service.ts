import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {
    deleteUserSchema,
    editUserSchema,
    userSchema,
} from "@honeylemon/cms";
import { z } from "zod";

export function createUserService(deps: { prisma: PrismaClient }) {
    const { prisma } = deps;

    async function getAllUsers() {
        return await prisma.user.findMany();
    }

    async function emailExists(email: string): Promise<boolean> {
        const existingEmail = await prisma.user.findFirst({
            where: { email },
        });
        return !!existingEmail;
    }

    async function usernameExists(username: string): Promise<boolean> {
        const existingUsername = await prisma.user.findFirst({
            where: { username },
        });
        return !!existingUsername;
    }

    async function getUserByEmail(email: string) {
        return await prisma.user.findFirst({
            where: { email },
        });
    }

    async function createUser(data: z.infer<typeof userSchema>) {
        if (await emailExists(data.email)) {
            throw new Error("Email already exists");
        }

        if (await usernameExists(data.username)) {
            throw new Error("Username already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

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

    async function updateUser(data: z.infer<typeof editUserSchema>) {
        const user = await getUserByEmail(data.email!);
        if (!user) {
            throw new Error("User not found");
        }

        if (data.newEmail) {
            if (await emailExists(data.newEmail)) {
                throw new Error("Email already in use");
            }
        }

        const updatedUser = await prisma.user.update({
            where: { email: data.email! },
            data: {
                email: data.newEmail ?? user.email,
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

    async function deleteUser(data: z.infer<typeof deleteUserSchema>) {
        const user = await getUserByEmail(data.email);
        if (!user) {
            throw new Error("User not found");
        }

        await prisma.user.delete({
            where: { email: data.email },
        });
    }

    return {
        getAllUsers,
        emailExists,
        usernameExists,
        getUserByEmail,
        createUser,
        updateUser,
        deleteUser,
    };
}

export type UserService = ReturnType<typeof createUserService>;
