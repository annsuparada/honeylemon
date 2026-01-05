import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { GenerationFormData } from "@/utils/promptBuilder";
import { generateArticle } from "@/lib/claude";
import prisma from "@/prisma/client";

export const dynamic = 'force-dynamic';

/**
 * Validate environment variables required for AI generation
 */
function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
    const required = [
        'ANTHROPIC_API_KEY',
        // Note: UNSPLASH_ACCESS_KEY and CLOUDINARY_* will be validated when needed
    ];

    const missing: string[] = [];
    for (const key of required) {
        if (!process.env[key]) {
            missing.push(key);
        }
    }

    return {
        valid: missing.length === 0,
        missing,
    };
}

/**
 * POST /api/ai-generate
 * Generate AI content based on form data
 * 
 * Request body: GenerationFormData
 * Response: { success: boolean, prompt?: string, error?: string }
 */
export async function POST(req: Request) {
    try {
        // Authentication check
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized - No Token Provided" },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Validate environment variables
        const envCheck = validateEnvironmentVariables();
        if (!envCheck.valid) {
            return NextResponse.json(
                {
                    error: "API configuration error",
                    message: `Missing required environment variables: ${envCheck.missing.join(', ')}`,
                },
                { status: 500 }
            );
        }

        // Parse and validate request body
        let body: GenerationFormData;
        try {
            body = await req.json();
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid request data - JSON parsing failed" },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!body.contentType) {
            return NextResponse.json(
                { error: "Invalid request data - contentType is required" },
                { status: 400 }
            );
        }

        if (!['standalone', 'pillar', 'cluster'].includes(body.contentType)) {
            return NextResponse.json(
                { error: "Invalid request data - contentType must be 'standalone', 'pillar', or 'cluster'" },
                { status: 400 }
            );
        }

        // Validate contentType-specific requirements
        if (body.contentType === 'standalone' && !body.topic) {
            return NextResponse.json(
                { error: "Invalid request data - topic is required for standalone articles" },
                { status: 400 }
            );
        }

        if (body.contentType === 'pillar' && !body.pillarTopic) {
            return NextResponse.json(
                { error: "Invalid request data - pillarTopic is required for pillar pages" },
                { status: 400 }
            );
        }

        if (body.contentType === 'cluster') {
            if (!body.selectedPillarId) {
                return NextResponse.json(
                    { error: "Invalid request data - selectedPillarId is required for cluster articles" },
                    { status: 400 }
                );
            }
            if (body.clusterTopicMode === 'custom' && (!body.customClusterTopics || body.customClusterTopics.length === 0)) {
                return NextResponse.json(
                    { error: "Invalid request data - customClusterTopics is required when clusterTopicMode is 'custom'" },
                    { status: 400 }
                );
            }
        }

        // Fetch pillar content if needed for cluster articles
        let pillarContent: string | undefined;
        let pillarTitle: string | undefined;

        if (body.contentType === 'cluster' && body.selectedPillarId) {
            const pillar = await prisma.post.findFirst({
                where: {
                    id: body.selectedPillarId,
                    pillarPage: true,
                },
                select: {
                    title: true,
                    content: true,
                },
            });

            if (pillar) {
                pillarContent = pillar.content;
                pillarTitle = pillar.title;
            }
        }

        // Generate article using Claude API
        try {
            const articleResponse = await generateArticle(body, pillarContent, pillarTitle);

            // Handle images if requested
            let heroImageUrl: string | undefined;
            let finalContent = articleResponse.content;

            if (body.generateHeroImage || body.includeImages) {
                try {
                    const { searchImagesForSuggestions, getHeroImage } = await import('@/lib/unsplash');
                    const { calculateImagePlacements, insertImagesIntoContent, uploadImagesToCloudinary, separateHeroImage } = await import('@/utils/contentAssembler');

                    // Get hero image if requested
                    if (body.generateHeroImage) {
                        const heroQuery = body.topic || body.pillarTopic || articleResponse.title;
                        const heroImage = await getHeroImage(heroQuery);
                        if (heroImage) {
                            // Upload hero image to Cloudinary
                            const { uploadImageFromUrl } = await import('@/app/lip/uploadToCloudinary');
                            heroImageUrl = await uploadImageFromUrl(heroImage.url, `hero-${Date.now()}`);
                        }
                    }

                    // Handle content images if requested
                    if (body.includeImages && articleResponse.imageSuggestions && articleResponse.imageSuggestions.length > 0) {
                        // Search for images based on suggestions
                        const unsplashImages = await searchImagesForSuggestions(articleResponse.imageSuggestions);
                        
                        // Separate hero from content images (if hero wasn't already generated)
                        const { heroImage: separatedHero, contentImages } = separateHeroImage(unsplashImages);

                        // Calculate placements
                        const placements = calculateImagePlacements(
                            articleResponse.content,
                            contentImages,
                            body.includeImages ? 400 : undefined
                        );

                        // Upload images to Cloudinary
                        const userId = decoded.id;
                        const uploadedPlacements = await uploadImagesToCloudinary(placements, userId);

                        // Insert images into content
                        finalContent = insertImagesIntoContent(articleResponse.content, uploadedPlacements);
                    }
                } catch (imageError) {
                    console.error('Error processing images:', imageError);
                    // Continue without images if image processing fails
                }
            }

            return NextResponse.json(
                {
                    success: true,
                    article: {
                        ...articleResponse,
                        content: finalContent,
                    },
                    heroImageUrl,
                },
                { status: 200 }
            );
        } catch (error) {
            // Error handling is done in generateArticle, but we catch here to format response
            if (error instanceof Error) {
                // Handle specific error messages
                if (error.message.includes('Rate limit')) {
                    return NextResponse.json(
                        { error: error.message },
                        { status: 429 }
                    );
                }
                if (error.message.includes('API key') || error.message.includes('configuration')) {
                    return NextResponse.json(
                        { error: error.message },
                        { status: 500 }
                    );
                }
                if (error.message.includes('parse') || error.message.includes('missing required field')) {
                    return NextResponse.json(
                        { error: `Content generation failed: ${error.message}` },
                        { status: 500 }
                    );
                }
            }

            // Re-throw to be caught by outer catch
            throw error;
        }

    } catch (error) {
        console.error("Error in AI generation API:", error);
        
        // Handle specific error types
        if (error instanceof Error) {
            // Network or API errors
            if (error.message.includes('fetch') || error.message.includes('network')) {
                return NextResponse.json(
                    { error: "Network error - Please check your connection and try again" },
                    { status: 503 }
                );
            }
            
            // Rate limit errors (will be handled in Phase 6)
            if (error.message.includes('rate limit') || error.message.includes('429')) {
                return NextResponse.json(
                    { error: "Rate limit reached - Please wait a moment and try again" },
                    { status: 429 }
                );
            }
        }

        return NextResponse.json(
            { error: "Internal server error - Failed to process generation request" },
            { status: 500 }
        );
    }
}

