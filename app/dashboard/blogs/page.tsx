"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchPosts, deletePost, updatePost } from "@/utils/postActions";
import { PageType, PostStatus } from "@prisma/client";
import { BlogPost } from "@/app/types";
import ProtectedPage from "@/app/components/ProtectedPage";
import AlertMessage from "@/app/components/AlertMessage";
import PaginationClient from "@/app/components/PaginationClient";
import DashboardBlogList from "./components/DashboardBlogList";
import DashboardFilters from "./components/BlogFilter";

export default function Dashboard() {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [selectedPageType, setSelectedPageType] = useState("ALL");
    const itemsPerPage = 5;
    const [currentItems, setCurrentItems] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');


    const statusCounts = useMemo(() => {
        return blogPosts.reduce((acc, post) => {
            if (selectedPageType !== "ALL" && post.type !== selectedPageType) return acc;
            acc[post.status] = (acc[post.status] || 0) + 1;
            return acc;
        }, {} as Record<PostStatus, number>);
    }, [blogPosts, selectedPageType]);

    const pageTypeCounts = useMemo(() => {
        return blogPosts.reduce((acc, post) => {
            if (selectedStatus !== "ALL" && post.status !== selectedStatus) return acc;
            acc[post.type] = (acc[post.type] || 0) + 1;
            return acc;
        }, {} as Record<PageType, number>);
    }, [blogPosts, selectedStatus]);

    const postStatusOptions = useMemo(() => ([
        { label: `All (${filteredPosts.length})`, value: "ALL" },
        ...Object.values(PostStatus).map((status) => ({
            label: `${status.charAt(0) + status.slice(1).toLowerCase()} (${statusCounts[status] || 0})`,
            value: status,
        })),
    ]), [statusCounts, filteredPosts.length]);

    const pageTypeOptions = useMemo(() => ([
        { label: `All (${filteredPosts.length})`, value: "ALL" },
        ...Object.values(PageType).map((type) => ({
            label: `${type.charAt(0) + type.slice(1).toLowerCase()} (${pageTypeCounts[type] || 0})`,
            value: type,
        })),
    ]), [pageTypeCounts, filteredPosts.length]);

    const sortOptions = [
        { label: 'Newest First', value: 'newest' },
        { label: 'Oldest First', value: 'oldest' },
    ];

    useEffect(() => {
        async function loadPosts() {
            try {
                setLoading(true)
                const posts = await fetchPosts()
                setBlogPosts(posts)
                setFilteredPosts(posts)
                setCurrentItems(posts.slice(0, itemsPerPage))
            } catch (error) {
                console.error('Failed to fetch posts:', error)
                setBlogPosts([])
                setFilteredPosts([])
                setCurrentItems([])
            } finally {
                setLoading(false)
            }
        }
        loadPosts()
    }, [])


    useEffect(() => {
        let updated = blogPosts;

        if (selectedStatus !== "ALL") {
            updated = updated.filter(post => post.status === selectedStatus);
        }

        if (selectedPageType !== "ALL") {
            updated = updated.filter(post => post.type === selectedPageType);
        }

        updated = updated.sort((a, b) => {
            const dateA = new Date(a.updatedAt).getTime();
            const dateB = new Date(b.updatedAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredPosts(updated);
        setCurrentItems(updated.slice(0, itemsPerPage));
    }, [selectedStatus, selectedPageType, sortOrder, blogPosts]);

    const handleArchive = async (post: BlogPost) => {
        const result = await updatePost({
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            description: post.description,
            image: post.image,
            status: "ARCHIVED",
            type: post.type,
            categoryId: post.categoryId,
        });

        if (result?.success && 'post' in result) {
            setBlogPosts(prev =>
                prev.map(p => p.id === post.id ? result.post : p)
            );
            setMessage({ type: "success", text: "Post archived." });
        } else {
            setMessage({ type: "error", text: "Failed to archive post." });
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Delete this post?")) return;
        const result = await deletePost(postId);
        if (result) {
            setBlogPosts(prev => prev.filter(p => p.id !== postId));
            setMessage({ type: "success", text: "Post deleted." });
        }
    };

    return (
        <ProtectedPage>
            <div className="max-w-screen-lg mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Your Stories</h2>
                    <Link href="/write" className="btn btn-primary text-white">Write</Link>
                </div>

                <DashboardFilters
                    selectedStatus={selectedStatus}
                    selectedPageType={selectedPageType}
                    sortOrder={sortOrder}
                    onStatusChange={(value) => setSelectedStatus(value)}
                    onTypeChange={(value) => setSelectedPageType(value)}
                    onSortChange={(value) => setSortOrder(value)}
                    statusOptions={postStatusOptions}
                    typeOptions={pageTypeOptions}
                    sortOptions={sortOptions} />

                {message && <AlertMessage message={message} onClose={() => setMessage(null)} />}

                <DashboardBlogList
                    posts={currentItems}
                    handleArchive={handleArchive}
                    handleDelete={handleDelete}
                    loading={loading} />

                {filteredPosts.length > itemsPerPage && (
                    <PaginationClient
                        items={filteredPosts}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentItems}
                    />
                )}
            </div>
        </ProtectedPage>
    );
}
