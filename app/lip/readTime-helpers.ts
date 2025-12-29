/**
 * Calculate reading time from HTML content
 * Based on average reading speed of 200 words per minute
 */

const WORDS_PER_MINUTE = 200;

/**
 * Strip HTML tags and extract text content
 */
function stripHtml(html: string): string {
    // Remove script and style tags and their content
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Replace HTML tags with spaces
    text = text.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");

    // Replace multiple spaces with single space
    text = text.replace(/\s+/g, ' ');

    return text.trim();
}

/**
 * Count words in a text string
 */
function countWords(text: string): number {
    if (!text || text.trim().length === 0) {
        return 0;
    }

    // Split by whitespace and filter out empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

/**
 * Calculate reading time in minutes from HTML content
 * @param htmlContent - HTML content string
 * @returns Estimated reading time in minutes (minimum 1 minute)
 */
export function calculateReadTime(htmlContent: string): number {
    if (!htmlContent || htmlContent.trim().length === 0) {
        return 1; // Default to 1 minute for empty content
    }

    const text = stripHtml(htmlContent);
    const wordCount = countWords(text);

    // Calculate reading time (words / words per minute)
    // Round up to nearest minute, minimum 1 minute
    const readingTime = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

    return readingTime;
}

/**
 * Calculate word count from HTML content
 * @param htmlContent - HTML content string
 * @returns Word count
 */
export function calculateWordCount(htmlContent: string): number {
    if (!htmlContent || htmlContent.trim().length === 0) {
        return 0;
    }

    const text = stripHtml(htmlContent);
    return countWords(text);
}

