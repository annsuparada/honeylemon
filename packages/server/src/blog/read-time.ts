const WORDS_PER_MINUTE = 200;

function stripHtml(html: string): string {
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

    text = text.replace(/<[^>]+>/g, " ");

    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");

    text = text.replace(/\s+/g, " ");

    return text.trim();
}

function countWords(text: string): number {
    if (!text || text.trim().length === 0) {
        return 0;
    }

    const words = text.trim().split(/\s+/).filter((word) => word.length > 0);
    return words.length;
}

export function calculateReadTime(htmlContent: string): number {
    if (!htmlContent || htmlContent.trim().length === 0) {
        return 1;
    }

    const text = stripHtml(htmlContent);
    const wordCount = countWords(text);

    return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function calculateWordCount(htmlContent: string): number {
    if (!htmlContent || htmlContent.trim().length === 0) {
        return 0;
    }

    const text = stripHtml(htmlContent);
    return countWords(text);
}
