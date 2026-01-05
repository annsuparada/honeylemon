import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import SelectInput from '@/app/components/SelectInput'
import TagsInput from '@/app/components/TagsInput'
import ImageUploader from '@/app/components/ImageUploader'
import { Category } from '@/app/types'
import { PageType } from '@prisma/client'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'

/**
 * Page types that require exactly 1 tag
 * Add page types here that should have this restriction
 */
const PAGE_TYPES_REQUIRING_SINGLE_TAG: PageType[] = [PageType.DESTINATION];

/**
 * Check if a page type requires exactly 1 tag
 */
const requiresSingleTag = (pageType: PageType): boolean => {
    return PAGE_TYPES_REQUIRING_SINGLE_TAG.includes(pageType);
};

/**
 * Get the display name for a page type (for warning messages)
 */
const getPageTypeDisplayName = (pageType: PageType): string => {
    return pageType.charAt(0) + pageType.slice(1).toLowerCase().replace(/_/g, ' ');
};

type Tag = {
    id: string
    name: string
    slug: string
}

interface WriteFormProps {
    title: string
    description: string
    excerpt: string
    image: string
    heroImage: string
    categories: Category[]
    selectedCategory: string
    pageType: PageType
    pageTypeOptions: { label: string; value: string }[]
    tags: Tag[]
    selectedTagIds: string[]
    metaTitle: string
    metaDescription: string
    focusKeyword: string
    featured: boolean
    pillarPage: boolean
    trending: boolean
    publishedAt: string
    faqs: Array<{ question: string; answer: string }>
    itemListItems: Array<{ name: string; url: string }>
    pillarWarning?: string | null
    onChange: {
        title: (val: string) => void
        description: (val: string) => void
        excerpt: (val: string) => void
        image: (val: string) => void
        heroImage: (val: string) => void
        category: (val: string) => void
        type: (val: PageType) => void
        tags: (tagIds: string[]) => void
        metaTitle: (val: string) => void
        metaDescription: (val: string) => void
        focusKeyword: (val: string) => void
        featured: (val: boolean) => void
        pillarPage: (val: boolean) => void
        trending: (val: boolean) => void
        publishedAt: (val: string) => void
    }
    onCreateCategory: (name: string) => Promise<{ label: string; value: string } | null>
    onCreateTag: (name: string) => Promise<Tag | null>
    onChangeFaqs: (faqs: Array<{ question: string; answer: string }>) => void
    onChangeItemListItems: (items: Array<{ name: string; url: string }>) => void
}

const WriteForm: React.FC<WriteFormProps> = ({
    title,
    description,
    excerpt,
    image,
    heroImage,
    categories,
    selectedCategory,
    pageType,
    pageTypeOptions,
    tags,
    selectedTagIds,
    metaTitle,
    metaDescription,
    focusKeyword,
    featured,
    pillarPage,
    trending,
    publishedAt,
    faqs,
    itemListItems,
    pillarWarning,
    onChange,
    onCreateCategory,
    onCreateTag,
    onChangeFaqs,
    onChangeItemListItems,
}) => {
    const [seoSectionOpen, setSeoSectionOpen] = useState(false);

    const handleAddFaq = () => {
        onChangeFaqs([...faqs, { question: '', answer: '' }]);
    };

    const handleRemoveFaq = (index: number) => {
        onChangeFaqs(faqs.filter((_, i) => i !== index));
    };

    const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
        const updatedFaqs = [...faqs];
        updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
        onChangeFaqs(updatedFaqs);
    };

    const handleAddItemListItem = () => {
        onChangeItemListItems([...(itemListItems || []), { name: '', url: '' }]);
    };

    const handleRemoveItemListItem = (index: number) => {
        onChangeItemListItems((itemListItems || []).filter((_, i) => i !== index));
    };

    const handleItemListItemChange = (index: number, field: 'name' | 'url', value: string) => {
        const updatedItems = [...(itemListItems || [])];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        onChangeItemListItems(updatedItems);
    };

    return (
        <>
            <div className="max-w-screen-lg mx-auto bg-white shadow-md rounded-lg p-6">
                {/* Title */}
                <div className="mb-4">
                    <label htmlFor="title-input" className="block text-lg font-semibold text-gray-700 mb-2">Title</label>
                    <input
                        id="title-input"
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Enter title here..."
                        value={title}
                        onChange={(e) => onChange.title(e.target.value)}
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label htmlFor="description-textarea" className="block text-lg font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                        id="description-textarea"
                        className="textarea textarea-bordered w-full"
                        placeholder="Write a short description... (300 characters max)"
                        value={description}
                        onChange={(e) => onChange.description(e.target.value)}
                        rows={4}
                    />
                </div>

                {/* Excerpt */}
                <div className="mb-4">
                    <label htmlFor="excerpt-textarea" className="block text-lg font-semibold text-gray-700 mb-2">Excerpt</label>
                    <textarea
                        id="excerpt-textarea"
                        className="textarea textarea-bordered w-full"
                        placeholder="Write a brief excerpt (auto-generated if left empty)..."
                        value={excerpt}
                        onChange={(e) => onChange.excerpt(e.target.value)}
                        rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Short summary for previews and listings</p>
                </div>

                {/* Category */}
                <SelectInput
                    label="Category"
                    options={categories.map((cat) => ({ label: cat.name, value: cat.id }))}
                    selectedValue={selectedCategory}
                    onChange={onChange.category}
                    enableCreate={true}
                    onCreateNew={onCreateCategory}
                />

                {/* Page Type */}
                <SelectInput
                    label="Page Type"
                    options={pageTypeOptions}
                    selectedValue={pageType}
                    onChange={(val) => {
                        const newType = val as PageType;
                        // If switching to a page type that requires single tag and multiple tags are selected, keep only the first one
                        if (requiresSingleTag(newType) && selectedTagIds.length > 1) {
                            onChange.tags([selectedTagIds[0]]);
                        }
                        onChange.type(newType);
                    }}
                />


                {/* Tags */}
                <div>
                    <TagsInput
                        label="Tags"
                        tags={tags}
                        selectedTagIds={selectedTagIds}
                        onChange={(newTagIds) => {
                            // Allow tag changes - user can remove and select a different tag
                            // Validation for required tags will happen on save
                            onChange.tags(newTagIds);
                        }}
                        onCreateTag={onCreateTag}
                        maxTags={requiresSingleTag(pageType) ? 1 : undefined}
                    />
                    {requiresSingleTag(pageType) && (
                        <div className="mt-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                            <p className="text-sm text-warning font-medium">
                                ⚠️ {getPageTypeDisplayName(pageType)} pages require exactly 1 tag.
                            </p>
                            {pageType === 'DESTINATION' && (
                                <>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Changing the tag will change the route to <code className="bg-gray-100 px-1 rounded">/destinations/[tag-slug]</code>
                                    </p>
                                    {selectedTagIds.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1 italic">
                                            Current tag: {tags.find(t => t.id === selectedTagIds[0])?.name || 'N/A'}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    {pageType !== PageType.BLOG_POST && !requiresSingleTag(pageType) && selectedTagIds.length === 0 && (
                        <div className="mt-2 p-3 bg-info/10 border border-info/30 rounded-lg">
                            <p className="text-sm text-info font-medium">
                                ℹ️ {getPageTypeDisplayName(pageType)} pages require at least 1 tag when publishing.
                            </p>
                        </div>
                    )}
                </div>

                {/* Hero Image Upload */}
                <div className="mt-4">
                    <ImageUploader
                        label="Hero Image"
                        initialImageUrl={heroImage}
                        onImageUploaded={(url) => {
                            onChange.heroImage(url);
                            // Also update legacy image field for backward compatibility
                            if (!image || image === 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') {
                                onChange.image(url);
                            }
                        }}
                        showPreview={true}
                    />
                </div>


                {/* SEO Fields Section (Collapsible) */}
                <div className="mt-6">
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <DisclosureButton className="flex w-full items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200">
                                    <span className="text-lg font-semibold text-gray-700">SEO Fields</span>
                                    {open ? (
                                        <MinusSmallIcon className="size-5 text-gray-600" />
                                    ) : (
                                        <PlusSmallIcon className="size-5 text-gray-600" />
                                    )}
                                </DisclosureButton>
                                <DisclosurePanel className="mt-4 space-y-4">
                                    <div>
                                        <label htmlFor="meta-title" className="block text-sm font-medium text-gray-700 mb-1">
                                            Meta Title
                                        </label>
                                        <input
                                            id="meta-title"
                                            type="text"
                                            className="input input-bordered w-full"
                                            placeholder="Custom SEO title (defaults to post title if empty)"
                                            value={metaTitle}
                                            onChange={(e) => onChange.metaTitle(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                                    </div>
                                    <div>
                                        <label htmlFor="meta-description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Meta Description
                                        </label>
                                        <textarea
                                            id="meta-description"
                                            className="textarea textarea-bordered w-full"
                                            placeholder="Custom meta description for search engines"
                                            value={metaDescription}
                                            onChange={(e) => onChange.metaDescription(e.target.value)}
                                            rows={3}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
                                    </div>
                                    <div>
                                        <label htmlFor="focus-keyword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Focus Keyword
                                        </label>
                                        <input
                                            id="focus-keyword"
                                            type="text"
                                            className="input input-bordered w-full"
                                            placeholder="Primary SEO keyword (e.g., 'mexico travel guide')"
                                            value={focusKeyword}
                                            onChange={(e) => onChange.focusKeyword(e.target.value)}
                                        />
                                    </div>
                                </DisclosurePanel>
                            </>
                        )}
                    </Disclosure>
                </div>

                {/* Special Flags */}
                <div className="mt-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-3">Special Flags</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={featured}
                                onChange={(e) => onChange.featured(e.target.checked)}
                            />
                            <span className="text-sm">⭐ Featured (Show on homepage)</span>
                        </label>
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={pillarPage}
                                    onChange={(e) => onChange.pillarPage(e.target.checked)}
                                />
                                <span className="text-sm">📚 Pillar Page (Main comprehensive guide)</span>
                            </label>
                            {pillarWarning && (
                                <div className="mt-2 ml-6 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                                    <p className="text-sm text-warning font-medium">{pillarWarning}</p>
                                </div>
                            )}
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={trending}
                                onChange={(e) => onChange.trending(e.target.checked)}
                            />
                            <span className="text-sm">🔥 Trending (Highlight as trending content)</span>
                        </label>
                    </div>
                </div>

                {/* Publish Date */}
                <div className="mt-4">
                    <label htmlFor="published-at" className="block text-lg font-semibold text-gray-700 mb-2">
                        Publish Date
                    </label>
                    <input
                        id="published-at"
                        type="datetime-local"
                        className="input input-bordered w-full"
                        value={publishedAt}
                        onChange={(e) => onChange.publishedAt(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Schedule publication for a future date (leave empty for immediate publish)</p>
                </div>

                {/* FAQs Section */}
                <div className="mt-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-4">FAQs</label>
                    {faqs.map((faq, index) => {
                        const displayQuestion = faq.question || `FAQ #${index + 1}`;

                        return (
                            <Disclosure key={index} as="div" className="mb-4">
                                {({ open }) => (
                                    <>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <DisclosureButton className="flex w-full items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {open ? (
                                                        <MinusSmallIcon className="size-5 text-gray-600" />
                                                    ) : (
                                                        <PlusSmallIcon className="size-5 text-gray-600" />
                                                    )}
                                                    <span className="text-sm font-medium text-gray-700 text-left">
                                                        {displayQuestion}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-ghost text-error ml-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFaq(index);
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </DisclosureButton>
                                            <DisclosurePanel className="p-4">
                                                <div className="mb-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                                    <input
                                                        type="text"
                                                        className="input input-bordered w-full"
                                                        placeholder="Enter question..."
                                                        value={faq.question}
                                                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                                                    <textarea
                                                        className="textarea textarea-bordered w-full"
                                                        placeholder="Enter answer..."
                                                        value={faq.answer}
                                                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                                        rows={3}
                                                    />
                                                </div>
                                            </DisclosurePanel>
                                        </div>
                                    </>
                                )}
                            </Disclosure>
                        );
                    })}
                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={handleAddFaq}
                        >
                            Add FAQ
                        </button>
                    </div>
                    {faqs.length === 0 && (
                        <p className="text-sm text-gray-500 italic mt-2">No FAQs added yet. Click "Add FAQ" to create one.</p>
                    )}
                </div>

                {/* ItemList Items Section */}
                <div className="mt-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-4">Item List (for SEO Schema)</label>
                    <p className="text-sm text-gray-500 mb-4">Add items to generate ItemList structured data. Useful for list posts (e.g., "Top 12 Resorts").</p>
                    {(itemListItems || []).map((item, index) => {
                        const displayName = item.name || `Item #${index + 1}`;

                        return (
                            <Disclosure key={index} as="div" className="mb-4">
                                {({ open }) => (
                                    <>
                                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                                            <DisclosureButton className="flex w-full items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {open ? (
                                                        <MinusSmallIcon className="size-5 text-gray-600" />
                                                    ) : (
                                                        <PlusSmallIcon className="size-5 text-gray-600" />
                                                    )}
                                                    <span className="text-sm font-medium text-gray-700 text-left">
                                                        {displayName}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-ghost text-error ml-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveItemListItem(index);
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </DisclosureButton>
                                            <DisclosurePanel className="p-4">
                                                <div className="mb-3">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                    <input
                                                        type="text"
                                                        className="input input-bordered w-full"
                                                        placeholder="Enter item name (e.g., Grand Velas Riviera Maya)..."
                                                        value={item.name}
                                                        onChange={(e) => handleItemListItemChange(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                                    <input
                                                        type="url"
                                                        className="input input-bordered w-full"
                                                        placeholder="Enter URL (e.g., https://trip.tp.st/k3xThnY1)..."
                                                        value={item.url}
                                                        onChange={(e) => handleItemListItemChange(index, 'url', e.target.value)}
                                                    />
                                                </div>
                                            </DisclosurePanel>
                                        </div>
                                    </>
                                )}
                            </Disclosure>
                        );
                    })}
                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={handleAddItemListItem}
                        >
                            Add Item
                        </button>
                    </div>
                    {(!itemListItems || itemListItems.length === 0) && (
                        <p className="text-sm text-gray-500 italic mt-2">No items added yet. Click "Add Item" to create one.</p>
                    )}
                </div>
            </div>

            {/* Cover Image Preview */}
            <div className="mb-4">
                <label className="block text-lg font-semibold text-gray-700 mb-2 mt-4">Cover Image Preview</label>
                <div
                    className="relative w-full overflow-hidden rounded-md border-none"
                    style={{ aspectRatio: "3 / 1" }}
                >
                    <Image
                        src={heroImage || image}
                        alt="Article cover image"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                </div>
            </div>
        </>
    )
}

export default WriteForm
