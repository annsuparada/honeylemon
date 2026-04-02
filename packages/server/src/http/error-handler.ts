import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ErrorResponse {
    error: string;
    details?: unknown;
    statusCode: number;
}

export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public details?: unknown
    ) {
        super(message);
        this.name = "AppError";
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, 400, details);
        this.name = "ValidationError";
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
        this.name = "UnauthorizedError";
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, 404);
        this.name = "NotFoundError";
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
        this.name = "ConflictError";
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = "Rate limit reached") {
        super(message, 429);
        this.name = "RateLimitError";
    }
}

export function formatZodError(error: ZodError): ErrorResponse {
    return {
        error: "Validation failed",
        details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
        })),
        statusCode: 400,
    };
}

export function handleError(error: unknown): NextResponse {
    console.error("Error occurred:", error);

    if (error instanceof ZodError) {
        const formatted = formatZodError(error);
        return NextResponse.json(
            { error: formatted.error, validationErrors: formatted.details },
            { status: formatted.statusCode }
        );
    }

    if (error instanceof AppError) {
        const response: { error: string; details?: unknown } = {
            error: error.message,
        };

        if (error.details) {
            response.details = error.details;
        }

        return NextResponse.json(response, { status: error.statusCode });
    }

    if (error instanceof Error) {
        if (error.message.includes("rate limit") || error.message.includes("429")) {
            return NextResponse.json(
                { error: "Rate limit reached - Please wait a moment and try again" },
                { status: 429 }
            );
        }

        if (error.message.includes("network") || error.message.includes("fetch")) {
            return NextResponse.json(
                { error: "Network error - Please check your connection and try again" },
                { status: 503 }
            );
        }

        if (
            error.message === "Slug already exists" ||
            error.message === "Email already exists" ||
            error.message === "Username already exists" ||
            error.message === "Category already exists"
        ) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (
            error.message === "Post not found" ||
            error.message === "Category not found" ||
            error.message === "User not found"
        ) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
    }

    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
}

export function withErrorHandler<T extends unknown[]>(
    handler: (...args: T) => Promise<NextResponse>
) {
    return async (...args: T): Promise<NextResponse> => {
        try {
            return await handler(...args);
        } catch (error) {
            return handleError(error);
        }
    };
}

export function successResponse<T>(
    data: T,
    status: number = 200
): NextResponse {
    return NextResponse.json({ success: true, ...data }, { status });
}

export function errorResponse(
    message: string,
    status: number = 500,
    details?: unknown
): NextResponse {
    const response: { error: string; details?: unknown } = { error: message };
    if (details) {
        response.details = details;
    }
    return NextResponse.json(response, { status });
}
