import type { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import type { SignOptions } from "jsonwebtoken";
import { signToken } from "@honeylemon/server/auth";
import { handleError, successResponse } from "../http/error-handler";

export interface LoginApiHandlerDeps {
    prisma: PrismaClient;
    jwtSecret: string;
    /** e.g. `"7d"` — must satisfy jsonwebtoken `SignOptions["expiresIn"]` */
    tokenExpiresIn?: SignOptions["expiresIn"];
}

export function createLoginApiHandlers(deps: LoginApiHandlerDeps) {
    const { prisma, jwtSecret, tokenExpiresIn = "7d" as SignOptions["expiresIn"] } =
        deps;

    async function POST(req: Request) {
        try {
            const { email, password } = await req.json();

            const user = await prisma.user.findFirst({
                where: { email },
            });

            if (!user || !user.password) {
                return NextResponse.json({ message: "Email is invalid" }, { status: 402 });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return NextResponse.json({ message: "Password is invalid" }, { status: 401 });
            }

            const token = signToken(
                { id: user.id, email: user.email, role: user.role },
                jwtSecret,
                { expiresIn: tokenExpiresIn }
            );

            return successResponse({ message: "Login successful", token, user }, 200);
        } catch (error) {
            return handleError(error);
        }
    }

    return { POST };
}
