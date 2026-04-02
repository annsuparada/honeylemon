import React, { useEffect, useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';

interface Props {
    id: string;
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'textarea' | 'password' | 'email';
    rows?: number;
    disabled?: boolean;
    error?: string; // Optional manual error override
    labelLight?: boolean; // Optional: make label light colored
}

export default function FormInput({
    id,
    label,
    placeholder = '',
    value,
    onChange,
    type = 'text',
    rows = 4,
    disabled = false,
    error,
    labelLight = false,
}: Props) {
    const [internalError, setInternalError] = useState<string | undefined>();

    useEffect(() => {
        if (type === 'email') {
            const isValidEmail = value.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            setInternalError(isValidEmail ? undefined : 'Not a valid email address.');
        } else {
            setInternalError(undefined);
        }
    }, [type, value]);

    const finalError = error ?? internalError;

    const baseClass = `block w-full rounded-md py-1.5 px-3 text-base focus:outline-none focus:ring focus:ring-primary/20 disabled:bg-gray-100 disabled:cursor-not-allowed ${finalError
        ? 'border border-error text-error-content placeholder:text-error/60 bg-white outline-1 -outline-offset-1 outline-error/30 focus:outline-error'
        : 'border border-base-content bg-white text-base-content'
        }`;

    return (
        <div className="mb-4">
            <label htmlFor={id} className={`block text-lg font-bold mb-2 ${labelLight ? 'text-base-content' : 'text-gray-900'}`}>
                {label}
            </label>

            <div className="relative">
                {type === 'textarea' ? (
                    <textarea
                        id={id}
                        rows={rows}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        className={baseClass}
                        aria-invalid={!!finalError}
                        aria-describedby={finalError ? `${id}-error` : undefined}
                    />
                ) : (
                    <input
                        id={id}
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        disabled={disabled}
                        className={`${baseClass} pr-10`}
                        aria-invalid={!!finalError}
                        aria-describedby={finalError ? `${id}-error` : undefined}
                    />
                )}

                {finalError && (
                    <ExclamationCircleIcon
                        aria-hidden="true"
                        className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-error pointer-events-none"
                    />
                )}
            </div>

            {finalError && (
                <p id={`${id}-error`} className="mt-2 text-sm text-error">
                    {finalError}
                </p>
            )}
        </div>
    );
}

