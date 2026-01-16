"use client";

import { useState, useEffect } from "react";
import { BlogPost } from "@/app/types";
import { getPostRoute } from "@/utils/helpers/routeHelpers";
import { PageType } from "@prisma/client";

interface InternalLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (url: string) => void;
}

export default function InternalLinkModal({ isOpen, onClose, onInsert }: InternalLinkModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchPublishedPosts();
        } else {
            // Reset state when modal closes
            setSearchQuery("");
            setError("");
        }
    }, [isOpen]);

    const fetchPublishedPosts = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("/api/post?status=PUBLISHED", {
                method: "GET",
                cache: "no-store",
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch posts");
            }

            setPosts(data.posts || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectPost = (post: BlogPost) => {
        // Get tag slug for DESTINATION posts
        const tagSlug =
            post.type === PageType.DESTINATION && post.tags?.[0]?.slug
                ? post.tags[0].slug
                : undefined;

        const url = getPostRoute(post.type, post.slug, tagSlug);
        onInsert(url);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
                <div className="p-6 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Add Internal Link</h2>
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-circle btn-ghost"
                        >
                            ×
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search posts by title..."
                            className="input input-bordered w-full"
                            autoFocus
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Posts List */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            {searchQuery
                                ? `No published posts found matching "${searchQuery}"`
                                : "No published posts available"}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredPosts.map((post) => (
                                <button
                                    key={post.id}
                                    onClick={() => handleSelectPost(post)}
                                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
                                >
                                    <div className="font-semibold text-gray-900 mb-1">
                                        {post.title}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="badge badge-outline badge-sm">
                                            {post.category?.name || "Uncategorized"}
                                        </span>
                                        <span className="text-xs">
                                            {post.type.replace("_", " ")}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                    <div className="flex gap-2 justify-end">
                        <button onClick={onClose} className="btn btn-ghost">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

