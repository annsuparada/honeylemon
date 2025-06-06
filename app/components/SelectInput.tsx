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
}

const SelectInput = ({
    label,
    options,
    selectedValue,
    onChange,
    onCreateNew,
    enableCreate = false,
}: Props) => {
    const [creating, setCreating] = useState(false)
    const [newValue, setNewValue] = useState('')

    const handleCreate = async () => {
        if (!newValue.trim() || !onCreateNew) return

        const created = await onCreateNew(newValue.trim())
        if (created) {
            onChange(created.value) // auto-select new
            setNewValue('')
            setCreating(false)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mb-6">
            <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">{label}</label>
                <select
                    onChange={(e) => onChange(e.target.value)}
                    value={selectedValue}
                    className="border border-gray-300 p-3 w-full rounded-md focus:ring focus:ring-blue-200 focus:outline-none bg-white"
                >
                    <option value="">{`Select ${label}`}</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div>
                {enableCreate && !creating && (
                    <button
                        type="button"
                        className="btn btn-outline bg-gray-100 w-full"
                        onClick={() => setCreating(true)}
                    >
                        Create New {label}
                    </button>
                )}

                {enableCreate && creating && (
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            className="border border-gray-300 p-2 rounded-md w-full bg-white"
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
        </div>
    )
}

export default SelectInput
