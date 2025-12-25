import React from 'react'
import Image from 'next/image'
import SelectInput from '@/app/components/SelectInput'
import TagsInput from '@/app/components/TagsInput'
import { Category } from '@/app/types'
import { PageType } from '@prisma/client'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'

type Tag = {
    id: string
    name: string
    slug: string
}

interface WriteFormProps {
    title: string
    description: string
    image: string
    categories: Category[]
    selectedCategory: string
    pageType: PageType
    pageTypeOptions: { label: string; value: string }[]
    tags: Tag[]
    selectedTagIds: string[]
    faqs: Array<{ question: string; answer: string }>
    itemListItems: Array<{ name: string; url: string }>
    onChange: {
        title: (val: string) => void
        description: (val: string) => void
        image: (val: string) => void
        category: (val: string) => void
        type: (val: PageType) => void
        tags: (tagIds: string[]) => void
    }
    onCreateCategory: (name: string) => Promise<{ label: string; value: string } | null>
    onCreateTag: (name: string) => Promise<Tag | null>
    onChangeFaqs: (faqs: Array<{ question: string; answer: string }>) => void
    onChangeItemListItems: (items: Array<{ name: string; url: string }>) => void
}

const WriteForm: React.FC<WriteFormProps> = ({
    title,
    description,
    image,
    categories,
    selectedCategory,
    pageType,
    pageTypeOptions,
    tags,
    selectedTagIds,
    faqs,
    itemListItems,
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
                        // If switching to DESTINATION and multiple tags are selected, keep only the first one
                        if (newType === 'DESTINATION' && selectedTagIds.length > 1) {
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
                            // Prevent removing the last tag for DESTINATION type
                            if (pageType === 'DESTINATION' && newTagIds.length === 0 && selectedTagIds.length > 0) {
                                return; // Don't allow removing the last tag
                            }
                            onChange.tags(newTagIds);
                        }}
                        onCreateTag={onCreateTag}
                        maxTags={pageType === 'DESTINATION' ? 1 : undefined}
                    />
                    {pageType === 'DESTINATION' && (
                        <div className="mt-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                            <p className="text-sm text-warning font-medium">
                                ⚠️ Destination pages require exactly 1 tag (the country name).
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Changing the tag will change the route to <code className="bg-gray-100 px-1 rounded">/destinations/[tag-slug]</code>
                            </p>
                            {selectedTagIds.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1 italic">
                                    Current tag: {tags.find(t => t.id === selectedTagIds[0])?.name || 'N/A'}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Add Image from URL */}
                <button
                    className="btn btn-outline bg-gray-100 mt-4"
                    onClick={() => {
                        const url = window.prompt('Enter Image URL', image)
                        if (url) onChange.image(url)
                    }}
                >
                    Add Image from URL
                </button>

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
                <label className="block text-lg font-semibold text-gray-700 mb-2 mt-4">Cover Image</label>
                <div
                    className="relative w-full overflow-hidden rounded-md border-none"
                    style={{ aspectRatio: "3 / 1" }}
                >
                    <Image
                        src={image}
                        alt="Article cover image"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        onClick={() => {
                            const url = window.prompt("Enter Image URL", image);
                            if (url) onChange.image(url);
                        }}
                        priority
                    />
                </div>



            </div>
        </>
    )
}

export default WriteForm
