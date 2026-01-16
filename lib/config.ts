/**
 * Centralized Configuration Management
 * 
 * This module provides type-safe access to environment variables
 * with validation and helpful error messages.
 */

interface Config {
    // Database
    database: {
        url: string;
    };

    // Next.js
    nextjs: {
        apiUrl: string;
        nodeEnv: "development" | "production" | "test";
    };

    // JWT
    jwt: {
        secret: string;
    };

    // Email
    email: {
        host: string;
        port: number;
        user: string;
        password: string;
        gmailUser: string;
        gmailAppPassword: string;
    };

    // Cloudinary
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };

    // External APIs
    apis: {
        anthropic: {
            apiKey: string;
        };
        unsplash: {
            accessKey: string;
        };
    };

    // Optional/Feature flags
    features: {
        promptDebugPreview?: string;
        promptDebugFull?: string;
    };
}

/**
 * Validate that a required environment variable exists
 */
function getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(
            `Missing required environment variable: ${key}. ` +
            `Please check your .env file or environment configuration.`
        );
    }
    return value;
}

/**
 * Get optional environment variable with default value
 */
function getOptionalEnv(key: string, defaultValue: string = ""): string {
    return process.env[key] || defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === "true";
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        console.warn(`Invalid number for ${key}, using default: ${defaultValue}`);
        return defaultValue;
    }
    return parsed;
}

/**
 * Validate and build configuration object
 */
function buildConfig(): Config {
    const nodeEnv = (process.env.NODE_ENV || "development") as "development" | "production" | "test";

    return {
        database: {
            url: getRequiredEnv("DATABASE_URL"),
        },
        nextjs: {
            apiUrl: getOptionalEnv("NEXT_PUBLIC_API_URL", "http://localhost:3000"),
            nodeEnv,
        },
        jwt: {
            secret: getRequiredEnv("SECRET_KEY"),
        },
        email: {
            host: getOptionalEnv("EMAIL_HOST", "smtp.gmail.com"),
            port: getNumberEnv("EMAIL_PORT", 587),
            user: getOptionalEnv("EMAIL_USER", ""),
            password: getOptionalEnv("EMAIL_PASS", ""),
            gmailUser: getRequiredEnv("GMAIL_USER"),
            gmailAppPassword: getRequiredEnv("GMAIL_APP_PASSWORD"),
        },
        cloudinary: {
            cloudName: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
            apiKey: getRequiredEnv("CLOUDINARY_API_KEY"),
            apiSecret: getRequiredEnv("CLOUDINARY_API_SECRET"),
        },
        apis: {
            anthropic: {
                apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
            },
            unsplash: {
                accessKey: getRequiredEnv("UNSPLASH_ACCESS_KEY"),
            },
        },
        features: {
            promptDebugPreview: getOptionalEnv("PROMPT_DEBUG_PREVIEW") || getOptionalEnv("NEXT_PUBLIC_PROMPT_DEBUG_PREVIEW"),
            promptDebugFull: getBooleanEnv("PROMPT_DEBUG_FULL") || getBooleanEnv("NEXT_PUBLIC_PROMPT_DEBUG_FULL") ? "true" : undefined,
        },
    };
}

/**
 * Validate configuration on module load
 * This will throw an error if required environment variables are missing
 */
let config: Config;

try {
    config = buildConfig();
} catch (error) {
    if (error instanceof Error) {
        console.error("❌ Configuration Error:", error.message);
        // In development, provide helpful guidance
        if (process.env.NODE_ENV === "development") {
            console.error("\n💡 Tip: Make sure you have a .env file in the root directory with all required variables.");
            console.error("   See README.md for the list of required environment variables.\n");
        }
    }
    throw error;
}

/**
 * Export configuration object
 * Access config values like: config.database.url, config.jwt.secret, etc.
 */
export default config;

/**
 * Export individual config sections for convenience
 */
export const dbConfig = config.database;
export const nextjsConfig = config.nextjs;
export const jwtConfig = config.jwt;
export const emailConfig = config.email;
export const cloudinaryConfig = config.cloudinary;
export const apiConfig = config.apis;
export const featureConfig = config.features;

/**
 * Helper function to check if running in development
 */
export const isDevelopment = config.nextjs.nodeEnv === "development";

/**
 * Helper function to check if running in production
 */
export const isProduction = config.nextjs.nodeEnv === "production";

/**
 * Helper function to check if running in test
 */
export const isTest = config.nextjs.nodeEnv === "test";

