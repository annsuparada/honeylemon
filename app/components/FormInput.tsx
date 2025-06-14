import React from 'react';

interface Props {
    id: string;
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'textarea' | 'password';
    rows?: number;
    disabled?: boolean
}

export default function FormInput({
    id,
    label,
    placeholder = '',
    value,
    onChange,
    type = 'text',
    rows = 4,
    disabled = false
}: Props) {
    const commonClass =
        'border border-gray-300 p-3 w-full rounded-md focus:ring focus:ring-blue-200 focus:outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed';

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-lg font-semibold text-gray-700 mb-2">
                {label}
            </label>
            {type === 'textarea' ? (
                <textarea
                    id={id}
                    rows={rows}
                    className={commonClass}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                />
            ) : (
                <input
                    id={id}
                    type="text"
                    className={commonClass}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                />
            )}
        </div>
    );
}
