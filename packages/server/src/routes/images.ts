import { NextResponse } from "next/server";

export type UploadImageFn = (buffer: Buffer, fileName: string) => Promise<string>;

export type UploadImageFromUrlFn = (
    imageUrl: string,
    fileName?: string
) => Promise<string>;

export type SearchImagesFn = (query: string, count: number) => Promise<unknown[]>;

/** Legacy `/api/upload` — form field `image`, response `{ url }`. */
export function createLegacyImageFieldUploadRoute(deps: { uploadImage: UploadImageFn }) {
    const { uploadImage } = deps;

    async function POST(req: Request) {
        try {
            const formData = await req.formData();
            const file = formData.get("image") as File | null;

            if (!file) {
                return NextResponse.json({ error: "No file" }, { status: 400 });
            }

            if (!file.type.startsWith("image/")) {
                return NextResponse.json(
                    { error: "File must be an image" },
                    { status: 400 }
                );
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const imageUrl = await uploadImage(buffer, file.name);

            return NextResponse.json({ url: imageUrl });
        } catch (error) {
            console.error("Error uploading image:", error);
            return NextResponse.json(
                {
                    error:
                        error instanceof Error ? error.message : "Failed to upload image",
                },
                { status: 500 }
            );
        }
    }

    return { POST };
}

export interface MultipartImageUploadRouteDeps {
    uploadImage: UploadImageFn;
    /** Default 10MB */
    maxBytes?: number;
}

/** `/api/images/upload-file` — form field `file`, rich success payload. */
export function createMultipartImageUploadRoute(deps: MultipartImageUploadRouteDeps) {
    const { uploadImage, maxBytes = 10 * 1024 * 1024 } = deps;

    async function POST(req: Request) {
        try {
            const formData = await req.formData();
            const file = formData.get("file") as File | null;

            if (!file) {
                return NextResponse.json(
                    { success: false, error: "No file provided" },
                    { status: 400 }
                );
            }

            if (!file.type.startsWith("image/")) {
                return NextResponse.json(
                    { success: false, error: "File must be an image" },
                    { status: 400 }
                );
            }

            if (file.size > maxBytes) {
                const mb = Math.round(maxBytes / (1024 * 1024));
                return NextResponse.json(
                    {
                        success: false,
                        error: `File size must be less than ${mb}MB`,
                    },
                    { status: 400 }
                );
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const cloudinaryUrl = await uploadImage(buffer, file.name);

            return NextResponse.json({
                success: true,
                imageUrl: cloudinaryUrl,
                fileName: file.name,
                fileSize: file.size,
            });
        } catch (error) {
            console.error("Error uploading image file:", error);
            return NextResponse.json(
                {
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to upload image file",
                },
                { status: 500 }
            );
        }
    }

    return { POST };
}

/** `/api/images/upload-url` — JSON body with `imageUrl`, optional `fileName`. */
export function createImageFromUrlUploadRoute(deps: {
    uploadImageFromUrl: UploadImageFromUrlFn;
}) {
    const { uploadImageFromUrl } = deps;

    async function POST(req: Request) {
        try {
            const body = await req.json();
            const { imageUrl, fileName } = body;

            if (!imageUrl) {
                return NextResponse.json(
                    { success: false, error: "imageUrl is required" },
                    { status: 400 }
                );
            }

            try {
                new URL(imageUrl);
            } catch {
                return NextResponse.json(
                    { success: false, error: "Invalid URL format" },
                    { status: 400 }
                );
            }

            const cloudinaryUrl = await uploadImageFromUrl(imageUrl, fileName);

            return NextResponse.json({
                success: true,
                imageUrl: cloudinaryUrl,
            });
        } catch (error) {
            console.error("Error uploading image from URL:", error);
            return NextResponse.json(
                {
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to upload image from URL",
                },
                { status: 500 }
            );
        }
    }

    return { POST };
}

/** `/api/images/search-unsplash` — JSON `{ query, count? }`. */
export function createUnsplashSearchRoute(deps: { searchImages: SearchImagesFn }) {
    const { searchImages } = deps;

    async function POST(req: Request) {
        try {
            const body = await req.json();
            const { query, count = 10 } = body;

            if (!query || typeof query !== "string" || query.trim().length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Query is required and must be a non-empty string",
                    },
                    { status: 400 }
                );
            }

            const imageCount = Math.min(Math.max(1, parseInt(String(count), 10) || 10), 30);

            const images = await searchImages(query.trim(), imageCount);

            return NextResponse.json({
                success: true,
                images,
            });
        } catch (error) {
            console.error("Error searching Unsplash:", error);

            if (error instanceof Error) {
                if (error.message.includes("UNSPLASH_ACCESS_KEY")) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Unsplash API key not configured",
                        },
                        { status: 500 }
                    );
                }
                if (error.message.includes("rate limit")) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Unsplash rate limit reached. Please try again later.",
                        },
                        { status: 429 }
                    );
                }
                if (error.message.includes("Invalid")) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: "Invalid Unsplash API configuration",
                        },
                        { status: 500 }
                    );
                }
            }

            return NextResponse.json(
                {
                    success: false,
                    error:
                        error instanceof Error
                            ? error.message
                            : "Failed to search Unsplash images",
                },
                { status: 500 }
            );
        }
    }

    return { POST };
}
