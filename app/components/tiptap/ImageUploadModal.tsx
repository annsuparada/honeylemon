"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (url: string, alt: string, showCredit?: boolean, photographer?: string, photographerUrl?: string) => void;
}

interface UnsplashImage {
    id: string;
    url: string;
    thumbUrl: string;
    smallUrl: string;
    photographer: string;
    photographerUrl: string;
    description?: string;
    alt: string;
}

export default function ImageUploadModal({ isOpen, onClose, onInsert }: ImageUploadModalProps) {
    const [uploadMethod, setUploadMethod] = useState<"file" | "url" | "unsplash">("file");
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [altText, setAltText] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Unsplash search state
    const [unsplashQuery, setUnsplashQuery] = useState("");
    const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
    const [searchingUnsplash, setSearchingUnsplash] = useState(false);
    const [selectedUnsplashImage, setSelectedUnsplashImage] = useState<UnsplashImage | null>(null);
    const [showCredit, setShowCredit] = useState(true);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.type.startsWith("image/")) {
                setError("Please select an image file");
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError("File size must be less than 10MB");
                return;
            }
            setFile(selectedFile);
            setError("");
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setImageUrl(url);
        setError("");
        // Validate URL format
        if (url) {
            try {
                new URL(url);
                setPreview(url);
            } catch {
                setPreview(null);
            }
        } else {
            setPreview(null);
        }
    };

    const handleUnsplashSearch = async () => {
        if (!unsplashQuery.trim()) {
            setError("Please enter a search query");
            return;
        }

        setSearchingUnsplash(true);
        setError("");
        setSelectedUnsplashImage(null);

        try {
            const response = await fetch("/api/images/search-unsplash", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: unsplashQuery.trim(),
                    count: 12,
                }),
            });

            const data = await response.json();

            if (data.success && data.images) {
                setUnsplashImages(data.images);
                if (data.images.length === 0) {
                    setError("No images found. Try a different search query.");
                }
            } else {
                setError(data.error || "Failed to search Unsplash");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to search Unsplash");
        } finally {
            setSearchingUnsplash(false);
        }
    };

    const handleSelectUnsplashImage = (image: UnsplashImage) => {
        setSelectedUnsplashImage(image);
        setAltText(image.alt || "");
        setImageUrl(image.url);
        setPreview(image.url);
    };

    const handleUpload = async () => {
        setError("");
        setUploading(true);

        try {
            let cloudinaryUrl: string;
            let finalAltText = altText.trim();
            let finalPhotographer: string | undefined;
            let finalPhotographerUrl: string | undefined;
            let finalShowCredit = false;

            if (uploadMethod === "file") {
                if (!file) {
                    setError("Please select a file");
                    setUploading(false);
                    return;
                }

                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/images/upload-file", {
                    method: "POST",
                    body: formData,
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || "Failed to upload image");
                }

                cloudinaryUrl = data.imageUrl;
            } else if (uploadMethod === "url") {
                if (!imageUrl.trim()) {
                    setError("Please enter an image URL");
                    setUploading(false);
                    return;
                }

                // Validate URL
                try {
                    new URL(imageUrl);
                } catch {
                    setError("Invalid URL format");
                    setUploading(false);
                    return;
                }

                const response = await fetch("/api/images/upload-url", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ imageUrl }),
                });

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || "Failed to upload image from URL");
                }

                cloudinaryUrl = data.imageUrl;
            } else {
                // Unsplash - use Unsplash URL directly, no Cloudinary upload
                if (!selectedUnsplashImage) {
                    setError("Please select an image");
                    setUploading(false);
                    return;
                }

                // Use Unsplash URL directly without uploading to Cloudinary
                cloudinaryUrl = selectedUnsplashImage.url;
                finalAltText = altText.trim() || selectedUnsplashImage.alt;
                finalPhotographer = selectedUnsplashImage.photographer;
                finalPhotographerUrl = selectedUnsplashImage.photographerUrl;
                finalShowCredit = showCredit;
            }

            // Insert into editor
            onInsert(cloudinaryUrl, finalAltText, finalShowCredit, finalPhotographer, finalPhotographerUrl);

            // Reset form
            setFile(null);
            setImageUrl("");
            setAltText("");
            setPreview(null);
            setUploadMethod("file");
            setUnsplashQuery("");
            setUnsplashImages([]);
            setSelectedUnsplashImage(null);
            setShowCredit(true);
            setUploading(false);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload image");
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type.startsWith("image/")) {
            if (droppedFile.size > 10 * 1024 * 1024) {
                setError("File size must be less than 10MB");
                return;
            }
            setFile(droppedFile);
            setError("");
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(droppedFile);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Add Image</h2>
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-circle btn-ghost"
                            disabled={uploading}
                        >
                            ×
                        </button>
                    </div>

                    {/* Upload Method Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            className={`btn btn-sm flex-1 ${uploadMethod === "file" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => {
                                setUploadMethod("file");
                                setError("");
                                setPreview(null);
                            }}
                            disabled={uploading}
                        >
                            Upload File
                        </button>
                        <button
                            className={`btn btn-sm flex-1 ${uploadMethod === "url" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => {
                                setUploadMethod("url");
                                setError("");
                                setPreview(null);
                            }}
                            disabled={uploading}
                        >
                            Enter URL
                        </button>
                        <button
                            className={`btn btn-sm flex-1 ${uploadMethod === "unsplash" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => {
                                setUploadMethod("unsplash");
                                setError("");
                                setPreview(null);
                            }}
                            disabled={uploading}
                        >
                            Search Unsplash
                        </button>
                    </div>

                    {/* File Upload */}
                    {uploadMethod === "file" && (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
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
                                disabled={uploading}
                            />
                            {preview ? (
                                <div className="relative w-full h-48 mb-4">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="object-contain rounded"
                                    />
                                </div>
                            ) : (
                                <div className="py-8">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        PNG, JPG, GIF up to 10MB
                                    </p>
                                </div>
                            )}
                            {file && (
                                <p className="text-sm text-gray-600 mt-2">{file.name}</p>
                            )}
                        </div>
                    )}

                    {/* URL Input */}
                    {uploadMethod === "url" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={handleUrlChange}
                                placeholder="https://example.com/image.jpg"
                                className="input input-bordered w-full"
                                disabled={uploading}
                            />
                            {preview && (
                                <div className="relative w-full h-48 mt-4">
                                    <Image
                                        src={preview}
                                        alt="Preview"
                                        fill
                                        className="object-contain rounded border"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Unsplash Search */}
                    {uploadMethod === "unsplash" && (
                        <div className="mb-4 space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input input-bordered flex-1"
                                    placeholder="Search for images (e.g., tokyo travel, beach sunset)"
                                    value={unsplashQuery}
                                    onChange={(e) => setUnsplashQuery(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnsplashSearch();
                                        }
                                    }}
                                    disabled={searchingUnsplash || uploading}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUnsplashSearch}
                                    disabled={searchingUnsplash || uploading || !unsplashQuery.trim()}
                                >
                                    {searchingUnsplash ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        "Search"
                                    )}
                                </button>
                            </div>

                            {/* Unsplash Image Grid */}
                            {unsplashImages.length > 0 && (
                                <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                                    {unsplashImages.map((image) => (
                                        <div
                                            key={image.id}
                                            className={`relative w-full cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedUnsplashImage?.id === image.id
                                                ? "border-primary ring-2 ring-primary"
                                                : "border-gray-200 hover:border-primary"
                                                }`}
                                            style={{ aspectRatio: '1 / 1' }}
                                            onClick={() => handleSelectUnsplashImage(image)}
                                        >
                                            <Image
                                                src={image.smallUrl || image.thumbUrl}
                                                alt={image.alt}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 33vw, 400px"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {searchingUnsplash && unsplashImages.length === 0 && (
                                <div className="flex flex-col items-center gap-2 py-8">
                                    <span className="loading loading-spinner loading-lg"></span>
                                    <p className="text-gray-600">Searching Unsplash...</p>
                                </div>
                            )}

                            {/* Preview for selected Unsplash image */}
                            {selectedUnsplashImage && preview && (
                                <div className="relative w-full h-48 mb-4 border border-gray-200 rounded-lg overflow-hidden">
                                    <Image
                                        src={preview}
                                        alt={selectedUnsplashImage.alt}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}

                            {/* Credit Display for Unsplash */}
                            {selectedUnsplashImage && (
                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Image URL (Read-only)
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered input-sm w-full bg-white"
                                            value={selectedUnsplashImage.url}
                                            readOnly
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Photo Credit (Read-only)
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered input-sm w-full bg-white"
                                            value={`Photo by ${selectedUnsplashImage.photographer} on Unsplash`}
                                            readOnly
                                        />
                                    </div>
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary mr-2"
                                            checked={showCredit}
                                            onChange={(e) => setShowCredit(e.target.checked)}
                                            disabled={uploading}
                                        />
                                        <span className="text-sm text-gray-700">Show credit in article</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Alt Text */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alt Text (optional)
                        </label>
                        <input
                            type="text"
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            placeholder="Describe the image for accessibility"
                            className="input input-bordered w-full"
                            disabled={uploading}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={onClose}
                            className="btn btn-ghost"
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            className="btn btn-primary"
                            disabled={
                                uploading ||
                                (uploadMethod === "file" && !file) ||
                                (uploadMethod === "url" && !imageUrl.trim()) ||
                                (uploadMethod === "unsplash" && !selectedUnsplashImage)
                            }
                        >
                            {uploading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Uploading...
                                </>
                            ) : (
                                "Insert Image"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
