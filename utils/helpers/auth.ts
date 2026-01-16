import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is not set. Check your environment variables.");
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, SECRET_KEY as string) as JwtPayload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}
