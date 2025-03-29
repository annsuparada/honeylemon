import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/prisma/client";

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is missing! Check your environment variables.");
}

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
            SECRET_KEY as string,
            { expiresIn: "3h" }
        );

        return NextResponse.json({ message: "Login successful", token, user }, { status: 200 });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
