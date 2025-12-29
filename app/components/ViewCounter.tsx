'use client'

import { useEffect } from 'react'

interface ViewCounterProps {
    slug: string
}

/**
 * ViewCounter component that increments view count for a post
 * This component does not display anything - it only tracks views
 */
export default function ViewCounter({ slug }: ViewCounterProps) {
    useEffect(() => {
        // Increment view count when component mounts
        const incrementViews = async () => {
            try {
                await fetch(`/api/post/${slug}/views`, {
                    method: 'POST',
                })
            } catch (error) {
                // Silently fail - we don't want to break the page if view tracking fails
                console.error('Failed to increment view count:', error)
            }
        }

        incrementViews()
    }, [slug])

    // This component doesn't render anything
    return null
}

