import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtConfig } from "@/lib/config";

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, jwtConfig.secret) as JwtPayload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}
