/**
 * Prompt Builder System
 * Converts form data into Claude API prompts for AI content generation
 */

// JSON Schema for Claude Response
export interface AIArticleResponse {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    faqs: Array<{
        question: string;
        answer: string;
        order: number;
    }>;
    tags: string[];
    imageSuggestions: Array<{
        placement: string;
        searchQuery: string;
        altText: string;
    }>;
    internalLinks: Array<{
        anchorText: string;
        suggestedArticle: string;
    }>;
    suggestedClusterTopics?: string[]; // Only for pillar pages
}

// Form Data Interface
export interface GenerationFormData {
    contentType: 'standalone' | 'pillar' | 'cluster';
    articleFormat: string;
    writingTone: string;
    targetAudience: string;
    wordCount: string;
    includeImages?: boolean;
    generateHeroImage?: boolean;
    primaryKeyword?: string;
    secondaryKeywords?: string;
    includeFAQ?: boolean;
    includeComparisonTable?: boolean;
    includeProsCons?: boolean;
    topic?: string;
    pillarTopic?: string;
    autoSuggestClusters?: boolean;
    selectedPillarId?: string;
    clusterTopicMode?: 'ai-suggest' | 'custom';
    customClusterTopics?: string[];
    numberOfClusters?: number;
}

// Article Format Templates
const articleFormats: Record<string, { template: string; description: string }> = {
    'complete-guide': {
        template: 'Create a comprehensive, in-depth guide that covers all aspects of {topic}. Provide a thorough overview, detailed information, practical tips, and actionable advice. Structure the content logically with clear sections and subsections.',
        description: 'Comprehensive overview covering all aspects'
    },
    'cost-breakdown': {
        template: 'Create a detailed budget and cost breakdown article about {topic}. Include specific pricing information, cost comparisons, budget-friendly alternatives, and money-saving tips. Organize costs by category and provide realistic budget ranges.',
        description: 'Budget/pricing focus with detailed cost analysis'
    },
    'comparison-guide': {
        template: 'Create a detailed comparison guide for {topic}. Compare different options, products, destinations, or approaches side-by-side. Include pros and cons, use cases, and recommendations for different scenarios.',
        description: 'Side-by-side comparison of multiple options'
    },
    'top-list': {
        template: 'Create a curated list article highlighting the best or top {topic}. Use a numbered or ranked format, providing detailed descriptions, key features, and compelling reasons for each selection. Include practical information and actionable insights.',
        description: 'Ranked or numbered list of best options'
    },
    'how-to': {
        template: 'Create a step-by-step how-to guide for {topic}. Provide clear, actionable instructions organized in a logical sequence. Include prerequisites, tools needed, detailed steps, tips, and common pitfalls to avoid.',
        description: 'Step-by-step instructional guide'
    },
    'itinerary': {
        template: 'Create a detailed day-by-day itinerary for {topic}. Organize activities, recommendations, and information chronologically. Include timing, locations, practical tips, and alternative options for flexibility.',
        description: 'Day-by-day travel or activity plan'
    },
    'safety-guide': {
        template: 'Create a comprehensive safety guide for {topic}. Cover potential risks, safety precautions, emergency procedures, cultural considerations, and best practices. Prioritize practical safety information and actionable advice.',
        description: 'Safety tips and precautions focused guide'
    },
};

// Tone Modifiers
const tones: Record<string, { modifier: string; description: string }> = {
    'professional': {
        modifier: 'Write in a professional, authoritative tone. Use formal language, data-driven insights, and expert perspectives. Maintain objectivity and credibility throughout.',
        description: 'Formal, authoritative, data-driven'
    },
    'friendly': {
        modifier: 'Write in a warm, friendly, and conversational tone. Use approachable language, personal anecdotes when appropriate, and create a sense of connection with the reader.',
        description: 'Warm, conversational, approachable'
    },
    'enthusiastic': {
        modifier: 'Write with energy and enthusiasm. Use exciting language, vivid descriptions, and convey passion and excitement about the topic. Make the content engaging and inspiring.',
        description: 'Energetic, exciting, inspiring'
    },
    'educational': {
        modifier: 'Write in an educational, informative tone. Focus on teaching and explanation. Use clear definitions, examples, and structured information that helps readers learn effectively.',
        description: 'Informative, instructional, clear'
    },
    'budget-focused': {
        modifier: 'Write with a focus on value and affordability. Emphasize budget-friendly options, cost-saving tips, and practical financial advice. Use language that resonates with budget-conscious travelers.',
        description: 'Value-focused, cost-conscious, practical'
    },
    'luxury': {
        modifier: 'Write with elegance and sophistication. Emphasize premium experiences, high-quality options, and refined details. Use refined language that appeals to luxury travelers seeking the best.',
        description: 'Elegant, premium, sophisticated'
    },
};

// Audience Modifiers
const audiences: Record<string, { modifier: string; description: string }> = {
    'first-time-travelers': {
        modifier: 'Tailor content for first-time travelers who need comprehensive guidance, explanations of basics, and reassurance. Include foundational information, common questions, and beginner-friendly tips.',
        description: 'Comprehensive guidance for beginners'
    },
    'budget-backpackers': {
        modifier: 'Tailor content for budget-conscious backpackers. Focus on affordable options, money-saving strategies, hostel recommendations, and tips for traveling on a shoestring budget.',
        description: 'Budget-friendly advice for backpackers'
    },
    'luxury-travelers': {
        modifier: 'Tailor content for luxury travelers seeking premium experiences. Focus on high-end accommodations, exclusive activities, fine dining, and sophisticated travel options.',
        description: 'Premium experiences for luxury seekers'
    },
    'families': {
        modifier: 'Tailor content for families with children. Include family-friendly activities, safety considerations, kid-appropriate recommendations, and practical tips for traveling with children.',
        description: 'Family-friendly advice and recommendations'
    },
    'solo-travelers': {
        modifier: 'Tailor content for solo travelers. Address safety concerns, solo-friendly activities, meeting other travelers, and tips for enjoying solo travel experiences.',
        description: 'Solo travel-focused guidance'
    },
    'couples': {
        modifier: 'Tailor content for couples and honeymooners. Focus on romantic experiences, couple-friendly activities, intimate settings, and special occasion recommendations.',
        description: 'Romantic experiences for couples'
    },
    'adventure-seekers': {
        modifier: 'Tailor content for adventure seekers. Focus on thrilling activities, outdoor adventures, extreme sports, and adrenaline-pumping experiences.',
        description: 'Thrilling adventures and outdoor activities'
    },
    'digital-nomads': {
        modifier: 'Tailor content for digital nomads. Include co-working spaces, reliable WiFi information, long-term stay options, and tips for working while traveling.',
        description: 'Work-friendly destinations and amenities'
    },
};

// Word Count Ranges
const wordCountRanges: Record<string, { min: number; max: number; description: string }> = {
    'short': { min: 800, max: 1200, description: '800-1200 words' },
    'medium': { min: 1500, max: 2000, description: '1500-2000 words' },
    'long': { min: 2500, max: 3500, description: '2500-3500 words' },
    'comprehensive': { min: 4000, max: 5000, description: '4000-5000 words' },
};

/**
 * Get JSON Schema string for Claude response format
 */
function getJSONSchema(): string {
    return `You must respond with valid JSON matching this exact structure:

{
  "title": "string - The main title of the article",
  "slug": "string - URL-friendly slug derived from title (lowercase, hyphens, no special chars)",
  "content": "string - Full HTML content of the article with proper formatting",
  "excerpt": "string - Short summary (100-150 words) for previews",
  "description": "string - Meta description (150-160 characters) for SEO",
  "metaTitle": "string - SEO meta title (50-60 characters)",
  "metaDescription": "string - SEO meta description (150-160 characters)",
  "focusKeyword": "string - Primary SEO keyword",
  "faqs": [
    {
      "question": "string - FAQ question",
      "answer": "string - FAQ answer",
      "order": "number - Display order (1, 2, 3...)"
    }
  ],
  "tags": ["string - Array of relevant tags"],
  "imageSuggestions": [
    {
      "placement": "string - Where to place image (e.g., 'after introduction', 'section 2')",
      "searchQuery": "string - Search query for finding image",
      "altText": "string - Descriptive alt text for accessibility"
    }
  ],
  "internalLinks": [
    {
      "anchorText": "string - Text that should be linked",
      "suggestedArticle": "string - Suggested related article topic"
    }
  ],
  "suggestedClusterTopics": ["string - Optional: Array of suggested cluster article topics for pillar pages"]
}

Important formatting requirements:
- Content must be valid HTML with proper structure
- Use <h2> for main sections, <h3> for subsections
- Include <p> tags for paragraphs
- Use <ul> and <ol> for lists
- Include <strong> and <em> for emphasis where appropriate
- Image suggestions should indicate placement locations in the content
- Internal links should suggest related topics that could link to other articles
- FAQs should be ordered and cover common questions about the topic`;
}

/**
 * Build prompt for Standalone Article
 */
export function buildStandalonePrompt(formData: GenerationFormData): string {
    const { topic, articleFormat, writingTone, targetAudience, wordCount, primaryKeyword, secondaryKeywords, includeFAQ, includeComparisonTable, includeProsCons, includeImages } = formData;

    if (!topic) {
        throw new Error('Topic is required for standalone articles');
    }

    const format = articleFormats[articleFormat] || articleFormats['complete-guide'];
    const tone = tones[writingTone] || tones['friendly'];
    const audience = audiences[targetAudience] || audiences['first-time-travelers'];
    const wordRange = wordCountRanges[wordCount] || wordCountRanges['medium'];

    let prompt = `You are an expert travel content writer. Create a high-quality ${format.description} article about "${topic}".

ARTICLE REQUIREMENTS:
${format.template.replace('{topic}', topic)}

WRITING STYLE:
${tone.modifier}

TARGET AUDIENCE:
${audience.modifier}

CONTENT SPECIFICATIONS:
- Word count: ${wordRange.description} (aim for ${wordRange.min}-${wordRange.max} words)
- Format: ${format.description}
`;

    if (primaryKeyword) {
        prompt += `- Primary SEO keyword: "${primaryKeyword}"\n`;
        if (secondaryKeywords) {
            const keywords = secondaryKeywords.split(',').map(k => k.trim()).filter(k => k);
            prompt += `- Secondary keywords: ${keywords.join(', ')}\n`;
        }
    }

    if (includeImages) {
        prompt += `- Include image suggestions: Place images every 400 words approximately\n`;
    }

    prompt += `\nSTRUCTURAL REQUIREMENTS:\n`;
    prompt += `- Start with an engaging introduction that hooks the reader\n`;
    prompt += `- Use clear headings (H2) for main sections\n`;
    prompt += `- Use subheadings (H3) for subsections\n`;
    prompt += `- Include practical, actionable information\n`;
    prompt += `- End with a compelling conclusion\n`;

    if (includeFAQ) {
        prompt += `- Include a FAQ section with 5-8 relevant questions and detailed answers\n`;
    }

    if (includeComparisonTable) {
        prompt += `- Include a comparison table comparing different options/alternatives\n`;
    }

    if (includeProsCons) {
        prompt += `- Include pros and cons lists where relevant\n`;
    }

    prompt += `\nSEO OPTIMIZATION:\n`;
    prompt += `- Optimize content for search engines while maintaining natural readability\n`;
    prompt += `- Include primary keyword naturally throughout the content\n`;
    prompt += `- Create compelling meta title and description\n`;
    prompt += `- Ensure proper heading hierarchy for SEO\n`;

    prompt += `\n${getJSONSchema()}`;

    return prompt;
}

/**
 * Build prompt for Pillar Page
 */
export function buildPillarPrompt(formData: GenerationFormData): string {
    const { pillarTopic, articleFormat, writingTone, targetAudience, wordCount, primaryKeyword, secondaryKeywords, includeFAQ, includeComparisonTable, includeProsCons, includeImages, autoSuggestClusters } = formData;

    if (!pillarTopic) {
        throw new Error('Pillar topic is required for pillar pages');
    }

    const format = articleFormats[articleFormat] || articleFormats['complete-guide'];
    const tone = tones[writingTone] || tones['friendly'];
    const audience = audiences[targetAudience] || audiences['first-time-travelers'];
    const wordRange = wordCountRanges[wordCount] || wordCountRanges['medium'];

    let prompt = `You are an expert travel content writer. Create a comprehensive pillar page article about "${pillarTopic}".

PILLAR PAGE REQUIREMENTS:
A pillar page is a comprehensive, authoritative article that serves as the main hub for a topic. It should provide a thorough overview and link to more specific cluster articles.

${format.template.replace('{topic}', pillarTopic)}

WRITING STYLE:
${tone.modifier}

TARGET AUDIENCE:
${audience.modifier}

CONTENT SPECIFICATIONS:
- Word count: ${wordRange.description} (aim for ${wordRange.min}-${wordRange.max} words)
- Format: ${format.description}
- This is a pillar page, so it should be comprehensive and authoritative
`;

    if (primaryKeyword) {
        prompt += `- Primary SEO keyword: "${pillarTopic}"\n`;
        if (secondaryKeywords) {
            const keywords = secondaryKeywords.split(',').map(k => k.trim()).filter(k => k);
            prompt += `- Secondary keywords: ${keywords.join(', ')}\n`;
        }
    }

    if (includeImages) {
        prompt += `- Include image suggestions: Place images every 400 words approximately\n`;
    }

    prompt += `\nSTRUCTURAL REQUIREMENTS:\n`;
    prompt += `- Start with a compelling introduction that establishes authority on the topic\n`;
    prompt += `- Provide comprehensive coverage of the main topic\n`;
    prompt += `- Use clear headings (H2) for main sections\n`;
    prompt += `- Use subheadings (H3) for subsections\n`;
    prompt += `- Include practical, actionable information\n`;
    prompt += `- Mention related topics that could be covered in cluster articles\n`;
    prompt += `- End with a conclusion that ties everything together\n`;

    if (includeFAQ) {
        prompt += `- Include a FAQ section with 8-10 relevant questions and detailed answers\n`;
    }

    if (includeComparisonTable) {
        prompt += `- Include comparison tables where relevant\n`;
    }

    if (includeProsCons) {
        prompt += `- Include pros and cons lists where relevant\n`;
    }

    prompt += `\nPILLAR PAGE SPECIFIC:\n`;
    prompt += `- Write content that can serve as the foundation for a content hub\n`;
    prompt += `- Create content that naturally leads to more specific cluster articles\n`;
    prompt += `- Ensure the content is comprehensive enough to stand alone while inviting deeper dives\n`;

    if (autoSuggestClusters) {
        prompt += `- Suggest 8-10 related cluster topics that would expand on specific aspects of this pillar topic\n`;
        prompt += `- Include these suggestions in the "suggestedClusterTopics" field in your JSON response\n`;
    }

    prompt += `\nSEO OPTIMIZATION:\n`;
    prompt += `- Optimize for the main pillar topic keyword\n`;
    prompt += `- Create compelling meta title and description\n`;
    prompt += `- Ensure proper heading hierarchy\n`;

    prompt += `\n${getJSONSchema()}`;

    return prompt;
}

/**
 * Build prompt for Cluster Article
 */
export function buildClusterPrompt(formData: GenerationFormData, pillarContent?: string, pillarTitle?: string): string {
    const { customClusterTopics, numberOfClusters, clusterTopicMode, articleFormat, writingTone, targetAudience, wordCount, primaryKeyword, secondaryKeywords, includeFAQ, includeComparisonTable, includeProsCons, includeImages } = formData;

    let clusterTopic = '';
    if (clusterTopicMode === 'custom' && customClusterTopics && customClusterTopics.length > 0) {
        // For now, we'll generate one cluster at a time, so use the first topic
        clusterTopic = customClusterTopics[0];
    } else {
        throw new Error('Cluster topic is required. For AI-suggested topics, specify which topic to generate.');
    }

    if (!clusterTopic || clusterTopic.trim().length < 3) {
        throw new Error('Valid cluster topic is required');
    }

    const format = articleFormats[articleFormat] || articleFormats['complete-guide'];
    const tone = tones[writingTone] || tones['friendly'];
    const audience = audiences[targetAudience] || audiences['first-time-travelers'];
    const wordRange = wordCountRanges[wordCount] || wordCountRanges['medium'];

    let prompt = `You are an expert travel content writer. Create a focused cluster article about "${clusterTopic}".

CLUSTER ARTICLE REQUIREMENTS:
A cluster article is a detailed, specific article that expands on a particular aspect of a larger pillar topic. This cluster article should focus specifically on "${clusterTopic}".
`;

    if (pillarTitle && pillarContent) {
        prompt += `\nPILLAR PAGE CONTEXT:\n`;
        prompt += `This article is part of a content hub centered around: "${pillarTitle}"\n\n`;
        prompt += `Pillar page overview:\n${pillarContent.substring(0, 1000)}...\n\n`;
        prompt += `IMPORTANT: Do not duplicate content from the pillar page. Focus on the specific aspect "${clusterTopic}" in detail. Reference the pillar page naturally but provide new, detailed information.\n`;
    }

    prompt += `\n${format.template.replace('{topic}', clusterTopic)}\n\n`;

    prompt += `WRITING STYLE:\n${tone.modifier}\n\n`;
    prompt += `TARGET AUDIENCE:\n${audience.modifier}\n\n`;

    prompt += `CONTENT SPECIFICATIONS:\n`;
    prompt += `- Word count: ${wordRange.description} (aim for ${wordRange.min}-${wordRange.max} words)\n`;
    prompt += `- Format: ${format.description}\n`;
    prompt += `- This is a cluster article, so it should be focused and detailed on the specific topic\n`;

    if (primaryKeyword) {
        prompt += `- Primary SEO keyword: "${clusterTopic}"\n`;
        if (secondaryKeywords) {
            const keywords = secondaryKeywords.split(',').map(k => k.trim()).filter(k => k);
            prompt += `- Secondary keywords: ${keywords.join(', ')}\n`;
        }
    }

    if (includeImages) {
        prompt += `- Include image suggestions: Place images every 400 words approximately\n`;
    }

    prompt += `\nSTRUCTURAL REQUIREMENTS:\n`;
    prompt += `- Start with an introduction that connects to the pillar topic but focuses on the specific cluster topic\n`;
    if (pillarTitle) {
        prompt += `- Include a reference to the main pillar page ("Part of: ${pillarTitle}" or similar)\n`;
    }
    prompt += `- Use clear headings (H2) for main sections\n`;
    prompt += `- Use subheadings (H3) for subsections\n`;
    prompt += `- Provide detailed, specific information about "${clusterTopic}"\n`;
    prompt += `- Include practical, actionable tips\n`;
    prompt += `- End with a conclusion that ties back to the broader topic\n`;

    if (includeFAQ) {
        prompt += `- Include a FAQ section with 5-7 questions specific to "${clusterTopic}"\n`;
    }

    if (includeComparisonTable) {
        prompt += `- Include comparison tables where relevant\n`;
    }

    if (includeProsCons) {
        prompt += `- Include pros and cons lists where relevant\n`;
    }

    prompt += `\nCLUSTER ARTICLE SPECIFIC:\n`;
    prompt += `- Deep dive into the specific topic without duplicating pillar content\n`;
    prompt += `- Provide more detailed, actionable information than the pillar page\n`;
    prompt += `- Include internal links back to the pillar page and related cluster topics\n`;

    prompt += `\nSEO OPTIMIZATION:\n`;
    prompt += `- Optimize for the cluster topic keyword\n`;
    prompt += `- Create compelling meta title and description\n`;
    prompt += `- Ensure proper heading hierarchy\n`;

    prompt += `\n${getJSONSchema()}`;

    return prompt;
}

/**
 * Main function to build prompt based on content type
 */
export function buildPrompt(formData: GenerationFormData, pillarContent?: string, pillarTitle?: string): string {
    switch (formData.contentType) {
        case 'standalone':
            return buildStandalonePrompt(formData);
        case 'pillar':
            return buildPillarPrompt(formData);
        case 'cluster':
            return buildClusterPrompt(formData, pillarContent, pillarTitle);
        default:
            throw new Error(`Unknown content type: ${formData.contentType}`);
    }
}

