"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchPosts, deletePost, updatePost } from "@/utils/postActions";
import { FaEdit, FaRegEye } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl";
import { PageType, PostStatus } from "@prisma/client";
import { BlogPost } from "@/app/types";
import ProtectedPage from "@/app/components/ProtectedPage";
import SelectInput from "@/app/components/SelectInput";
import AlertMessage from "@/app/components/AlertMessage";
import FormattedDate from "@/app/components/FormattedDate";
import PaginationClient from "@/app/components/PaginationClient";

function getStatusCounts(posts: BlogPost[]) {
    return posts.reduce((acc, post) => {
        acc[post.status] = (acc[post.status] || 0) + 1;
        return acc;
    }, {} as Record<PostStatus, number>);
}

function getTypeCounts(posts: BlogPost[]) {
    return posts.reduce((acc, post) => {
        acc[post.type] = (acc[post.type] || 0) + 1;
        return acc;
    }, {} as Record<PageType, number>);
}


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
            setLoading(true);
            const posts = await fetchPosts();
            setBlogPosts(posts);
            setFilteredPosts(posts);
            setCurrentItems(posts.slice(0, itemsPerPage));
            setLoading(false);
        }
        loadPosts();
    }, []);

    useEffect(() => {
        let updated = blogPosts;

        if (selectedStatus !== "ALL") {
            updated = updated.filter(post => post.status === selectedStatus);
        }

        if (selectedPageType !== "ALL") {
            updated = updated.filter(post => post.type === selectedPageType);
        }

        updated = updated.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
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
            categoryId: post.category.id,
        });

        // Check if it's a successful response (your updatePost returns ApiResponse<BlogPost>)
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <SelectInput
                        label="Status"
                        selectedValue={selectedStatus}
                        options={postStatusOptions}
                        onChange={(value) => setSelectedStatus(value)}
                    />
                    <SelectInput
                        label="Page Type"
                        selectedValue={selectedPageType}
                        options={pageTypeOptions}
                        onChange={(value) => setSelectedPageType(value)}
                    />
                    <SelectInput
                        label="Sort by"
                        selectedValue={sortOrder}
                        options={sortOptions}
                        onChange={(value) => setSortOrder(value)}
                    />

                </div>

                {message && <AlertMessage message={message} onClose={() => setMessage(null)} />}

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : currentItems.map(post => (
                    <div key={post.slug} className="flex flex-col md:flex-row overflow-hidden rounded shadow-lg mb-8">
                        <div className="md:w-1/3 w-full h-48 md:h-auto">
                            <Image
                                src={post.image || "https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"}
                                alt={post.title}
                                width={400}
                                height={266}
                                className="w-full h-full object-cover block"
                            />
                        </div>

                        <div className="md:w-2/3 w-full p-6 relative bg-white">
                            <div className="absolute top-4 right-4">
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button">
                                        <SlOptionsVertical />
                                    </div>
                                    <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded w-44 shadow">
                                        <li><a onClick={() => handleArchive(post)}>Archive</a></li>
                                        <li><a className="text-red-500" onClick={() => handleDelete(post.id)}>Delete</a></li>
                                    </ul>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500">
                                <FormattedDate dateString={post.createdAt} /> · {post.category?.name || "Uncategorized"} ·{" "}
                                <span className={`badge rounded ${post.status === "DRAFT" ? "badge-warning" : post.status === "PUBLISHED" ? "badge-info" : "badge-error"}`}>
                                    {post.status}
                                </span>
                            </p>
                            <h3 className="text-2xl font-bold mt-2">{post.title}</h3>
                            <p className="mt-2 text-gray-700">
                                {post.description?.slice(0, 200)}
                                {post.description && post.description.length > 200 ? "..." : ""}

                            </p>
                            <div className="flex md:absolute md:bottom-4 md:right-4 gap-2 mt-4 md:mt-0">
                                <Link
                                    href={`/write?slug=${post.slug}`}
                                    className="btn btn-outline btn-accent btn-sm rounded"
                                >
                                    <FaEdit /> Edit
                                </Link>
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="btn btn-outline btn-info btn-sm rounded"
                                >
                                    <FaRegEye /> View
                                </Link>
                            </div>

                        </div>
                    </div>
                ))}

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
