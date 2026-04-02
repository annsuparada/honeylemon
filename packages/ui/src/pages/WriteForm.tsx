'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PageType } from '@prisma/client';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline';
import FormInput from '../components/forms/FormInput';
import SelectInput from '../components/forms/SelectInput';
import TagsInput from '../components/forms/TagsInput';
import ImageUploader from '../components/media/ImageUploader';
import type { WriteFormCategory } from '../types/write-page';

const PAGE_TYPES_REQUIRING_SINGLE_TAG: PageType[] = [PageType.DESTINATION];

const requiresSingleTag = (pageType: PageType): boolean => {
    return PAGE_TYPES_REQUIRING_SINGLE_TAG.includes(pageType);
};

const getPageTypeDisplayName = (pageType: PageType): string => {
    return pageType.charAt(0) + pageType.slice(1).toLowerCase().replace(/_/g, ' ');
};

type Tag = {
    id: string;
    name: string;
    slug: string;
};

export interface WriteFormProps {
    title: string;
    description: string;
    excerpt: string;
    image: string;
    heroImage: string;
    categories: WriteFormCategory[];
    selectedCategory: string;
    pageType: PageType;
    pageTypeOptions: { label: string; value: string }[];
    tags: Tag[];
    selectedTagIds: string[];
    metaTitle: string;
    metaDescription: string;
    focusKeyword: string;
    featured: boolean;
    pillarPage: boolean;
    trending: boolean;
    publishedAt: string;
    faqs: Array<{ question: string; answer: string }>;
    itemListItems: Array<{ name: string; url: string }>;
    pillarWarning?: string | null;
    onChange: {
        title: (val: string) => void;
        description: (val: string) => void;
        excerpt: (val: string) => void;
        image: (val: string) => void;
        heroImage: (val: string) => void;
        category: (val: string) => void;
        type: (val: PageType) => void;
        tags: (tagIds: string[]) => void;
        metaTitle: (val: string) => void;
        metaDescription: (val: string) => void;
        focusKeyword: (val: string) => void;
        featured: (val: boolean) => void;
        pillarPage: (val: boolean) => void;
        trending: (val: boolean) => void;
        publishedAt: (val: string) => void;
    };
    onCreateCategory: (name: string) => Promise<{ label: string; value: string } | null>;
    onCreateTag: (name: string) => Promise<Tag | null>;
    onChangeFaqs: (faqs: Array<{ question: string; answer: string }>) => void;
    onChangeItemListItems: (items: Array<{ name: string; url: string }>) => void;
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
                <FormInput
                    id="title-input"
                    label="Title"
                    type="text"
                    placeholder="Enter title here..."
                    value={title}
                    onChange={onChange.title}
                />

                <FormInput
                    id="description-textarea"
                    label="Description"
                    type="textarea"
                    placeholder="Write a short description... (300 characters max)"
                    value={description}
                    onChange={onChange.description}
                    rows={4}
                />

                <FormInput
                    id="excerpt-textarea"
                    label="Excerpt"
                    type="textarea"
                    placeholder="Write a brief excerpt (auto-generated if left empty)..."
                    value={excerpt}
                    onChange={onChange.excerpt}
                    rows={3}
                />
                <p className="text-xs text-base-content/60 mt-[-1rem] mb-4">Short summary for previews and listings</p>

                <SelectInput
                    label="Category"
                    options={categories.map((cat) => ({ label: cat.name, value: cat.id }))}
                    selectedValue={selectedCategory}
                    onChange={onChange.category}
                    enableCreate={true}
                    onCreateNew={onCreateCategory}
                />

                <SelectInput
                    label="Page Type"
                    options={pageTypeOptions}
                    selectedValue={pageType}
                    onChange={(val) => {
                        const newType = val as PageType;
                        if (requiresSingleTag(newType) && selectedTagIds.length > 1) {
                            onChange.tags([selectedTagIds[0]]);
                        }
                        onChange.type(newType);
                    }}
                />

                <div>
                    <TagsInput
                        label="Tags"
                        tags={tags}
                        selectedTagIds={selectedTagIds}
                        onChange={(newTagIds) => {
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
                                    <p className="text-xs text-base-content/80 mt-1">
                                        Changing the tag will change the route to{' '}
                                        <code className="bg-base-200 px-1 rounded">/destinations/[tag-slug]</code>
                                    </p>
                                    {selectedTagIds.length > 0 && (
                                        <p className="text-xs text-base-content/60 mt-1 italic">
                                            Current tag: {tags.find((t) => t.id === selectedTagIds[0])?.name || 'N/A'}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    {pageType !== PageType.BLOG_POST &&
                        !requiresSingleTag(pageType) &&
                        selectedTagIds.length === 0 && (
                            <div className="mt-2 p-3 bg-info/10 border border-info/30 rounded-lg">
                                <p className="text-sm text-info font-medium">
                                    ℹ️ {getPageTypeDisplayName(pageType)} pages require at least 1 tag when publishing.
                                </p>
                            </div>
                        )}
                </div>

                <div className="mt-4">
                    <ImageUploader
                        label="Hero Image"
                        initialImageUrl={heroImage}
                        onImageUploaded={(url) => {
                            onChange.heroImage(url);
                            if (
                                !image ||
                                image ===
                                    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                            ) {
                                onChange.image(url);
                            }
                        }}
                        showPreview={true}
                    />
                </div>

                <div className="mt-6">
                    <Disclosure>
                        {({ open }) => (
                            <>
                                <DisclosureButton className="flex w-full items-center justify-between p-4 bg-base-200 hover:bg-base-300 rounded-lg border border-base-300">
                                    <span className="text-lg font-semibold text-base-content">SEO Fields</span>
                                    {open ? (
                                        <MinusSmallIcon className="size-5 text-base-content/80" />
                                    ) : (
                                        <PlusSmallIcon className="size-5 text-base-content/80" />
                                    )}
                                </DisclosureButton>
                                <DisclosurePanel className="mt-4 space-y-4">
                                    <div>
                                        <FormInput
                                            id="meta-title"
                                            label="Meta Title"
                                            type="text"
                                            placeholder="Custom SEO title (defaults to post title if empty)"
                                            value={metaTitle}
                                            onChange={onChange.metaTitle}
                                        />
                                        <p className="text-xs text-base-content/60 mt-[-1rem] mb-4">
                                            Recommended: 50-60 characters
                                        </p>
                                    </div>
                                    <div>
                                        <FormInput
                                            id="meta-description"
                                            label="Meta Description"
                                            type="textarea"
                                            placeholder="Custom meta description for search engines"
                                            value={metaDescription}
                                            onChange={onChange.metaDescription}
                                            rows={3}
                                        />
                                        <p className="text-xs text-base-content/60 mt-[-1rem] mb-4">
                                            Recommended: 150-160 characters
                                        </p>
                                    </div>
                                    <FormInput
                                        id="focus-keyword"
                                        label="Focus Keyword"
                                        type="text"
                                        placeholder="Primary SEO keyword (e.g., 'mexico travel guide')"
                                        value={focusKeyword}
                                        onChange={onChange.focusKeyword}
                                    />
                                </DisclosurePanel>
                            </>
                        )}
                    </Disclosure>
                </div>

                <div className="mt-6">
                    <label className="block text-lg font-semibold text-base-content mb-3">Special Flags</label>
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

                <FormInput
                    id="published-at"
                    label="Publish Date"
                    type="text"
                    placeholder="YYYY-MM-DDTHH:mm (e.g., 2025-01-15T14:30)"
                    value={publishedAt}
                    onChange={onChange.publishedAt}
                />
                <p className="text-xs text-base-content/60 mt-[-1rem] mb-4">
                    Schedule publication for a future date (leave empty for immediate publish). Format:
                    datetime-local
                </p>

                <div className="mt-6">
                    <label className="block text-lg font-semibold text-base-content mb-4">FAQs</label>
                    {faqs.map((faq, index) => {
                        const displayQuestion = faq.question || `FAQ #${index + 1}`;

                        return (
                            <Disclosure key={index} as="div" className="mb-4">
                                {({ open }) => (
                                    <>
                                        <div className="border border-base-300 rounded-lg overflow-hidden">
                                            <DisclosureButton className="flex w-full items-center justify-between p-4 bg-base-200 hover:bg-base-300 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {open ? (
                                                        <MinusSmallIcon className="size-5 text-base-content/80" />
                                                    ) : (
                                                        <PlusSmallIcon className="size-5 text-base-content/80" />
                                                    )}
                                                    <span className="text-sm font-medium text-base-content text-left">
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
                                                <FormInput
                                                    id={`faq-question-${index}`}
                                                    label="Question"
                                                    type="text"
                                                    placeholder="Enter question..."
                                                    value={faq.question}
                                                    onChange={(value) => handleFaqChange(index, 'question', value)}
                                                />
                                                <FormInput
                                                    id={`faq-answer-${index}`}
                                                    label="Answer"
                                                    type="textarea"
                                                    placeholder="Enter answer..."
                                                    value={faq.answer}
                                                    onChange={(value) => handleFaqChange(index, 'answer', value)}
                                                    rows={3}
                                                />
                                            </DisclosurePanel>
                                        </div>
                                    </>
                                )}
                            </Disclosure>
                        );
                    })}
                    <div className="flex justify-end mt-4">
                        <button type="button" className="btn btn-sm btn-primary" onClick={handleAddFaq}>
                            Add FAQ
                        </button>
                    </div>
                    {faqs.length === 0 && (
                        <p className="text-sm text-base-content/60 italic mt-2">
                            No FAQs added yet. Click &quot;Add FAQ&quot; to create one.
                        </p>
                    )}
                </div>

                <div className="mt-6">
                    <label className="block text-lg font-semibold text-base-content mb-4">
                        Item List (for SEO Schema)
                    </label>
                    <p className="text-sm text-base-content/60 mb-4">
                        Add items to generate ItemList structured data. Useful for list posts (e.g., &quot;Top 12
                        Resorts&quot;).
                    </p>
                    {(itemListItems || []).map((item, index) => {
                        const displayName = item.name || `Item #${index + 1}`;

                        return (
                            <Disclosure key={index} as="div" className="mb-4">
                                {({ open }) => (
                                    <>
                                        <div className="border border-base-300 rounded-lg overflow-hidden">
                                            <DisclosureButton className="flex w-full items-center justify-between p-4 bg-base-200 hover:bg-base-300 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    {open ? (
                                                        <MinusSmallIcon className="size-5 text-base-content/80" />
                                                    ) : (
                                                        <PlusSmallIcon className="size-5 text-base-content/80" />
                                                    )}
                                                    <span className="text-sm font-medium text-base-content text-left">
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
                                                <FormInput
                                                    id={`item-name-${index}`}
                                                    label="Name"
                                                    type="text"
                                                    placeholder="Enter item name (e.g., Grand Velas Riviera Maya)..."
                                                    value={item.name}
                                                    onChange={(value) => handleItemListItemChange(index, 'name', value)}
                                                />
                                                <FormInput
                                                    id={`item-url-${index}`}
                                                    label="URL"
                                                    type="text"
                                                    placeholder="Enter URL (e.g., https://trip.tp.st/k3xThnY1)..."
                                                    value={item.url}
                                                    onChange={(value) => handleItemListItemChange(index, 'url', value)}
                                                />
                                            </DisclosurePanel>
                                        </div>
                                    </>
                                )}
                            </Disclosure>
                        );
                    })}
                    <div className="flex justify-end mt-4">
                        <button type="button" className="btn btn-sm btn-primary" onClick={handleAddItemListItem}>
                            Add Item
                        </button>
                    </div>
                    {(!itemListItems || itemListItems.length === 0) && (
                        <p className="text-sm text-base-content/60 italic mt-2">
                            No items added yet. Click &quot;Add Item&quot; to create one.
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-lg font-semibold text-base-content mb-2 mt-4">Cover Image Preview</label>
                <div
                    className="relative w-full overflow-hidden rounded-md border-none"
                    style={{ aspectRatio: '3 / 1' }}
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
    );
};

export default WriteForm;
