import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/prisma/client";

const SECRET_KEY = process.env.SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return NextResponse.json({ message: "If that email is registered, a reset link has been sent." }, { status: 200 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET_KEY as string,
            { expiresIn: "1h" }
        );

        const resetUrl = `${APP_URL}/reset-password?token=${token}`;

        // TODO: Send email here using nodemailer, Resend, or another service
        console.log("🔗 Reset URL:", resetUrl); // Log for development

        return NextResponse.json({ message: "Reset link sent if email is registered." }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to send reset link" }, { status: 500 });
    }
}
