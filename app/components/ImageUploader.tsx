'use client'

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import AlertMessage from './AlertMessage';

interface ImageUploaderProps {
    onImageUploaded?: (imageUrl: string) => void;
    initialImageUrl?: string;
    label?: string;
    showPreview?: boolean;
}

/**
 * ImageUploader Component
 * 
 * A reusable component for uploading images to Cloudinary via:
 * 1. File upload from device
 * 2. URL upload (fetches and hosts on Cloudinary)
 * 
 * Features:
 * - Drag & drop file upload
 * - URL input for external images
 * - Image preview
 * - Copy URL to clipboard
 * - Loading states
 * - Error handling
 */
export default function ImageUploader({
    onImageUploaded,
    initialImageUrl = '',
    label = 'Upload Image',
    showPreview = true,
}: ImageUploaderProps) {
    const [imageUrl, setImageUrl] = useState<string>(initialImageUrl);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file' });
            return;
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setMessage({ type: 'error', text: 'File size must be less than 10MB' });
            return;
        }

        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        setLoading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/images/upload-file', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success && data.imageUrl) {
                setImageUrl(data.imageUrl);
                setMessage({ type: 'success', text: 'Image uploaded successfully!' });
                onImageUploaded?.(data.imageUrl);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to upload image' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to upload image',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUrlUpload = async () => {
        if (!urlInput.trim()) {
            setMessage({ type: 'error', text: 'Please enter an image URL' });
            return;
        }

        // Validate URL format
        try {
            new URL(urlInput);
        } catch {
            setMessage({ type: 'error', text: 'Invalid URL format' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/images/upload-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrl: urlInput,
                    fileName: `image-${Date.now()}`,
                }),
            });

            const data = await response.json();

            if (data.success && data.imageUrl) {
                setImageUrl(data.imageUrl);
                setUrlInput('');
                setMessage({ type: 'success', text: 'Image uploaded successfully!' });
                onImageUploaded?.(data.imageUrl);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to upload image from URL' });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to upload image from URL',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            uploadFile(file);
        } else {
            setMessage({ type: 'error', text: 'Please drop an image file' });
        }
    };

    const copyToClipboard = async () => {
        if (!imageUrl) return;

        try {
            await navigator.clipboard.writeText(imageUrl);
            setMessage({ type: 'success', text: 'URL copied to clipboard!' });
            setTimeout(() => setMessage(null), 2000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to copy URL' });
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                    {label}
                </label>
            )}

            {message && (
                <AlertMessage message={message} onClose={() => setMessage(null)} />
            )}

            {/* Upload Method Tabs */}
            <div className="tabs tabs-boxed mb-4">
                <button
                    className={`tab ${uploadMethod === 'file' ? 'tab-active' : ''}`}
                    onClick={() => setUploadMethod('file')}
                >
                    📁 Upload File
                </button>
                <button
                    className={`tab ${uploadMethod === 'url' ? 'tab-active' : ''}`}
                    onClick={() => setUploadMethod('url')}
                >
                    🌐 From URL
                </button>
            </div>

            {/* File Upload Section */}
            {uploadMethod === 'file' && (
                <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={loading}
                    />
                    {loading ? (
                        <div className="flex flex-col items-center gap-2">
                            <span className="loading loading-spinner loading-lg"></span>
                            <p className="text-gray-600">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <svg
                                className="w-12 h-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <p className="text-gray-600">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500">
                                PNG, JPG, GIF up to 10MB
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* URL Upload Section */}
            {uploadMethod === 'url' && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            className="input input-bordered flex-1"
                            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleUrlUpload();
                                }
                            }}
                            disabled={loading}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleUrlUpload}
                            disabled={loading || !urlInput.trim()}
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                'Upload'
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">
                        Enter a URL to an image. It will be fetched and uploaded to Cloudinary.
                    </p>
                </div>
            )}

            {/* Image Preview */}
            {showPreview && imageUrl && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-700">Preview</h3>
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={copyToClipboard}
                            title="Copy URL to clipboard"
                        >
                            📋 Copy URL
                        </button>
                    </div>
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                            src={imageUrl}
                            alt="Uploaded image preview"
                            fill
                            className="object-contain"
                            sizes="100vw"
                        />
                    </div>
                    <div className="mt-2">
                        <input
                            type="text"
                            className="input input-bordered input-sm w-full text-xs"
                            value={imageUrl}
                            readOnly
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

