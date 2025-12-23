/**
 * Extract headings from HTML content and generate IDs
 */
export interface Heading {
    id: string
    text: string
    level: number
}

export function extractHeadings(html: string): Heading[] {
    const headings: Heading[] = []
    const headingRegex = /<h([2-6])[^>]*>(.*?)<\/h[1-6]>/gi
    let match

    while ((match = headingRegex.exec(html)) !== null) {
        const level = parseInt(match[1], 10)
        const text = match[2].replace(/<[^>]*>/g, '').trim() // Remove any HTML tags from text

        if (text) {
            const id = generateId(text)
            headings.push({ id, text, level })
        }
    }

    return headings
}

/**
 * Add IDs to headings in HTML content
 */
export function addIdsToHeadings(html: string): string {
    const headingRegex = /<h([2-6])([^>]*)>(.*?)<\/h[1-6]>/gi

    return html.replace(headingRegex, (match, level, attributes, content) => {
        const text = content.replace(/<[^>]*>/g, '').trim()
        if (!text) return match

        const id = generateId(text)

        // Check if id already exists in attributes
        if (attributes && attributes.includes('id=')) {
            return match // Don't add duplicate id
        }

        return `<h${level}${attributes} id="${id}">${content}</h${level}>`
    })
}

/**
 * Generate a URL-friendly ID from text
 */
function generateId(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

