'use client'

import React, { useState } from 'react'

type Tag = {
    id: string
    name: string
    slug: string
}

type Props = {
    label: string
    tags: Tag[]
    selectedTagIds: string[]
    onChange: (tagIds: string[]) => void
    onCreateTag?: (name: string) => Promise<Tag | null>
}

const TagsInput = ({
    label,
    tags,
    selectedTagIds,
    onChange,
    onCreateTag,
}: Props) => {
    const [creating, setCreating] = useState(false)
    const [newTagName, setNewTagName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1)

    const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id))
    const availableTags = tags.filter(tag =>
        !selectedTagIds.includes(tag.id) &&
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Reset highlighted index when search term or available tags change
    React.useEffect(() => {
        setHighlightedIndex(-1)
    }, [searchTerm, availableTags.length])

    const handleAddTag = (tagId: string) => {
        if (!selectedTagIds.includes(tagId)) {
            onChange([...selectedTagIds, tagId])
        }
        setSearchTerm('')
    }

    const handleRemoveTag = (tagId: string) => {
        onChange(selectedTagIds.filter(id => id !== tagId))
    }

    const formatTagDisplay = (tagName: string) => {
        // Replace dashes with spaces and capitalize each word
        return tagName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
    }

    const handleCreateTag = async () => {
        if (!newTagName.trim() || !onCreateTag) return

        const created = await onCreateTag(newTagName.trim())
        if (created) {
            onChange([...selectedTagIds, created.id])
            setNewTagName('')
            setCreating(false)
            setSearchTerm('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            // Select the highlighted tag, or first available tag if none highlighted
            if (availableTags.length > 0) {
                const indexToSelect = highlightedIndex >= 0 ? highlightedIndex : 0
                handleAddTag(availableTags[indexToSelect].id)
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault()
            // Move highlight down
            if (availableTags.length > 0) {
                setHighlightedIndex((prev) =>
                    prev < availableTags.length - 1 ? prev + 1 : 0
                )
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            // Move highlight up
            if (availableTags.length > 0) {
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : availableTags.length - 1
                )
            }
        } else if (e.key === 'Escape') {
            // Clear search and reset highlight
            setSearchTerm('')
            setHighlightedIndex(-1)
        }
    }

    return (
        <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-2">{label}</label>

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedTags.map(tag => (
                        <span
                            key={tag.id}
                            className="badge badge-primary badge-lg cursor-pointer rounded-sm"
                            onClick={() => handleRemoveTag(tag.id)}
                        >
                            {formatTagDisplay(tag.name)} ×
                        </span>
                    ))}
                </div>
            )}

            {/* Tag Selection Input */}
            <div className="relative">
                <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Type to search or add tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setCreating(false)}
                    onKeyDown={handleKeyDown}
                />

                {/* Dropdown with available tags */}
                {searchTerm && availableTags.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {availableTags.map((tag, index) => (
                            <div
                                key={tag.id}
                                className={`px-4 py-2 cursor-pointer ${index === highlightedIndex
                                    ? 'bg-primary text-primary-content'
                                    : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => handleAddTag(tag.id)}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                {tag.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create New Tag Option */}
            {onCreateTag && (
                <div className="mt-2">
                    {!creating ? (
                        <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                                setCreating(true)
                                setSearchTerm('')
                            }}
                        >
                            + Create New Tag
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input input-bordered flex-1"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="New tag name"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        handleCreateTag()
                                    }
                                }}
                            />
                            <button
                                className="btn btn-outline btn-primary"
                                onClick={handleCreateTag}
                            >
                                Save
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setCreating(false)
                                    setNewTagName('')
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TagsInput

