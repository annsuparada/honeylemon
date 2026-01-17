'use client'

import React, { useState } from 'react'

type Option = {
    label: string
    value: string
}

type Props = {
    label: string
    options: Option[]
    selectedValue: string
    onChange: (value: string) => void
    onCreateNew?: (newValue: string) => Promise<Option | null>
    enableCreate?: boolean
    className?: string
    labelLight?: boolean // Optional: make label light colored
    hideLabel?: boolean // Optional: hide the label (useful for compact filters)
    compact?: boolean // Optional: compact styling for filters
}

const SelectInput = ({
    label,
    options,
    selectedValue,
    onChange,
    onCreateNew,
    enableCreate = false,
    className,
    labelLight = false,
    hideLabel = false,
    compact = false,
}: Props) => {
    const [creating, setCreating] = useState(false)
    const [newValue, setNewValue] = useState('')

    const handleCreate = async () => {
        if (!newValue.trim() || !onCreateNew) return

        const created = await onCreateNew(newValue.trim())
        if (created) {
            onChange(created.value)
            setNewValue('')
            setCreating(false)
        }
    }

    const labelClass = compact
        ? `block text-sm font-semibold mb-1 ${labelLight ? 'text-base-content' : 'text-gray-900'}`
        : `block text-lg font-bold mb-2 ${labelLight ? 'text-base-content' : 'text-gray-900'}`;

    const containerClass = compact ? "mb-4" : enableCreate ? "grid grid-cols-1 md:grid-cols-2 gap-6 items-end mb-6" : "mb-6";

    return (
        <div className={containerClass}>
            <div className={className}>
                {!hideLabel && (
                    <label className={labelClass}>{label}</label>
                )}
                <select
                    onChange={(e) => onChange(e.target.value)}
                    value={selectedValue}
                    className={`select select-bordered w-full bg-white border-base-content ${compact ? 'select-sm' : ''}`}
                >
                    <option value="">{`Select ${label}`}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            {enableCreate && (
                <div>
                    {!creating ? (
                        <button
                            type="button"
                            className="btn btn-outline bg-white border-base-content w-full"
                            onClick={() => setCreating(true)}
                        >
                            Create New {label}
                        </button>
                    ) : (
                        <div className="flex gap-2 mt-2">
                            <input
                                type="text"
                                className="input input-bordered bg-white border-base-content"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder={`New ${label} name`}
                            />
                            <button className="btn btn-outline btn-primary" onClick={handleCreate}>Save</button>
                            <button className="btn btn-outline" onClick={() => {
                                setCreating(false)
                                setNewValue('')
                            }}>Cancel</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SelectInput
