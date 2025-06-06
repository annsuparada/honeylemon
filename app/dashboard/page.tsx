"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPosts, deletePost, updatePost } from "@/utils/postActions";
import { BlogPost } from "../types";
import FormattedDate from "../components/FormattedDate";
import AlertMessage from "../components/AlertMessage";
import Pagination from "../components/PaginationClient";
import { FaEdit, FaRegEye } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl";
import ProtectedPage from "../components/ProtectedPage";

export default function Dashboard() {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const itemsPerPage = 5;
    const [currentItems, setCurrentItems] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

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
        const updated = selectedStatus === "ALL"
            ? blogPosts
            : blogPosts.filter(post => post.status === selectedStatus);
        setFilteredPosts(updated);
        setCurrentItems(updated.slice(0, itemsPerPage));
    }, [selectedStatus, blogPosts]);

    const handleArchive = async (post: BlogPost) => {
        const updatedPost = await updatePost({ ...post, status: "ARCHIVED" });
        if (updatedPost) {
            setBlogPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
            setMessage({ type: "success", text: "Post archived." });
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
            <div className="bg-primary text-white py-12 text-center">
                <h1 className="text-4xl font-bold mt-20 mb-10">DASHBOARD</h1>
            </div>

            <div className="max-w-screen-lg mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Your Stories</h2>
                    <Link href="/write" className="btn btn-primary text-white">Write</Link>
                </div>

                <div className="mb-6">
                    <label className="font-semibold mr-2">Status</label>
                    <select
                        className="border p-2 rounded bg-white"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="ALL">All</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
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
                    <Pagination
                        items={filteredPosts}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentItems}
                    />
                )}
            </div>
        </ProtectedPage>
    );
}
