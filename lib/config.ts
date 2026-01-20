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
 * Build individual config sections (lazy validation)
 */
function buildDatabaseConfig(): Config['database'] {
    return {
        url: getRequiredEnv("DATABASE_URL"),
    };
}

function buildNextjsConfig(): Config['nextjs'] {
    const nodeEnv = (process.env.NODE_ENV || "development") as "development" | "production" | "test";
    return {
        apiUrl: getOptionalEnv("NEXT_PUBLIC_API_URL", "http://localhost:3000"),
        nodeEnv,
    };
}

function buildJwtConfig(): Config['jwt'] {
    return {
        secret: getRequiredEnv("SECRET_KEY"),
    };
}

function buildEmailConfig(): Config['email'] {
    return {
        host: getOptionalEnv("EMAIL_HOST", "smtp.gmail.com"),
        port: getNumberEnv("EMAIL_PORT", 587),
        user: getOptionalEnv("EMAIL_USER", ""),
        password: getOptionalEnv("EMAIL_PASS", ""),
        gmailUser: getRequiredEnv("GMAIL_USER"),
        gmailAppPassword: getRequiredEnv("GMAIL_APP_PASSWORD"),
    };
}

function buildCloudinaryConfig(): Config['cloudinary'] {
    return {
        cloudName: getRequiredEnv("CLOUDINARY_CLOUD_NAME"),
        apiKey: getRequiredEnv("CLOUDINARY_API_KEY"),
        apiSecret: getRequiredEnv("CLOUDINARY_API_SECRET"),
    };
}

function buildApisConfig(): Config['apis'] {
    return {
        anthropic: {
            apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
        },
        unsplash: {
            accessKey: getRequiredEnv("UNSPLASH_ACCESS_KEY"),
        },
    };
}

function buildFeaturesConfig(): Config['features'] {
    return {
        promptDebugPreview: getOptionalEnv("PROMPT_DEBUG_PREVIEW") || getOptionalEnv("NEXT_PUBLIC_PROMPT_DEBUG_PREVIEW"),
        promptDebugFull: getBooleanEnv("PROMPT_DEBUG_FULL") || getBooleanEnv("NEXT_PUBLIC_PROMPT_DEBUG_FULL") ? "true" : undefined,
    };
}

/**
 * Validate and build full configuration object (only when all config is needed)
 */
function buildConfig(): Config {
    return {
        database: buildDatabaseConfig(),
        nextjs: buildNextjsConfig(),
        jwt: buildJwtConfig(),
        email: buildEmailConfig(),
        cloudinary: buildCloudinaryConfig(),
        apis: buildApisConfig(),
        features: buildFeaturesConfig(),
    };
}

/**
 * Lazy configuration loading
 * This will only validate when config is accessed, not on module load
 */
let config: Config | null = null;

function getConfig(): Config {
    if (!config) {
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
    }
    return config;
}

/**
 * Export configuration object
 * Access config values like: config.database.url, config.jwt.secret, etc.
 */
export default new Proxy({} as Config, {
    get(_target, prop) {
        return getConfig()[prop as keyof Config];
    }
});

/**
 * Export individual config sections for convenience (lazy validation per section)
 */
let dbConfigCache: Config['database'] | null = null;
export const dbConfig = new Proxy({} as Config['database'], {
    get(_target, prop) {
        if (!dbConfigCache) {
            try {
                dbConfigCache = buildDatabaseConfig();
            } catch (error) {
                if (error instanceof Error) {
                    console.error("❌ Database Configuration Error:", error.message);
                }
                throw error;
            }
        }
        return dbConfigCache[prop as keyof Config['database']];
    }
});

let nextjsConfigCache: Config['nextjs'] | null = null;
export const nextjsConfig = new Proxy({} as Config['nextjs'], {
    get(_target, prop) {
        if (!nextjsConfigCache) {
            try {
                nextjsConfigCache = buildNextjsConfig();
            } catch (error) {
                if (error instanceof Error) {
                    console.error("❌ Next.js Configuration Error:", error.message);
                }
                throw error;
            }
        }
        return nextjsConfigCache[prop as keyof Config['nextjs']];
    }
});

let jwtConfigCache: Config['jwt'] | null = null;
export const jwtConfig = new Proxy({} as Config['jwt'], {
    get(_target, prop) {
        if (!jwtConfigCache) {
            try {
                jwtConfigCache = buildJwtConfig();
            } catch (error) {
                if (error instanceof Error) {
                    console.error("❌ JWT Configuration Error:", error.message);
                }
                throw error;
            }
        }
        return jwtConfigCache[prop as keyof Config['jwt']];
    }
});

let emailConfigCache: Config['email'] | null = null;
export const emailConfig = new Proxy({} as Config['email'], {
    get(_target, prop) {
        if (!emailConfigCache) {
            try {
                emailConfigCache = buildEmailConfig();
            } catch (error) {
                if (error instanceof Error) {
                    console.error("❌ Email Configuration Error:", error.message);
                }
                throw error;
            }
        }
        return emailConfigCache[prop as keyof Config['email']];
    }
});

let cloudinaryConfigCache: Config['cloudinary'] | null = null;
export const cloudinaryConfig = new Proxy({} as Config['cloudinary'], {
    get(_target, prop) {
        if (!cloudinaryConfigCache) {
            try {
                cloudinaryConfigCache = buildCloudinaryConfig();
            } catch (error) {
                if (error instanceof Error) {
                    console.error("❌ Cloudinary Configuration Error:", error.message);
                }
                throw error;
            }
        }
        return cloudinaryConfigCache[prop as keyof Config['cloudinary']];
    }
});

let apiConfigCache: Config['apis'] | null = null;
export const apiConfig = new Proxy({} as Config['apis'], {
    get(_target, prop) {
        if (!apiConfigCache) {
            try {
                apiConfigCache = buildApisConfig();
            } catch (error) {
                if (error instanceof Error) {
                    console.error("❌ API Configuration Error:", error.message);
                }
                throw error;
            }
        }
        return apiConfigCache[prop as keyof Config['apis']];
    }
});

let featureConfigCache: Config['features'] | null = null;
export const featureConfig = new Proxy({} as Config['features'], {
    get(_target, prop) {
        if (!featureConfigCache) {
            featureConfigCache = buildFeaturesConfig();
        }
        return featureConfigCache[prop as keyof Config['features']];
    }
});

/**
 * Helper function to check if running in development
 */
export const isDevelopment = (): boolean => {
    if (!nextjsConfigCache) {
        nextjsConfigCache = buildNextjsConfig();
    }
    return nextjsConfigCache.nodeEnv === "development";
};

/**
 * Helper function to check if running in production
 */
export const isProduction = (): boolean => {
    if (!nextjsConfigCache) {
        nextjsConfigCache = buildNextjsConfig();
    }
    return nextjsConfigCache.nodeEnv === "production";
};

/**
 * Helper function to check if running in test
 */
export const isTest = (): boolean => {
    if (!nextjsConfigCache) {
        nextjsConfigCache = buildNextjsConfig();
    }
    return nextjsConfigCache.nodeEnv === "test";
};

