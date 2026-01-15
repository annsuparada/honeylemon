'use client'

import { useState, useEffect } from 'react'
import FormInput from '@/app/components/FormInput'
import SelectInput from '@/app/components/SelectInput'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'
import { fetchPosts } from '@/utils/postActions'
import { BlogPost } from '@/app/types'
import GenerationProgress, { ProgressStep } from './GenerationProgress'
import ArticleReview from './ArticleReview'
import { AIArticleResponse } from '@/utils/promptBuilder'
import { GenerationFormData } from '@/utils/promptBuilder'
import AlertMessage from '@/app/components/AlertMessage'

export type ContentType = 'standalone' | 'pillar' | 'cluster'

interface GenerationFormProps {
    onSubmit?: (data: any) => void
}

export default function GenerationForm({ onSubmit }: GenerationFormProps) {
    const [contentType, setContentType] = useState<ContentType>('standalone')

    // Common fields
    const [articleFormat, setArticleFormat] = useState('complete-guide')
    const [writingTone, setWritingTone] = useState('friendly')
    const [targetAudience, setTargetAudience] = useState('first-time-travelers')
    const [wordCount, setWordCount] = useState('medium')
    const [primaryKeyword, setPrimaryKeyword] = useState('')
    const [secondaryKeywords, setSecondaryKeywords] = useState('')
    const [includeFAQ, setIncludeFAQ] = useState(true)
    const [includeComparisonTable, setIncludeComparisonTable] = useState(false)
    const [includeProsCons, setIncludeProsCons] = useState(false)

    // Conditional fields
    const [topic, setTopic] = useState('')
    const [pillarTopic, setPillarTopic] = useState('')
    const [autoSuggestClusters, setAutoSuggestClusters] = useState(true)
    const [selectedPillarId, setSelectedPillarId] = useState('')
    const [clusterTopicMode, setClusterTopicMode] = useState<'ai-suggest' | 'custom'>('ai-suggest')
    // TODO: Implement multiple custom topics - currently only supports one topic at a time
    const [customClusterTopics, setCustomClusterTopics] = useState<string[]>([''])
    const [numberOfClusters, setNumberOfClusters] = useState('5')

    // Data
    const [pillarPages, setPillarPages] = useState<BlogPost[]>([])
    const [loadingPillars, setLoadingPillars] = useState(false)

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Generation state
    const [generating, setGenerating] = useState(false)
    const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([])
    const [currentStep, setCurrentStep] = useState(0)
    const [generatedArticle, setGeneratedArticle] = useState<AIArticleResponse | null>(null)
    const [heroImageUrl, setHeroImageUrl] = useState<string | undefined>()
    const [showReview, setShowReview] = useState(false)
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // Scroll to top when alert appears to make alert visible
    useEffect(() => {
        if (alert) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [alert])

    // Fetch pillar pages when cluster type is selected
    useEffect(() => {
        if (contentType === 'cluster') {
            setLoadingPillars(true)
            fetchPosts()
                .then((posts) => {
                    const pillars = posts.filter((post: BlogPost) => post.pillarPage === true)
                    setPillarPages(pillars)
                })
                .catch((err) => {
                    console.error('Error fetching pillar pages:', err)
                })
                .finally(() => {
                    setLoadingPillars(false)
                })
        }
    }, [contentType])

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        // Article format is required
        if (!articleFormat) {
            newErrors.articleFormat = 'Article format is required'
        }

        // Topic/Pillar topic required based on content type
        if (contentType === 'standalone') {
            if (!topic.trim()) {
                newErrors.topic = 'Article topic is required'
            } else if (topic.trim().length < 3) {
                newErrors.topic = 'Topic must be at least 3 characters'
            }
        } else if (contentType === 'pillar') {
            if (!pillarTopic.trim()) {
                newErrors.pillarTopic = 'Pillar topic is required'
            } else if (pillarTopic.trim().length < 3) {
                newErrors.pillarTopic = 'Pillar topic must be at least 3 characters'
            }
        } else if (contentType === 'cluster') {
            if (!selectedPillarId) {
                newErrors.selectedPillarId = 'Please select a pillar page'
            }
            if (clusterTopicMode === 'custom') {
                // TODO: Support multiple topics - currently only validates first topic
                const topic = customClusterTopics[0]?.trim() || ''
                if (!topic || topic.length < 3) {
                    newErrors.customClusterTopics = 'Please enter a valid cluster topic (min 3 characters)'
                }
            }
        }

        setErrors(newErrors)

        // Set alert if validation fails
        if (Object.keys(newErrors).length > 0) {
            // Create a user-friendly error message
            const errorMessages = Object.values(newErrors)
            const errorMessage = errorMessages.length === 1
                ? errorMessages[0]
                : `Please fix the following errors: ${errorMessages.join(', ')}`

            setAlert({
                type: 'error',
                text: errorMessage,
            })

            // Scroll to top after setting alert
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }, 100)
        }

        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        const formData: GenerationFormData = {
            contentType,
            articleFormat,
            writingTone,
            targetAudience,
            wordCount,
            primaryKeyword: primaryKeyword.trim() || undefined,
            secondaryKeywords: secondaryKeywords.trim() || undefined,
            includeFAQ,
            includeComparisonTable,
            includeProsCons,
            topic: contentType === 'standalone' ? topic.trim() : undefined,
            pillarTopic: contentType === 'pillar' ? pillarTopic.trim() : undefined,
            autoSuggestClusters: contentType === 'pillar' ? autoSuggestClusters : undefined,
            selectedPillarId: contentType === 'cluster' ? selectedPillarId : undefined,
            clusterTopicMode: contentType === 'cluster' ? clusterTopicMode : undefined,
            // TODO: Support multiple custom topics - currently only uses first topic
            customClusterTopics: contentType === 'cluster' && clusterTopicMode === 'custom'
                ? (customClusterTopics[0]?.trim() && customClusterTopics[0].trim().length >= 3
                    ? [customClusterTopics[0].trim()]
                    : undefined)
                : undefined,
            // TODO: Implement batch cluster generation - currently only generates one article
            // numberOfClusters: contentType === 'cluster' && clusterTopicMode === 'ai-suggest'
            //     ? parseInt(numberOfClusters)
            //     : undefined,
        }

        // Start generation
        setGenerating(true)
        setShowReview(false)
        setGeneratedArticle(null)
        setAlert(null)

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('Not authenticated')
            }

            // Call API
            const response = await fetch('/api/ai-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to generate content')
            }

            // Set generated article
            setGeneratedArticle(data.article)
            setHeroImageUrl(data.heroImageUrl)
            setShowReview(true)
            setGenerating(false)
        } catch (error) {
            console.error('Error generating content:', error)
            setGenerating(false)
            setAlert({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to generate content',
            })
        }
    }

    const handleRegenerate = () => {
        setShowReview(false)
        setGeneratedArticle(null)
        setHeroImageUrl(undefined)
        setGenerating(false)
        setCurrentStep(0)
        setProgressSteps([])
    }

    // TODO: Implement multiple custom topics - these functions will be used for batch topic input
    // const addCustomClusterTopic = () => {
    //     if (customClusterTopics.length < 10) {
    //         setCustomClusterTopics([...customClusterTopics, ''])
    //     }
    // }

    const updateCustomClusterTopic = (index: number, value: string) => {
        // Currently only supports index 0 (single topic)
        const updated = [...customClusterTopics]
        updated[index] = value
        setCustomClusterTopics(updated)
    }

    // const removeCustomClusterTopic = (index: number) => {
    //     if (customClusterTopics.length > 1) {
    //         setCustomClusterTopics(customClusterTopics.filter((_, i) => i !== index))
    //     }
    // }

    // Article Format Options
    const articleFormatOptions = [
        { label: 'Complete Guide', value: 'complete-guide' },
        { label: 'Cost Breakdown', value: 'cost-breakdown' },
        { label: 'Comparison Guide', value: 'comparison-guide' },
        { label: 'Top/Best List', value: 'top-list' },
        { label: 'How-To Guide', value: 'how-to' },
        { label: 'Itinerary', value: 'itinerary' },
        { label: 'Safety Guide', value: 'safety-guide' },
    ]

    // Writing Tone Options
    const writingToneOptions = [
        { label: '🎯 Professional', value: 'professional' },
        { label: '😊 Friendly', value: 'friendly' },
        { label: '⚡ Enthusiastic', value: 'enthusiastic' },
        { label: '📚 Educational', value: 'educational' },
        { label: '💰 Budget-Focused', value: 'budget-focused' },
        { label: '🌟 Luxury', value: 'luxury' },
    ]

    // Target Audience Options
    const targetAudienceOptions = [
        { label: 'First-time travelers', value: 'first-time-travelers' },
        { label: 'Budget backpackers', value: 'budget-backpackers' },
        { label: 'Luxury travelers', value: 'luxury-travelers' },
        { label: 'Families with kids', value: 'families' },
        { label: 'Solo travelers', value: 'solo-travelers' },
        { label: 'Couples/Honeymooners', value: 'couples' },
        { label: 'Adventure seekers', value: 'adventure-seekers' },
        { label: 'Digital nomads', value: 'digital-nomads' },
    ]

    // Word Count Options
    const wordCountOptions = [
        { label: 'Short (800-1200)', value: 'short' },
        { label: 'Medium (1500-2000) ⭐', value: 'medium' },
        { label: 'Long (2500-3500)', value: 'long' },
        { label: 'Comprehensive (4000-5000)', value: 'comprehensive' },
    ]

    // Number of Clusters Options
    const numberOfClustersOptions = [
        { label: '3', value: '3' },
        { label: '5', value: '5' },
        { label: '8', value: '8' },
        { label: '10', value: '10' },
    ]

    // Pillar Page Options
    const pillarPageOptions = pillarPages.map((pillar) => {
        const clusterCount = pillar.itemListItems?.length || 0
        const status = pillar.status.charAt(0) + pillar.status.slice(1).toLowerCase()
        return {
            label: `${pillar.title} (${status}, ${clusterCount} clusters)`,
            value: pillar.id,
        }
    })

    // Show review screen if article is generated
    if (showReview && generatedArticle) {
        return (
            <div className="max-w-7xl mx-auto">
                {/* Alert Message - Fixed at top */}
                {alert && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-screen-lg px-4">
                        <AlertMessage
                            message={alert}
                            onClose={() => setAlert(null)}
                        />
                    </div>
                )}
                <ArticleReview
                    article={generatedArticle}
                    formData={{
                        contentType,
                        articleFormat,
                        writingTone,
                        targetAudience,
                        wordCount,
                        primaryKeyword: primaryKeyword.trim() || undefined,
                        secondaryKeywords: secondaryKeywords.trim() || undefined,
                        includeFAQ,
                        includeComparisonTable,
                        includeProsCons,
                        topic: contentType === 'standalone' ? topic.trim() : undefined,
                        pillarTopic: contentType === 'pillar' ? pillarTopic.trim() : undefined,
                        autoSuggestClusters: contentType === 'pillar' ? autoSuggestClusters : undefined,
                        selectedPillarId: contentType === 'cluster' ? selectedPillarId : undefined,
                        clusterTopicMode: contentType === 'cluster' ? clusterTopicMode : undefined,
                        // TODO: Support multiple custom topics - currently only uses first topic
                        customClusterTopics: contentType === 'cluster' && clusterTopicMode === 'custom'
                            ? (customClusterTopics[0]?.trim() && customClusterTopics[0].trim().length >= 3
                                ? [customClusterTopics[0].trim()]
                                : undefined)
                            : undefined,
                        // TODO: Implement batch cluster generation - currently only generates one article
                        // numberOfClusters: contentType === 'cluster' && clusterTopicMode === 'ai-suggest'
                        //     ? parseInt(numberOfClusters)
                        //     : undefined,
                    }}
                    heroImageUrl={heroImageUrl}
                    onRegenerate={handleRegenerate}
                />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Alert Message - Fixed at top */}
            {alert && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-screen-lg px-4">
                    <AlertMessage
                        message={alert}
                        onClose={() => setAlert(null)}
                    />
                </div>
            )}

            <GenerationProgress
                isOpen={generating}
                currentStep={0}
                totalSteps={1}
                steps={[]}
                estimatedTime={240} // 4 minutes estimate
            />

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                {/* Content Type Selector */}
                <div className="mb-8">
                    <label className="block text-lg font-semibold text-gray-700 mb-4">
                        Content Type *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${contentType === 'standalone'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="contentType"
                                value="standalone"
                                checked={contentType === 'standalone'}
                                onChange={(e) => setContentType(e.target.value as ContentType)}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium text-gray-900">Standalone Article</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Single article, not part of content hub
                                </div>
                            </div>
                        </label>

                        <label
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${contentType === 'pillar'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="contentType"
                                value="pillar"
                                checked={contentType === 'pillar'}
                                onChange={(e) => setContentType(e.target.value as ContentType)}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium text-gray-900">New Pillar Page</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Start content hub
                                </div>
                            </div>
                        </label>

                        <label
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${contentType === 'cluster'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="radio"
                                name="contentType"
                                value="cluster"
                                checked={contentType === 'cluster'}
                                onChange={(e) => setContentType(e.target.value as ContentType)}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium text-gray-900">Add Cluster Pages</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Expand existing pillar
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Conditional Topic Fields */}
                <div className="mb-6 border-t pt-6">
                    {contentType === 'standalone' && (
                        <FormInput
                            id="topic"
                            label="Article Topic *"
                            placeholder="e.g., Tokyo Food Guide, Budget Travel Tips"
                            value={topic}
                            onChange={setTopic}
                            error={errors.topic}
                        />
                    )}

                    {contentType === 'pillar' && (
                        <>
                            <FormInput
                                id="pillarTopic"
                                label="Pillar Topic *"
                                placeholder="e.g., Complete Tokyo Travel Guide, Mexico Travel Guide"
                                value={pillarTopic}
                                onChange={setPillarTopic}
                                error={errors.pillarTopic}
                            />
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={autoSuggestClusters}
                                        onChange={(e) => setAutoSuggestClusters(e.target.checked)}
                                        className="checkbox checkbox-primary mr-2"
                                    />
                                    <span className="text-gray-700">Auto-suggest cluster topics after generation</span>
                                </label>
                            </div>
                        </>
                    )}

                    {contentType === 'cluster' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-lg font-semibold text-gray-700 mb-2">
                                    Select Pillar Page *
                                </label>
                                {loadingPillars ? (
                                    <div className="flex items-center gap-2">
                                        <span className="loading loading-spinner loading-sm"></span>
                                        <span className="text-gray-500">Loading pillar pages...</span>
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            onChange={(e) => setSelectedPillarId(e.target.value)}
                                            value={selectedPillarId}
                                            className={`select select-bordered w-full ${errors.selectedPillarId ? 'select-error' : ''}`}
                                        >
                                            <option value="">Select a pillar page</option>
                                            {pillarPageOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        {errors.selectedPillarId && (
                                            <p className="mt-2 text-sm text-red-600">{errors.selectedPillarId}</p>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-lg font-semibold text-gray-700 mb-3">
                                    Cluster Topics
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="clusterTopicMode"
                                            value="ai-suggest"
                                            checked={clusterTopicMode === 'ai-suggest'}
                                            onChange={(e) => setClusterTopicMode(e.target.value as 'ai-suggest' | 'custom')}
                                            className="radio radio-primary mr-3"
                                        />
                                        <span className="text-gray-700">Let AI suggest topics</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="clusterTopicMode"
                                            value="custom"
                                            checked={clusterTopicMode === 'custom'}
                                            onChange={(e) => setClusterTopicMode(e.target.value as 'ai-suggest' | 'custom')}
                                            className="radio radio-primary mr-3"
                                        />
                                        <span className="text-gray-700">Enter custom topics</span>
                                    </label>
                                </div>

                                {clusterTopicMode === 'ai-suggest' && (
                                    <div className="mt-4">
                                        {/* TODO: Implement batch cluster generation
                                            Currently only generates one article per request.
                                            When implemented, this will allow generating multiple
                                            cluster articles at once based on the selected number.
                                        */}
                                        {/* <SelectInput
                                            label="Number of clusters"
                                            options={numberOfClustersOptions}
                                            selectedValue={numberOfClusters}
                                            onChange={setNumberOfClusters}
                                        /> */}
                                    </div>
                                )}

                                {clusterTopicMode === 'custom' && (
                                    <div className="mt-4 space-y-3">
                                        {/* TODO: Implement multiple custom topics - currently only supports one topic at a time
                                            When implemented, uncomment the map function and add/remove buttons below
                                        */}
                                        <input
                                            type="text"
                                            className="input input-bordered w-full"
                                            placeholder="Enter cluster topic"
                                            value={customClusterTopics[0] || ''}
                                            onChange={(e) => updateCustomClusterTopic(0, e.target.value)}
                                        />
                                        {/* {customClusterTopics.map((topic, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    className="input input-bordered flex-1"
                                                    placeholder={`Cluster topic ${index + 1}`}
                                                    value={topic}
                                                    onChange={(e) => updateCustomClusterTopic(index, e.target.value)}
                                                />
                                                {customClusterTopics.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => removeCustomClusterTopic(index)}
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {customClusterTopics.length < 10 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm"
                                                onClick={addCustomClusterTopic}
                                            >
                                                Add another topic
                                            </button>
                                        )} */}
                                        {errors.customClusterTopics && (
                                            <p className="text-sm text-red-600">{errors.customClusterTopics}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Common Fields - Article Format */}
                <div className="mb-6 border-t pt-6">
                    <SelectInput
                        label="Article Format *"
                        options={articleFormatOptions}
                        selectedValue={articleFormat}
                        onChange={setArticleFormat}
                    />
                    {errors.articleFormat && (
                        <p className="text-sm text-red-600 -mt-4 mb-4">{errors.articleFormat}</p>
                    )}
                </div>

                {/* Writing Tone */}
                <div className="mb-6">
                    <SelectInput
                        label="Writing Tone"
                        options={writingToneOptions}
                        selectedValue={writingTone}
                        onChange={setWritingTone}
                    />
                </div>

                {/* Target Audience */}
                <div className="mb-6">
                    <SelectInput
                        label="Target Audience"
                        options={targetAudienceOptions}
                        selectedValue={targetAudience}
                        onChange={setTargetAudience}
                    />
                </div>

                {/* Word Count */}
                <div className="mb-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                        Word Count
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {wordCountOptions.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${wordCount === option.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="wordCount"
                                    value={option.value}
                                    checked={wordCount === option.value}
                                    onChange={(e) => setWordCount(e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-900">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* SEO Keywords */}
                <div className="mb-6 border-t pt-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-3">
                        SEO Keywords (Optional)
                    </label>
                    <div className="space-y-4">
                        <FormInput
                            id="primaryKeyword"
                            label="Primary keyword"
                            placeholder="e.g., best travel destinations"
                            value={primaryKeyword}
                            onChange={setPrimaryKeyword}
                        />
                        <FormInput
                            id="secondaryKeywords"
                            label="Secondary keywords"
                            placeholder="e.g., budget travel, solo travel, adventure"
                            value={secondaryKeywords}
                            onChange={setSecondaryKeywords}
                        />
                        <p className="text-xs text-gray-500">Separate multiple keywords with commas</p>
                    </div>
                </div>

                {/* Advanced Options - Collapsible */}
                <div className="mb-6 border-t pt-6">
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <DisclosureButton className="flex w-full items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200">
                                    <span className="text-lg font-semibold text-gray-700">Advanced Options</span>
                                    {open ? (
                                        <MinusSmallIcon className="size-5 text-gray-600" />
                                    ) : (
                                        <PlusSmallIcon className="size-5 text-gray-600" />
                                    )}
                                </DisclosureButton>
                                <DisclosurePanel className="mt-4 space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={includeFAQ}
                                            onChange={(e) => setIncludeFAQ(e.target.checked)}
                                            className="checkbox checkbox-primary mr-2"
                                        />
                                        <span className="text-gray-700">Include FAQ section</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={includeComparisonTable}
                                            onChange={(e) => setIncludeComparisonTable(e.target.checked)}
                                            className="checkbox checkbox-primary mr-2"
                                        />
                                        <span className="text-gray-700">Include comparison table</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={includeProsCons}
                                            onChange={(e) => setIncludeProsCons(e.target.checked)}
                                            className="checkbox checkbox-primary mr-2"
                                        />
                                        <span className="text-gray-700">Include pros & cons lists</span>
                                    </label>
                                </DisclosurePanel>
                            </>
                        )}
                    </Disclosure>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => window.history.back()}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Generating...
                            </>
                        ) : (
                            '✨ Generate Content'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

