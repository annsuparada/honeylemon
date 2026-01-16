import Anthropic from '@anthropic-ai/sdk';
import { AIArticleResponse, GenerationFormData, buildPrompt } from '@/utils/helpers/promptBuilder';
import prisma from '@/prisma/client';

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Generate article content using Claude API
 */
export async function generateArticle(
    formData: GenerationFormData,
    pillarContent?: string,
    pillarTitle?: string
): Promise<AIArticleResponse> {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Build the prompt using promptBuilder
    const prompt = buildPrompt(formData, pillarContent, pillarTitle);

    try {
        // Call Claude API
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514', // Using Claude Sonnet 4
            max_tokens: 8192, // Max tokens for response
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7, // Balanced creativity
        });

        // Extract text content from response
        const contentBlock = message.content[0];
        if (contentBlock.type !== 'text') {
            throw new Error('Unexpected response type from Claude API');
        }

        const responseText = contentBlock.text;

        // Parse JSON response
        let articleData: AIArticleResponse;
        try {
            // Try to extract JSON from the response (Claude may wrap it in markdown code blocks)
            let jsonText = responseText.trim();
            
            // Remove markdown code blocks if present
            if (jsonText.startsWith('```json')) {
                jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
            } else if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
            }

            articleData = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('Error parsing Claude response:', parseError);
            console.error('Response text:', responseText.substring(0, 500));
            throw new Error('Failed to parse JSON response from Claude API');
        }

        // Validate response structure
        validateArticleResponse(articleData);

        return articleData;
    } catch (error) {
        // Handle API errors
        if (error instanceof Anthropic.APIError) {
            if (error.status === 429) {
                throw new Error('Rate limit reached. Please wait a moment and try again.');
            } else if (error.status === 401) {
                throw new Error('Invalid API key. Please check your ANTHROPIC_API_KEY configuration.');
            } else if (error.status === 500) {
                throw new Error('Claude API server error. Please try again later.');
            } else {
                throw new Error(`Claude API error: ${error.message}`);
            }
        }

        // Re-throw validation errors
        if (error instanceof Error && (error.message.includes('Failed to parse') || error.message.includes('missing required field'))) {
            throw error;
        }

        // Handle network/timeout errors
        if (error instanceof Error) {
            if (error.message.includes('fetch') || error.message.includes('network')) {
                throw new Error('Network error. Please check your connection and try again.');
            }
        }

        // Generic error
        console.error('Unexpected error in generateArticle:', error);
        throw new Error('An unexpected error occurred while generating content');
    }
}

/**
 * Validate that the article response has all required fields
 */
function validateArticleResponse(data: any): asserts data is AIArticleResponse {
    const requiredFields = [
        'title',
        'slug',
        'content',
        'excerpt',
        'description',
        'metaTitle',
        'metaDescription',
        'focusKeyword',
        'faqs',
        'tags',
        'imageSuggestions',
        'internalLinks',
    ];

    const missingFields: string[] = [];
    for (const field of requiredFields) {
        if (!(field in data) || data[field] === null || data[field] === undefined) {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields in Claude response: ${missingFields.join(', ')}`);
    }

    // Validate array types
    if (!Array.isArray(data.faqs)) {
        throw new Error('faqs must be an array');
    }

    if (!Array.isArray(data.tags)) {
        throw new Error('tags must be an array');
    }

    if (!Array.isArray(data.imageSuggestions)) {
        throw new Error('imageSuggestions must be an array');
    }

    if (!Array.isArray(data.internalLinks)) {
        throw new Error('internalLinks must be an array');
    }

    // Validate FAQ structure
    for (const faq of data.faqs) {
        if (!faq.question || !faq.answer || typeof faq.order !== 'number') {
            throw new Error('Invalid FAQ structure. Each FAQ must have question, answer, and order fields.');
        }
    }

    // Validate imageSuggestions structure
    for (const img of data.imageSuggestions) {
        if (!img.placement || !img.searchQuery || !img.altText) {
            throw new Error('Invalid imageSuggestion structure. Each suggestion must have placement, searchQuery, and altText fields.');
        }
    }

    // Validate internalLinks structure
    for (const link of data.internalLinks) {
        if (!link.anchorText || !link.suggestedArticle) {
            throw new Error('Invalid internalLink structure. Each link must have anchorText and suggestedArticle fields.');
        }
    }
}

/**
 * Generate cluster topic suggestions for a pillar page
 */
export async function suggestClusterTopics(pillarId: string): Promise<string[]> {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    // Fetch pillar page
    const pillar = await prisma.post.findFirst({
        where: {
            id: pillarId,
            pillarPage: true,
        },
        select: {
            id: true,
            title: true,
            content: true,
            itemListItems: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (!pillar) {
        throw new Error('Pillar page not found');
    }

    const existingTopics = pillar.itemListItems?.map(item => item.name) || [];

    const prompt = `You are an expert content strategist. Analyze the following pillar page and suggest 8-10 specific cluster article topics that would expand on different aspects of this main topic.

Pillar Page Title: ${pillar.title}

Pillar Page Content:
${pillar.content.substring(0, 2000)}...

Existing cluster topics (avoid duplicates):
${existingTopics.length > 0 ? existingTopics.join(', ') : 'None yet'}

Requirements:
- Suggest 8-10 specific, focused cluster topics
- Each topic should be a specific aspect that can be explored in detail
- Topics should not duplicate existing ones
- Return ONLY a JSON array of topic strings, like: ["Topic 1", "Topic 2", "Topic 3"]
- Do not include any explanation or markdown formatting, just the JSON array`;

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
        });

        const contentBlock = message.content[0];
        if (contentBlock.type !== 'text') {
            throw new Error('Unexpected response type from Claude API');
        }

        let jsonText = contentBlock.text.trim();
        
        // Remove markdown code blocks if present
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        const topics = JSON.parse(jsonText);

        if (!Array.isArray(topics) || topics.length === 0) {
            throw new Error('Invalid response: Expected an array of topic strings');
        }

        // Filter out existing topics
        const newTopics = topics.filter((topic: string) => {
            const normalized = topic.toLowerCase().trim();
            return !existingTopics.some(existing => existing.toLowerCase().trim() === normalized);
        });

        return newTopics.slice(0, 10); // Return max 10 topics
    } catch (error) {
        if (error instanceof Anthropic.APIError) {
            if (error.status === 429) {
                throw new Error('Rate limit reached. Please wait a moment and try again.');
            }
            throw new Error(`Claude API error: ${error.message}`);
        }
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while generating cluster suggestions');
    }
}

