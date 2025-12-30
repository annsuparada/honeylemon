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
    const idCounts = new Map<string, number>()

    while ((match = headingRegex.exec(html)) !== null) {
        const level = parseInt(match[1], 10)
        const text = match[2].replace(/<[^>]*>/g, '').trim() // Remove any HTML tags from text

        if (text) {
            // Check if heading already has an ID attribute
            const idMatch = match[0].match(/id=["']([^"']+)["']/i)
            let id: string
            
            if (idMatch) {
                // Use existing ID
                id = idMatch[1]
            } else {
                // Generate new ID
                id = generateId(text)
            }

            // Ensure unique ID by appending number if duplicate
            const baseId = id
            let uniqueId = id
            let counter = 1
            
            while (idCounts.has(uniqueId)) {
                uniqueId = `${baseId}-${counter}`
                counter++
            }
            
            idCounts.set(uniqueId, (idCounts.get(uniqueId) || 0) + 1)
            headings.push({ id: uniqueId, text, level })
        }
    }

    return headings
}

/**
 * Add IDs to headings in HTML content
 */
export function addIdsToHeadings(html: string): string {
    const headingRegex = /<h([2-6])([^>]*)>(.*?)<\/h[1-6]>/gi
    const usedIds = new Set<string>()

    return html.replace(headingRegex, (match, level, attributes, content) => {
        const text = content.replace(/<[^>]*>/g, '').trim()
        if (!text) return match

        // Check if id already exists in attributes
        const existingIdMatch = attributes.match(/id=["']([^"']+)["']/i)
        if (existingIdMatch) {
            const existingId = existingIdMatch[1]
            usedIds.add(existingId)
            return match // Keep existing ID
        }

        // Generate unique ID
        let baseId = generateId(text)
        let uniqueId = baseId
        let counter = 1

        // Ensure ID is unique
        while (usedIds.has(uniqueId)) {
            uniqueId = `${baseId}-${counter}`
            counter++
        }

        usedIds.add(uniqueId)

        // Add id attribute
        const newAttributes = attributes ? `${attributes} id="${uniqueId}"` : `id="${uniqueId}"`
        return `<h${level} ${newAttributes}>${content}</h${level}>`
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

