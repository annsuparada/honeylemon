import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
    error: string;
    details?: unknown;
    statusCode: number;
}

/**
 * Custom error classes for better error handling
 */
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

/**
 * Convert ZodError to a user-friendly error response
 */
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

/**
 * Handle errors and return standardized NextResponse
 */
export function handleError(error: unknown): NextResponse {
    // Log error for debugging
    console.error("Error occurred:", error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        const formatted = formatZodError(error);
        return NextResponse.json(
            { error: formatted.error, validationErrors: formatted.details },
            { status: formatted.statusCode }
        );
    }

    // Handle custom AppError instances
    if (error instanceof AppError) {
        const response: { error: string; details?: unknown } = {
            error: error.message,
        };

        if (error.details) {
            response.details = error.details;
        }

        return NextResponse.json(response, { status: error.statusCode });
    }

    // Handle standard Error instances
    if (error instanceof Error) {
        // Check for specific error messages that indicate certain status codes
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

        // Check for common business logic errors
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

    // Generic error response
    return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
    );
}

/**
 * Wrapper for API route handlers to automatically handle errors
 */
export function withErrorHandler<T extends any[]>(
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

/**
 * Create standardized success response
 */
export function successResponse<T>(
    data: T,
    status: number = 200
): NextResponse {
    return NextResponse.json({ success: true, ...data }, { status });
}

/**
 * Create standardized error response
 */
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

