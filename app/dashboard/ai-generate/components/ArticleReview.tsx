'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AIArticleResponse } from '@/utils/promptBuilder'
import { GenerationFormData } from '@/utils/promptBuilder'
import { calculateReadTime, calculateWordCount } from '@/app/lip/readTime-helpers'
import { createPost } from '@/utils/postActions'
import { mapAIResponseToPost } from '@/utils/aiToPostMapper'
import AlertMessage from '@/app/components/AlertMessage'
import InternalLinkModal from '@/app/components/tiptap/InternalLinkModal'
import { getPostRoute } from '@/utils/routeHelpers'
import { PageType } from '@prisma/client'

interface ArticleReviewProps {
    article: AIArticleResponse
    formData: GenerationFormData
    heroImageUrl?: string
    onRegenerate: () => void
}

export default function ArticleReview({
    article,
    formData,
    heroImageUrl,
    onRegenerate,
}: ArticleReviewProps) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [editingTitle, setEditingTitle] = useState(false)
    const [editingMetaDesc, setEditingMetaDesc] = useState(false)
    const [editedTitle, setEditedTitle] = useState(article.title)
    const [editedMetaDesc, setEditedMetaDesc] = useState(article.metaDescription)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])

    // Detect internal link placeholders
    const linkPlaceholders = article.content.match(/\[LINK NEEDED:[^\]]+\]/g) || []
    const needsLinkFixing = linkPlaceholders.length > 0

    // Calculate stats
    const wordCount = calculateWordCount(article.content)
    const readTime = calculateReadTime(article.content)

    // Fetch categories on mount
    useEffect(() => {
        fetch('/api/category')
            .then(res => res.json())
            .then(data => {
                if (data.categories) {
                    setCategories(data.categories)
                    if (data.categories.length > 0) {
                        setSelectedCategory(data.categories[0].id)
                    }
                }
            })
            .catch(err => console.error('Error fetching categories:', err))
    }, [])

    const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
        if (!selectedCategory) {
            setAlert({ type: 'error', text: 'Please select a category' })
            return
        }

        setSaving(true)
        setAlert(null)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('Not authenticated')
            }

            // Get user ID from token
            const decoded = JSON.parse(atob(token.split('.')[1]))
            const userId = decoded.id

            // Map AI response to post data
            const postData = await mapAIResponseToPost(
                {
                    ...article,
                    title: editedTitle,
                    metaDescription: editedMetaDesc,
                },
                formData,
                heroImageUrl,
                userId,
                selectedCategory,
                status,
                token
            )

            // Create post
            const result = await createPost(postData)

            if (result.success && 'post' in result) {
                setAlert({
                    type: 'success',
                    text: status === 'PUBLISHED' ? 'Article published successfully!' : 'Article saved as draft!',
                })

                // Redirect after short delay
                setTimeout(() => {
                    router.push('/dashboard/blogs')
                }, 1500)
            } else {
                const errorMessage = 'error' in result ? result.error : 'Failed to save article'
                throw new Error(errorMessage)
            }
        } catch (error) {
            console.error('Error saving article:', error)
            setAlert({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to save article',
            })
        } finally {
            setSaving(false)
        }
    }

    const handleFixLinks = () => {
        setShowLinkModal(true)
    }

    const handleInsertLink = (url: string) => {
        // Replace first placeholder with link
        const firstPlaceholder = linkPlaceholders[0]
        if (firstPlaceholder) {
            const anchorText = firstPlaceholder.replace(/\[LINK NEEDED:\s*|\]/g, '')
            const newContent = article.content.replace(
                firstPlaceholder,
                `<a href="${url}" class="text-blue-600 hover:underline">${anchorText}</a>`
            )
            // Update article content (would need to be passed back to parent)
            // For now, just close modal
            setShowLinkModal(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            {alert && (
                <AlertMessage
                    message={alert}
                    onClose={() => setAlert(null)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-4">Article Preview</h2>

                        {/* Stats */}
                        <div className="flex gap-4 mb-4 text-sm text-gray-600">
                            <span>{wordCount} words</span>
                            <span>•</span>
                            <span>{readTime} min read</span>
                        </div>

                        {/* Article Content */}
                        <div
                            className="prose max-w-none border rounded-lg p-6 max-h-[600px] overflow-y-auto"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </div>
                </div>

                {/* Sidebar - Metadata */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 sticky top-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Article Details</h3>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            {editingTitle ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        className="input input-bordered flex-1"
                                        onBlur={() => setEditingTitle(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') setEditingTitle(false)
                                        }}
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <p
                                    className="text-gray-900 cursor-pointer hover:text-blue-600"
                                    onClick={() => setEditingTitle(true)}
                                >
                                    {editedTitle}
                                </p>
                            )}
                        </div>

                        {/* Meta Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                            {editingMetaDesc ? (
                                <textarea
                                    value={editedMetaDesc}
                                    onChange={(e) => setEditedMetaDesc(e.target.value)}
                                    className="textarea textarea-bordered w-full"
                                    rows={3}
                                    onBlur={() => setEditingMetaDesc(false)}
                                    autoFocus
                                />
                            ) : (
                                <p
                                    className="text-gray-600 text-sm cursor-pointer hover:text-blue-600"
                                    onClick={() => setEditingMetaDesc(true)}
                                >
                                    {editedMetaDesc || 'Click to edit'}
                                </p>
                            )}
                        </div>

                        {/* Focus Keyword */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Focus Keyword</label>
                            <p className="text-gray-900">{article.focusKeyword || 'N/A'}</p>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {article.tags && article.tags.length > 0 ? (
                                    article.tags.map((tag, index) => (
                                        <span key={index} className="badge badge-outline">
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-sm">No tags</span>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="select select-bordered w-full"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Issues/Warnings */}
                        {needsLinkFixing && (
                            <div className="alert alert-warning">
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div>
                                    <h3 className="font-bold">Links Need Attention</h3>
                                    <div className="text-xs">{linkPlaceholders.length} internal link{linkPlaceholders.length > 1 ? 's' : ''} need to be fixed</div>
                                </div>
                            </div>
                        )}

                        {/* Suggested Cluster Topics (for pillar pages) */}
                        {formData.contentType === 'pillar' && article.suggestedClusterTopics && article.suggestedClusterTopics.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Cluster Topics</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {article.suggestedClusterTopics.map((topic, index) => (
                                        <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                                            {topic}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-4 border-t space-y-3">
                            {needsLinkFixing && (
                                <button
                                    onClick={handleFixLinks}
                                    className="btn btn-warning w-full"
                                >
                                    Fix Internal Links First
                                </button>
                            )}
                            <button
                                onClick={() => handleSave('DRAFT')}
                                disabled={saving || !selectedCategory}
                                className="btn btn-outline w-full"
                            >
                                {saving ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Saving...
                                    </>
                                ) : (
                                    'Save as Draft'
                                )}
                            </button>
                            <button
                                onClick={() => handleSave('PUBLISHED')}
                                disabled={saving || !selectedCategory}
                                className="btn btn-primary w-full"
                            >
                                {saving ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Publishing...
                                    </>
                                ) : (
                                    'Publish Now'
                                )}
                            </button>
                            <button
                                onClick={onRegenerate}
                                className="btn btn-ghost w-full text-sm"
                            >
                                Regenerate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Internal Link Modal */}
            <InternalLinkModal
                isOpen={showLinkModal}
                onClose={() => setShowLinkModal(false)}
                onInsert={handleInsertLink}
            />
        </div>
    )
}

