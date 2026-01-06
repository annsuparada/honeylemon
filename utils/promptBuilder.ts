/**
 * Prompt Builder System - Final Version with All Improvements
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
        template: 'Write a comprehensive guide covering {topic}. Include thorough information, practical details, and actionable advice. Organize content logically with clear sections.',
        description: 'Comprehensive guide covering all aspects'
    },
    'cost-breakdown': {
        template: 'Write a detailed budget breakdown for {topic}. Include specific prices, cost comparisons, budget alternatives, and money-saving strategies. Organize by category with realistic price ranges.',
        description: 'Budget and pricing analysis'
    },
    'comparison-guide': {
        template: 'Compare different options for {topic} side-by-side. Show pros and cons, use cases, and recommendations. Help readers choose what fits their needs.',
        description: 'Direct comparison of multiple options'
    },
    'top-list': {
        template: 'Write a ranked list of the best {topic}. Use numbered format with detailed descriptions, key features, and reasons for each selection. Include practical information.',
        description: 'Ranked list of best options'
    },
    'how-to': {
        template: 'Write step-by-step instructions for {topic}. Provide clear, actionable steps in logical order. Include what you need, detailed steps, tips, and common mistakes.',
        description: 'Step-by-step instructional guide'
    },
    'itinerary': {
        template: 'Write a day-by-day itinerary for {topic}. Organize chronologically with timing, locations, practical tips, and alternatives for flexibility.',
        description: 'Day-by-day travel plan'
    },
    'safety-guide': {
        template: 'Write a safety guide for {topic}. Cover risks, precautions, emergency procedures, cultural considerations, and best practices. Focus on practical, actionable safety information.',
        description: 'Safety tips and precautions'
    },
};

// Tone Modifiers
const tones: Record<string, { modifier: string; description: string }> = {
    'professional': {
        modifier: 'Write professionally with authority. Use clear language and data when relevant. Stay objective. Don\'t be stuffy or overly formal. Just competent and credible.',
        description: 'Professional and authoritative'
    },
    'friendly': {
        modifier: 'Write like you are texting a friend who asked for advice. Short sentences. Direct answers. No fluff. Don\'t be overly helpful or explanatory. Just give the info. Use "you" but don\'t be preachy. Sound casual but not fake-casual. If something sucks, say it sucks. If it\'s good, say it\'s good. No need to explain everything.',
        description: 'Direct, casual, no-BS advice'
    },
    'enthusiastic': {
        modifier: 'Show genuine interest without overdoing it. Get excited about specific things, not everything. Don\'t use exclamation points constantly (max 3 per article). Express what makes something cool through details, not just saying "amazing" or "incredible."',
        description: 'Genuinely interested and engaged'
    },
    'educational': {
        modifier: 'Focus on teaching clearly. Use simple explanations and examples. Structure information logically. Don\'t be condescending or textbook-y. Just clear and helpful.',
        description: 'Clear and instructional'
    },
    'budget-focused': {
        modifier: 'Focus on value and saving money. Emphasize budget options, cost-saving strategies, and practical financial advice. Be honest about costs without being cheap.',
        description: 'Value-conscious and practical'
    },
    'luxury': {
        modifier: 'Write with sophistication without being pretentious. Focus on premium experiences and quality. Don\'t use flowery language. Let the quality speak through details.',
        description: 'Sophisticated and refined'
    },
};

// Audience Modifiers
const audiences: Record<string, { modifier: string; description: string }> = {
    'first-time-travelers': {
        modifier: 'Write for first-timers who need guidance. Explain basics without being condescending. Include foundational information and common questions. Don\'t assume knowledge.',
        description: 'Comprehensive guidance for beginners'
    },
    'budget-backpackers': {
        modifier: 'Write for budget travelers. Focus on affordable options, money-saving strategies, hostels, and shoestring tips. Be practical and realistic about costs.',
        description: 'Budget-friendly advice'
    },
    'luxury-travelers': {
        modifier: 'Write for luxury seekers. Focus on high-end accommodations, exclusive activities, fine dining, and premium options. Quality matters more than price.',
        description: 'Premium experiences'
    },
    'families': {
        modifier: 'Write for families with kids. Include family-friendly activities, safety considerations, kid-appropriate recommendations, and practical family travel tips.',
        description: 'Family-friendly advice'
    },
    'solo-travelers': {
        modifier: 'Write for solo travelers. Address safety, solo-friendly activities, meeting people, and enjoying travel alone. Be practical about solo-specific concerns.',
        description: 'Solo travel guidance'
    },
    'couples': {
        modifier: 'Write for couples and honeymooners. Focus on romantic experiences, couple activities, intimate settings, and special occasion recommendations.',
        description: 'Romantic experiences'
    },
    'adventure-seekers': {
        modifier: 'Write for adventure lovers. Focus on thrilling activities, outdoor adventures, physical challenges, and adrenaline experiences.',
        description: 'Adventure and outdoor activities'
    },
    'digital-nomads': {
        modifier: 'Write for digital nomads. Include co-working spaces, WiFi reliability, long-term stays, and working-while-traveling tips.',
        description: 'Work-travel balance'
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
 * Get comprehensive anti-AI instructions
 */
function getAntiAIInstructions(): string {
    return `
🚨 CRITICAL - WRITE LIKE A HUMAN, NOT AI:

BANNED OPENING PATTERNS (never start sections/paragraphs with these):
❌ "Let me tell you something about..."
❌ "Here's the thing about..."
❌ "Here's the secret"
❌ "Here's what most people don't know..."
❌ "I know what you're thinking..."
❌ "You've probably heard that..."
❌ "Trust me on this one..."
❌ "I know, I know..." (don't assume reader's thoughts)
❌ "Pro tip from someone who..."
❌ "Fair warning" (just state the warning)
❌ "Look," or "Listen," at paragraph starts
❌ "The thing is..."
❌ "What you need to know is..."

FORBIDDEN WORDS & PHRASES:
❌ "delve," "navigate" (metaphorically), "landscape" (metaphorically)
❌ "robust," "seamless," "leverage," "harness"
❌ "it's worth noting," "one key aspect," "when it comes to"
❌ "in today's digital age," "game-changer," "revolutionary"
❌ "pure [adjective]" (e.g., "pure magic," "pure bliss," "pure poetry")
❌ Overusing "however," "moreover," "furthermore," "additionally"
❌ "stunning," "breathtaking," "vibrant" (use sparingly, not in every paragraph)

FORBIDDEN PUNCTUATION PATTERNS:
❌ NEVER use em dashes (—) EVER. They're banned. Use periods or commas instead.
❌ Don't use colons (:) in body paragraphs. Use periods.
❌ Avoid semicolons (;) completely. Use periods.
❌ Don't create bullet lists everywhere. Write flowing paragraphs.
❌ Don't overformat with bold/italics. Use sparingly for emphasis only.
❌ Use simple periods and commas. That's it. No fancy punctuation.

STRUCTURAL VARIETY REQUIRED:
Each major section MUST have different opening style:
- Section 1: Start with direct statement or fact
- Section 2: Start with brief question
- Section 3: Start with specific example or detail
- Section 4: Start with contrarian opinion
- Section 5: Start with comparison
DO NOT use same formula for every section (intro → details → tip → warning)
DO NOT follow predictable patterns throughout article
Mix paragraph lengths (some 2 sentences, some 5 sentences)

HEADING REQUIREMENTS (CRITICAL):
- Use H2 for main sections (5-8 per article)
- MUST use H3 subheadings within longer sections (minimum 3-5 H3s total)
- H3s break up content and add structure
- Don't just use H2 headings. Readers need H3s for scannable content
- Example structure: H2 "Getting Around" → H3 "Subway Basics", H3 "Walking Tips", H3 "Taxi Options"

VOICE AUTHENTICITY:
If claiming expertise or local knowledge:
- Show it through specific details, not declarations
- Don't repeatedly say "as a local" or "trust me" or "believe me"
- Real experts just state information confidently
- Maximum ONE personal detail or anecdote, then focus on content
- Don't try to prove authenticity. Just be helpful

TONE CONSISTENCY:
Pick ONE voice and maintain it throughout:
- Either casual-helpful OR straightforward-informative
- Don't flip between trying to sound cool and being formal
- Don't alternate between buddy-buddy and instructional
- Consistency beats personality attempts

REQUIRED HUMAN WRITING ELEMENTS:
✅ Use contractions everywhere (you'll, don't, it's, won't, can't)
✅ Vary sentence length dramatically (3 words. Then 27 words with details and context.)
✅ Start sentences with "And" or "But" occasionally (break grammar rules naturally)
✅ Include specific examples with actual names (hotels, streets, restaurants, prices)
✅ State opinions directly without hedging or qualifying everything
✅ Use informal language appropriately (pretty good, kinda expensive, super crowded, sucks, whatever)
✅ Complain or warn about real problems directly
✅ Use parentheses for side thoughts (but not excessively)
✅ Ask occasional rhetorical questions naturally
✅ Be blunt and direct. Cut the nice-talk. Say what you mean.
✅ Write like you're answering someone's question, not writing an essay
✅ If something is boring or overrated, SAY SO
✅ Don't explain obvious things. Readers aren't stupid.
✅ Skip transitions. Just start the next point.

WRITING EXAMPLES - WRONG vs RIGHT:

❌ WRONG: "Let me tell you something about Central Park. It's pure magic that'll absolutely blow your mind. Here's the secret most tourists don't know."
✅ RIGHT: "Central Park is 843 acres. You can't see it all in one day. Pick three spots and actually enjoy them."

❌ WRONG: "When it comes to accommodation options, travelers will discover robust choices ranging from budget-friendly hostels to luxurious five-star resorts."
✅ RIGHT: "Hotels range from $25 hostels to $500+ luxury resorts. Budget travelers have plenty of options under $100."

❌ WRONG: "Pro tip from someone who's made this mistake: don't try to see everything in one day. Trust me on this one. You'll exhaust yourself."
✅ RIGHT: "Don't try to see everything. You'll burn out. Three major attractions per day maximum."

❌ WRONG: "Moreover, it's worth noting that the destination offers pristine beaches, vibrant culture, and bustling nightlife."
✅ RIGHT: "The beaches are excellent. Culture is solid. Nightlife is decent if you know where to go."

❌ WRONG: "I know, I know, you're on vacation and want to sleep in, but here's the thing. Sunrise is absolutely worth it."
✅ RIGHT: "Go at 6:30 AM. Yes, early. You'll probably be jet-lagged anyway. The crowds are gone and the light is perfect."

❌ WRONG: "Fair warning. This place gets pretty crowded on weekends, so you'll definitely want to plan accordingly."
✅ RIGHT: "Weekends are a nightmare. Go Tuesday or Wednesday if possible."

❌ WRONG: "However, it's important to note that prices can vary significantly depending on the season you choose to visit."
✅ RIGHT: "Prices change a lot by season. Summer costs way less than winter."

❌ WRONG: "New York City has 8.3 million people crammed into 302 square miles. That's a lot of everything."
✅ RIGHT: "8.3 million people. 302 square miles. It's crowded."

FINAL QUALITY CHECK:
Before submitting your response, verify:
- Did I use "trust me," "here's the secret," or "I know, I know"? → DELETE AND REWRITE
- Does every section follow the same formula? → MIX UP THE STRUCTURE
- Do I sound like I'm trying too hard to be personable? → BE MORE DIRECT
- Are there ANY em dashes (—) in the content? → REMOVE ALL OF THEM
- Are there colons or semicolons in body paragraphs? → REMOVE THEM
- Did I use "moreover," "furthermore," "robust," or "delve"? → REWRITE COMPLETELY
- Did I include at least 3-5 H3 subheadings? → ADD THEM IF MISSING
- Did I start multiple paragraphs with setup phrases? → CUT THE SETUP, STATE THE POINT
- Did I include the required comparison table(s)? → VERIFY THEY'RE THERE
- Would a real person actually write this way? → BE BRUTALLY HONEST
`;
}

/**
 * Get JSON Schema string for Claude response format
 */
function getJSONSchema(): string {
    return `

You must respond with valid JSON matching this exact structure:

{
  "title": "string - The main title (natural-sounding, not keyword-stuffed)",
  "slug": "string - URL-friendly slug (lowercase, hyphens, no special chars)",
  "content": "string - Full HTML content written in NATURAL, HUMAN language",
  "excerpt": "string - 100-150 word summary (conversational, not robotic)",
  "description": "string - Meta description (150-160 characters for SEO)",
  "metaTitle": "string - SEO meta title (50-60 characters)",
  "metaDescription": "string - SEO meta description (150-160 characters)",
  "focusKeyword": "string - Primary SEO keyword",
  "faqs": [
    {
      "question": "string - FAQ question (natural phrasing)",
      "answer": "string - FAQ answer (conversational, helpful)",
      "order": "number - Display order (1, 2, 3...)"
    }
  ],
  "tags": ["string - Array of relevant tags (3-7 tags)"],
  "imageSuggestions": [
    {
      "placement": "string - Where to place (e.g., 'after introduction', 'section 2')",
      "searchQuery": "string - Search query for finding image",
      "altText": "string - Descriptive alt text for SEO and accessibility"
    }
  ],
  "internalLinks": [
    {
      "anchorText": "string - Text that should be linked",
      "suggestedArticle": "string - Suggested related article topic"
    }
  ],
  "suggestedClusterTopics": ["string - Optional: suggested cluster topics for pillar pages"]
}

HTML FORMATTING REQUIREMENTS:
- Use <h2> for main sections, <h3> for subsections (MANDATORY - need 3-5 H3s minimum)
- Use <p> tags for paragraphs (keep paragraphs 2-4 sentences)
- Use <ul> and <ol> for lists (use sparingly, prefer prose)
- Use <strong> for emphasis (sparingly, not every other sentence)
- Use <em> for emphasis (very sparingly)
- NO colons, semicolons, or em dashes in body text
- Only use periods, commas, question marks, and exclamation points (rarely)
- Write flowing content, not just structured lists
- H3 headings are REQUIRED. Don't skip them.
- Comparison tables are REQUIRED if requested. Use proper HTML table format.

CONTENT QUALITY REQUIREMENTS:
- Write in natural, conversational language
- Avoid all AI-sounding phrases and patterns listed above
- Use varied sentence structures and lengths
- Include specific details and examples
- Sound like a knowledgeable person, not a content system
`;
}

function logPromptDebug(formData: GenerationFormData, prompt: string, pillarTitle?: string) {
    const topic = formData.topic || formData.pillarTopic || 'N/A';
    const previewLenRaw =
        process.env.PROMPT_DEBUG_PREVIEW || process.env.NEXT_PUBLIC_PROMPT_DEBUG_PREVIEW;
    const previewLen = Math.max(200, Math.min(5000, Number(previewLenRaw || 1200) || 1200));

    console.log('[promptBuilder] contentType:', formData.contentType);
    console.log('[promptBuilder] topic:', topic);
    if (pillarTitle) console.log('[promptBuilder] pillarTitle:', pillarTitle);
    console.log('[promptBuilder] promptChars:', prompt.length);
    console.log('[promptBuilder] promptPreviewStart:\n' + prompt.slice(0, previewLen));

    const full =
        process.env.PROMPT_DEBUG_FULL === 'true' ||
        process.env.NEXT_PUBLIC_PROMPT_DEBUG_FULL === 'true';
    if (full) {
        console.log('[promptBuilder] promptFull:\n' + prompt);
    }
}

/**
 * Build prompt for Standalone Article
 */
export function buildStandalonePrompt(formData: GenerationFormData): string {
    const {
        topic,
        articleFormat,
        writingTone,
        targetAudience,
        wordCount,
        primaryKeyword,
        secondaryKeywords,
        includeFAQ,
        includeComparisonTable,
        includeProsCons,
        includeImages
    } = formData;

    if (!topic) {
        throw new Error('Topic is required for standalone articles');
    }

    const format = articleFormats[articleFormat] || articleFormats['complete-guide'];
    const tone = tones[writingTone] || tones['friendly'];
    const audience = audiences[targetAudience] || audiences['first-time-travelers'];
    const wordRange = wordCountRanges[wordCount] || wordCountRanges['medium'];

    let prompt = `You are a real travel writer, NOT an AI content system. Write naturally and authentically.

ASSIGNMENT:
${format.template.replace('{topic}', topic)}

WRITING STYLE:
${tone.modifier}

TARGET AUDIENCE:
${audience.modifier}

WORD COUNT: ${wordRange.min}-${wordRange.max} words

⚠️ STRICT WORD COUNT LIMIT: 
Do NOT exceed ${wordRange.max} words. This is a HARD LIMIT.
Stop writing when you reach ${wordRange.max} words.
If you're approaching the limit, wrap up the current section and write a brief conclusion.

`;

    // Add comprehensive anti-AI instructions
    prompt += getAntiAIInstructions();

    // SEO keyword instructions
    if (primaryKeyword) {
        prompt += `\n\nSEO KEYWORDS (integrate naturally, never force):\n`;
        prompt += `Primary keyword: "${primaryKeyword}"\n`;
        if (secondaryKeywords) {
            const keywords = secondaryKeywords.split(',').map(k => k.trim()).filter(k => k);
            prompt += `Secondary keywords: ${keywords.join(', ')}\n`;
        }
        prompt += `\nUse keywords naturally in context. Don't keyword-stuff. Don't make sentences awkward to fit keywords. If a keyword doesn't fit naturally, skip it.\n`;
    }

    // Content structure requirements
    prompt += `\n\nCONTENT STRUCTURE:\n`;
    prompt += `- Start with a strong hook (question, bold statement, or surprising fact)\n`;
    prompt += `- Use H2 headings for main sections (make them descriptive and helpful)\n`;
    prompt += `- REQUIRED: Use H3 subheadings within sections (minimum 3-5 H3s in article)\n`;
    prompt += `- H3s break up long sections and make content scannable\n`;
    prompt += `- Write in flowing paragraphs, not just lists\n`;
    prompt += `- Mix paragraph lengths (some short, some longer)\n`;
    prompt += `- End with a useful conclusion (not just summary)\n`;
    prompt += `- NO EM DASHES ALLOWED. Use periods or commas only.\n\n`;

    // Optional elements
    if (includeFAQ) {
        prompt += `\n📋 FAQ SECTION REQUIRED:\n`;
        prompt += `Include 5-7 FAQs with natural questions people actually ask.\n`;
        prompt += `Answer FAQs helpfully and conversationally (50-100 words each).\n`;
        prompt += `Format: Use H3 for each question.\n\n`;
    }

    if (includeComparisonTable) {
        prompt += `\n📊 COMPARISON TABLE REQUIRED (MANDATORY):\n`;
        prompt += `You MUST include at least ONE comparison table in proper HTML format.\n`;
        prompt += `This is NOT optional. The table MUST be in your response.\n\n`;
        prompt += `Table structure:\n`;
        prompt += `<table>\n`;
        prompt += `  <thead>\n`;
        prompt += `    <tr>\n`;
        prompt += `      <th>Column Header 1</th>\n`;
        prompt += `      <th>Column Header 2</th>\n`;
        prompt += `      <th>Column Header 3</th>\n`;
        prompt += `    </tr>\n`;
        prompt += `  </thead>\n`;
        prompt += `  <tbody>\n`;
        prompt += `    <tr>\n`;
        prompt += `      <td>Data</td>\n`;
        prompt += `      <td>Data</td>\n`;
        prompt += `      <td>Data</td>\n`;
        prompt += `    </tr>\n`;
        prompt += `  </tbody>\n`;
        prompt += `</table>\n\n`;
        prompt += `Table topics (pick what makes sense for "${topic}"):\n`;
        prompt += `- Neighborhood comparison (if travel guide)\n`;
        prompt += `- Attraction comparison with costs and time needed\n`;
        prompt += `- Transportation options comparison\n`;
        prompt += `- Budget breakdown by travel style\n`;
        prompt += `- Accommodation options comparison\n`;
        prompt += `- Cost comparison by category\n\n`;
        prompt += `Table requirements:\n`;
        prompt += `- 4-6 rows of data (not including header)\n`;
        prompt += `- 3-5 columns maximum\n`;
        prompt += `- Make it scannable and useful\n`;
        prompt += `- Place it where it adds the most value\n`;
        prompt += `- Use simple, clear column headers\n\n`;
    }

    if (includeProsCons) {
        prompt += `- Include pros/cons lists where they add value\n`;
        prompt += `- Be honest about both positives and negatives\n\n`;
    }

    if (includeImages) {
        prompt += `- Suggest image placements every 400-500 words\n`;
        prompt += `- Provide specific, searchable image descriptions\n`;
        prompt += `- Write SEO-friendly alt text\n\n`;
    }

    prompt += getJSONSchema();

    return prompt;
}

/**
 * Build prompt for Pillar Page
 */
export function buildPillarPrompt(formData: GenerationFormData): string {
    const {
        pillarTopic,
        articleFormat,
        writingTone,
        targetAudience,
        wordCount,
        primaryKeyword,
        secondaryKeywords,
        includeFAQ,
        includeComparisonTable,
        includeProsCons,
        includeImages,
        autoSuggestClusters
    } = formData;

    if (!pillarTopic) {
        throw new Error('Pillar topic is required for pillar pages');
    }

    const format = articleFormats[articleFormat] || articleFormats['complete-guide'];
    const tone = tones[writingTone] || tones['friendly'];
    const audience = audiences[targetAudience] || audiences['first-time-travelers'];
    const wordRange = wordCountRanges[wordCount] || wordCountRanges['comprehensive'];

    let prompt = `You are a real travel writer creating a comprehensive pillar page about "${pillarTopic}".

PILLAR PAGE DEFINITION:
A pillar page is the main hub for a topic. It covers the topic comprehensively while naturally connecting to more specific subtopics (cluster articles). It should be authoritative but not overwhelming.

ASSIGNMENT:
${format.template.replace('{topic}', pillarTopic)}

WRITING STYLE:
${tone.modifier}

TARGET AUDIENCE:
${audience.modifier}

WORD COUNT: ${wordRange.min}-${wordRange.max} words (pillar pages are longer and more comprehensive)

⚠️ STRICT WORD COUNT LIMIT: 
Do NOT exceed ${wordRange.max} words. This is a HARD LIMIT.
Stop writing when you reach ${wordRange.max} words.

`;

    // Add anti-AI instructions
    prompt += getAntiAIInstructions();

    // SEO instructions
    if (primaryKeyword) {
        prompt += `\n\nSEO OPTIMIZATION:\n`;
        prompt += `Primary keyword: "${pillarTopic}"\n`;
        if (secondaryKeywords) {
            const keywords = secondaryKeywords.split(',').map(k => k.trim()).filter(k => k);
            prompt += `Secondary keywords: ${keywords.join(', ')}\n`;
        }
        prompt += `Use naturally throughout the content. Focus on being comprehensive and helpful, not keyword density.\n`;
    }

    // Structure requirements
    prompt += `\n\nPILLAR PAGE STRUCTURE:\n`;
    prompt += `- Start with a compelling introduction establishing the scope\n`;
    prompt += `- Cover the main topic comprehensively but concisely\n`;
    prompt += `- Use clear H2 headings for major sections\n`;
    prompt += `- Use H3 subheadings to organize detailed information\n`;
    prompt += `- Naturally mention subtopics that could become cluster articles\n`;
    prompt += `- Include specific, actionable information throughout\n`;
    prompt += `- End with a conclusion that ties everything together\n\n`;

    // Optional elements
    if (includeFAQ) {
        prompt += `- Include 8-10 comprehensive FAQs covering the main topic\n\n`;
    }

    if (includeComparisonTable) {
        prompt += `\n📊 COMPARISON TABLE REQUIRED (MANDATORY):\n`;
        prompt += `You MUST include at least ONE comparison table in proper HTML format.\n`;
        prompt += `This is NOT optional for pillar pages.\n`;
        prompt += `Use proper HTML table structure with thead and tbody.\n`;
        prompt += `Make it comprehensive and useful for readers.\n\n`;
    }

    if (includeProsCons) {
        prompt += `- Include pros/cons where relevant\n\n`;
    }

    if (includeImages) {
        prompt += `- Suggest images every 400 words approximately\n\n`;
    }

    if (autoSuggestClusters) {
        prompt += `\nCLUSTER TOPIC SUGGESTIONS:\n`;
        prompt += `Suggest 8-12 specific cluster article topics that would expand on aspects of "${pillarTopic}".\n`;
        prompt += `Make topics specific and actionable (not just "More about X").\n`;
        prompt += `Include these in the "suggestedClusterTopics" array in your JSON response.\n\n`;
    }

    prompt += `\nPILLAR PAGE BEST PRACTICES:\n`;
    prompt += `- Be comprehensive but not exhaustive (save details for cluster articles)\n`;
    prompt += `- Create natural opportunities to link to cluster topics\n`;
    prompt += `- Establish authority through depth and breadth\n`;
    prompt += `- Make the page valuable on its own, not just a table of contents\n\n`;

    prompt += getJSONSchema();

    return prompt;
}

/**
 * Build prompt for Cluster Article
 */
export function buildClusterPrompt(
    formData: GenerationFormData,
    pillarContent?: string,
    pillarTitle?: string
): string {
    const {
        customClusterTopics,
        clusterTopicMode,
        articleFormat,
        writingTone,
        targetAudience,
        wordCount,
        primaryKeyword,
        secondaryKeywords,
        includeFAQ,
        includeComparisonTable,
        includeProsCons,
        includeImages
    } = formData;

    let clusterTopic = '';
    if (clusterTopicMode === 'custom' && customClusterTopics && customClusterTopics.length > 0) {
        clusterTopic = customClusterTopics[0];
    } else {
        throw new Error('Cluster topic is required');
    }

    if (!clusterTopic || clusterTopic.trim().length < 3) {
        throw new Error('Valid cluster topic is required');
    }

    const format = articleFormats[articleFormat] || articleFormats['complete-guide'];
    const tone = tones[writingTone] || tones['friendly'];
    const audience = audiences[targetAudience] || audiences['first-time-travelers'];
    const wordRange = wordCountRanges[wordCount] || wordCountRanges['medium'];

    let prompt = `You are a real travel writer creating a focused cluster article about "${clusterTopic}".

CLUSTER ARTICLE DEFINITION:
A cluster article focuses on one specific aspect of a broader topic. It provides detailed, actionable information about "${clusterTopic}" specifically.

`;

    if (pillarTitle && pillarContent) {
        prompt += `PILLAR PAGE CONTEXT:\n`;
        prompt += `This article connects to the pillar page: "${pillarTitle}"\n\n`;
        prompt += `Pillar overview:\n${pillarContent.substring(0, 1000)}...\n\n`;
        prompt += `CRITICAL: Don't repeat pillar content. Focus specifically on "${clusterTopic}" with new details and depth.\n\n`;
    }

    prompt += `ASSIGNMENT:\n`;
    prompt += `${format.template.replace('{topic}', clusterTopic)}\n\n`;

    prompt += `WRITING STYLE:\n${tone.modifier}\n\n`;
    prompt += `TARGET AUDIENCE:\n${audience.modifier}\n\n`;
    prompt += `WORD COUNT: ${wordRange.min}-${wordRange.max} words\n\n`;
    prompt += `⚠️ STRICT WORD COUNT LIMIT: Do NOT exceed ${wordRange.max} words.\n\n`;

    // Add anti-AI instructions
    prompt += getAntiAIInstructions();

    // SEO instructions
    if (primaryKeyword) {
        prompt += `\n\nSEO KEYWORDS:\n`;
        prompt += `Primary: "${clusterTopic}"\n`;
        if (secondaryKeywords) {
            const keywords = secondaryKeywords.split(',').map(k => k.trim()).filter(k => k);
            prompt += `Secondary: ${keywords.join(', ')}\n`;
        }
        prompt += `Integrate naturally. Focus on depth and specificity.\n`;
    }

    // Structure requirements
    prompt += `\n\nCLUSTER ARTICLE STRUCTURE:\n`;
    prompt += `- Start by connecting to the broader topic briefly\n`;
    if (pillarTitle) {
        prompt += `- Reference the pillar page naturally in the introduction\n`;
    }
    prompt += `- Use H2 headings for main sections about "${clusterTopic}"\n`;
    prompt += `- Go deep on specific details and actionable information\n`;
    prompt += `- Include examples, prices, names, and specifics\n`;
    prompt += `- End by tying back to the broader topic\n\n`;

    // Optional elements
    if (includeFAQ) {
        prompt += `- Include 5-7 FAQs specific to "${clusterTopic}"\n\n`;
    }

    if (includeComparisonTable) {
        prompt += `\n📊 COMPARISON TABLE REQUIRED:\n`;
        prompt += `You MUST include at least ONE comparison table in proper HTML format.\n`;
        prompt += `Make it relevant to "${clusterTopic}" specifically.\n\n`;
    }

    if (includeProsCons) {
        prompt += `- Include pros/cons where helpful\n\n`;
    }

    if (includeImages) {
        prompt += `- Suggest images every 400-500 words\n\n`;
    }

    prompt += `CLUSTER ARTICLE BEST PRACTICES:\n`;
    prompt += `- Focus on depth, not breadth\n`;
    prompt += `- Provide more specific detail than the pillar page\n`;
    prompt += `- Include actionable, practical information\n`;
    prompt += `- Suggest natural internal links to pillar and related clusters\n\n`;

    prompt += getJSONSchema();

    return prompt;
}

/**
 * Main function to build prompt based on content type
 */
export function buildPrompt(
    formData: GenerationFormData,
    pillarContent?: string,
    pillarTitle?: string
): string {
    switch (formData.contentType) {
        case 'standalone':
            const standalonePrompt = buildStandalonePrompt(formData);
            logPromptDebug(formData, standalonePrompt, pillarTitle);
            return standalonePrompt;
        case 'pillar':
            const pillarPrompt = buildPillarPrompt(formData);
            logPromptDebug(formData, pillarPrompt, pillarTitle);
            return pillarPrompt;
        case 'cluster':
            const clusterPrompt = buildClusterPrompt(formData, pillarContent, pillarTitle);
            logPromptDebug(formData, clusterPrompt, pillarTitle);
            return clusterPrompt;
        default:
            throw new Error(`Unknown content type: ${formData.contentType}`);
    }
}