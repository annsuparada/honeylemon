import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/prisma/client";
import { jwtConfig } from "@/lib/config";
import { handleError, successResponse } from "@/lib/middleware/errorHandler";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // 🔹 Check if user exists
        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json({ message: "Email is invalid" }, { status: 402 });
        }

        // 🔹 Check password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ message: "Password is invalid" }, { status: 401 });
        }

        // 🔹 Generate JWT token (with expiration)
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            jwtConfig.secret,
            { expiresIn: "7d" }
        );

        return successResponse({ message: "Login successful", token, user }, 200);
    } catch (error) {
        return handleError(error);
    }
}
