import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

export function verifyToken(token: string, secret: string): JwtPayload | null {
    try {
        return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

export function signToken(
    payload: string | object | Buffer,
    secret: string,
    options?: SignOptions
): string {
    return jwt.sign(payload, secret, options ?? { expiresIn: "7d" });
}
