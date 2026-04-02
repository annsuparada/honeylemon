import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { verifyToken } from "@honeylemon/server/auth";

export interface UserPasswordApiHandlerDeps {
    jwtSecret: string;
    prisma: PrismaClient;
}

export function createUserPasswordApiHandlers(deps: UserPasswordApiHandlerDeps) {
    const { jwtSecret, prisma } = deps;

    async function PATCH(req: Request) {
        try {
            const token = req.headers.get("authorization")?.split(" ")[1];

            if (!token) {
                return NextResponse.json(
                    { message: "Unauthorized - No token provided" },
                    { status: 401 }
                );
            }

            const decoded = verifyToken(token, jwtSecret);
            if (!decoded || !decoded.id) {
                return NextResponse.json({ message: "Invalid token" }, { status: 401 });
            }

            const { currentPassword, newPassword } = await req.json();

            if (!currentPassword || !newPassword) {
                return NextResponse.json(
                    { message: "Both current and new passwords are required" },
                    { status: 400 }
                );
            }

            const user = await prisma.user.findUnique({ where: { id: decoded.id as string } });

            if (!user || !user.password) {
                return NextResponse.json({ message: "User not found" }, { status: 404 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return NextResponse.json(
                    { message: "Current password is incorrect" },
                    { status: 401 }
                );
            }
            const isSameAsOld = await bcrypt.compare(newPassword, user.password);

            if (isSameAsOld) {
                return NextResponse.json(
                    { message: "New password must be different than current password" },
                    { status: 400 }
                );
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    updatedAt: new Date(),
                },
            });

            return NextResponse.json(
                { success: true, message: "Password updated successfully" },
                { status: 200 }
            );
        } catch (error) {
            console.error("Password update error:", error);
            return NextResponse.json({ message: "Internal server error" }, { status: 500 });
        }
    }

    return { PATCH };
}
