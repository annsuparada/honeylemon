import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "@/prisma/client";

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ message: "Token and new password are required" }, { status: 400 });
        }

        const decoded = jwt.verify(token, SECRET_KEY as string) as { id: string };

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return NextResponse.json({ message: "Invalid user" }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
    } catch (error) {
        console.error("Reset error:", error);
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }
}
