import React from 'react'
import Image from 'next/image'
import SelectInput from '@/app/components/SelectInput'
import { Category } from '@/app/types'
import { PageType } from '@prisma/client'

interface WriteFormProps {
    title: string
    description: string
    image: string
    categories: Category[]
    selectedCategory: string
    pageType: PageType
    pageTypeOptions: { label: string; value: string }[]
    onChange: {
        title: (val: string) => void
        description: (val: string) => void
        image: (val: string) => void
        category: (val: string) => void
        type: (val: PageType) => void
    }
    onCreateCategory: (name: string) => Promise<{ label: string; value: string } | null>
}

const WriteForm: React.FC<WriteFormProps> = ({
    title,
    description,
    image,
    categories,
    selectedCategory,
    pageType,
    pageTypeOptions,
    onChange,
    onCreateCategory,
}) => {
    return (
        <>
            <div className="max-w-screen-lg mx-auto bg-white shadow-md rounded-lg p-6">
                {/* Title */}
                <div className="mb-4">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Title</label>
                    <input
                        type="text"
                        className="border border-gray-300 p-3 w-full rounded-md focus:ring focus:ring-blue-200 focus:outline-none bg-white"
                        placeholder="Enter title here..."
                        value={title}
                        onChange={(e) => onChange.title(e.target.value)}
                    />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                        className="border border-gray-300 p-3 w-full rounded-md focus:ring focus:ring-blue-200 focus:outline-none bg-white"
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
                    onChange={(val) => onChange.type(val as PageType)}
                />

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
            </div>

            {/* Cover Image Preview */}
            <div className="mb-4">
                <label className="block text-lg font-semibold text-gray-700 mb-2 mt-4">Cover Image</label>
                <div className="relative w-full aspect-[3/1] border rounded-md overflow-hidden">
                    <Image
                        src={image}
                        alt="Article cover image"
                        fill
                        className="object-cover cursor-pointer block"
                        onClick={() => {
                            const url = window.prompt('Enter Image URL', image)
                            if (url) onChange.image(url)
                        }}
                        priority
                    />
                </div>
            </div>
        </>
    )
}

export default WriteForm
