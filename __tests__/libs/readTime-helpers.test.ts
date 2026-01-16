import { calculateReadTime, calculateWordCount } from '@/app/lib/readTime-helpers';

describe('readTime-helpers', () => {
    describe('calculateWordCount', () => {
        it('returns 0 for empty string', () => {
            expect(calculateWordCount('')).toBe(0);
        });

        it('returns 0 for string with only whitespace', () => {
            expect(calculateWordCount('   \n\t   ')).toBe(0);
        });

        it('counts words correctly in plain text', () => {
            expect(calculateWordCount('Hello world')).toBe(2);
            expect(calculateWordCount('This is a test sentence')).toBe(5);
        });

        it('strips HTML tags and counts words', () => {
            const html = '<p>This is a <strong>test</strong> sentence</p>';
            expect(calculateWordCount(html)).toBe(5);
        });

        it('handles multiple spaces correctly', () => {
            expect(calculateWordCount('Word1    Word2   Word3')).toBe(3);
        });

        it('handles HTML with scripts and styles', () => {
            const html = `
                <style>body { color: red; }</style>
                <script>console.log("test");</script>
                <p>This is content</p>
            `;
            // After stripping HTML tags, we have "This is content" = 3 words
            expect(calculateWordCount(html)).toBe(3);
        });

        it('decodes HTML entities', () => {
            const html = '<p>Hello&nbsp;world&nbsp;&amp;&nbsp;more</p>';
            expect(calculateWordCount(html)).toBe(4); // Hello world & more
        });
    });

    describe('calculateReadTime', () => {
        it('returns minimum 1 minute for empty content', () => {
            expect(calculateReadTime('')).toBe(1);
        });

        it('returns minimum 1 minute for very short content', () => {
            expect(calculateReadTime('Hello')).toBe(1);
        });

        it('calculates read time based on word count (200 words per minute)', () => {
            // 200 words = 1 minute
            const content = 'word '.repeat(200).trim();
            expect(calculateReadTime(content)).toBe(1);
        });

        it('rounds up to nearest minute', () => {
            // 201 words should round up to 2 minutes
            const content = 'word '.repeat(201).trim();
            expect(calculateReadTime(content)).toBe(2);
        });

        it('calculates read time for longer content', () => {
            // 600 words = 3 minutes
            const content = 'word '.repeat(600).trim();
            expect(calculateReadTime(content)).toBe(3);
        });

        it('strips HTML tags before calculating', () => {
            const html = '<p>' + 'word '.repeat(200) + '</p>';
            expect(calculateReadTime(html)).toBe(1);
        });

        it('handles HTML content with formatting', () => {
            const html = `
                <h1>Title</h1>
                <p>This is a <strong>test</strong> paragraph with <em>multiple</em> words.</p>
                <ul>
                    <li>Item one</li>
                    <li>Item two</li>
                </ul>
            `;
            const wordCount = calculateWordCount(html);
            const readTime = calculateReadTime(html);
            // Should be at least 1 minute
            expect(readTime).toBeGreaterThanOrEqual(1);
            // Should be roughly wordCount / 200 (rounded up)
            expect(readTime).toBe(Math.ceil(wordCount / 200));
        });

        it('returns consistent results for same content', () => {
            const content = '<p>This is a test content with multiple words.</p>';
            const result1 = calculateReadTime(content);
            const result2 = calculateReadTime(content);
            expect(result1).toBe(result2);
        });
    });
});

