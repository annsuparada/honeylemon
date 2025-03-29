"use client";

import ProtectedPage from "../components/ProtectedPage";
import Image from 'next/image'
import Link from 'next/link'
import FormattedDate from '../components/FormattedDate';
import { deletePost, fetchPosts, updatePost } from '@/utils/postActions';
import { BlogPost } from '../types';
import { FaEdit, FaRegEye } from "react-icons/fa";
import { useEffect, useState } from "react";
import { SlOptionsVertical } from "react-icons/sl";
import AlertMessage from "../components/AlertMessage";
import Pagination from "../components/Pagination";

export default function Dashboard() {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
    const itemsPerPage = 10;
    const [currentItems, setCurrentItems] = useState<BlogPost[]>([]);

    // Fetch posts only on initial mount
    useEffect(() => {
        async function loadPosts() {
            setLoading(true);
            try {
                const posts = await fetchPosts();
                setBlogPosts(posts);
                setFilteredPosts(posts); // Initialize filtered list
                setCurrentItems(posts.slice(0, itemsPerPage));
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        }
        loadPosts();
    }, []); // empty dependency array ensures this runs once\

    useEffect(() => {
        let updatedPost;
        if (selectedStatus === "ALL") {
            updatedPost = blogPosts
        } else {
            updatedPost = blogPosts.filter(post => post.status === selectedStatus)
        }
        setFilteredPosts(updatedPost)
        setCurrentItems(updatedPost.slice(0, itemsPerPage)); // Reset pagination
    }, [selectedStatus, blogPosts]);

    const handleArchive = async (post: BlogPost) => {
        const updatedPost = await updatePost({ ...post, status: "ARCHIVED" });
        if (updatedPost) {
            setBlogPosts(prevPosts =>
                prevPosts.map(p => (p.id === post.id ? { ...p, status: "ARCHIVED" } : p))
            );
            setMessage({ type: "success", text: "Archived post successfully" });
        }
    };

    const handleDelete = async (postId: string) => {
        const confirmed = confirm("Are you sure you want to delete this post?");
        if (!confirmed) return;

        const result = await deletePost(postId);
        if (result) {
            setBlogPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            setMessage({ type: "success", text: "Deleted post successfully" });
        }
    };

    return (
        <ProtectedPage>
            <div className='bg-gradient-to-r from-neutral-950 from-30% to-neutral-800 py-16'>
                <h1 className="text-4xl font-bold mb-3 text-center text-white">DASHBOARD</h1>
            </div>

            <div className="max-w-screen-lg mx-auto">
                {/* Hero Section */}
                <div className="py-16 flex justify-between items-center">
                    <h1 className="text-4xl font-bold">Your Stories</h1>
                    <div>
                        <Link className="btn btn-primary btn-lg" href={"/write"}>Write</Link>
                    </div>
                </div>

                {/* Status Filter Dropdown */}
                <div className="w-50 p-0 m-0 mb-6">
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                        Status{" "}
                        <select
                            className="border border-gray-300 p-2 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="ALL">All</option>
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </label>
                </div>

                {/* Blog Posts Section */}
                <div className="p-6 grid gap-12 grid-cols-1">
                    {/* Alert Message */}
                    {message && <AlertMessage message={message} onClose={() => setMessage(null)} />}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex items-center justify-center my-4">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    )}

                    {currentItems.map((post) => (
                        <div key={post.slug} className="flex flex-col md:flex-row rounded-sm shadow-lg overflow-hidden glass-bg">
                            {/* Image */}
                            <div className="w-full md:w-1/3 relative h-48 md:h-auto flex-shrink-0">
                                <Image
                                    src={post.image || 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp'}
                                    alt={post.title}
                                    fill
                                    style={{ objectFit: "cover" }}
                                    className="rounded-t-sm md:rounded-none md:rounded-l-sm"
                                />
                            </div>

                            {/* Text Content */}
                            <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-2 cursor-pointer">
                                    <div className="dropdown dropdown-end">
                                        <div tabIndex={0} role="button">
                                            <SlOptionsVertical className="text-gray-500 hover:text-gray-700 transition duration-200" />
                                        </div>
                                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-sm z-1 w-52 p-2 shadow-xl">
                                            <li><a onClick={() => handleArchive(post)}>Archive</a></li>
                                            <li><a onClick={() => handleDelete(post.id)} className="text-red-500">Delete</a></li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm">
                                        <span className='text-gray-500'><FormattedDate dateString={post.createdAt} /> </span>·{' '}
                                        <span className="badge badge-soft badge-neutral rounded-sm mr-2">{post.category?.name || "Uncategorized"}</span>
                                        <span className={`badge rounded-sm ${post.status === "DRAFT" ? "badge-warning" : post.status === "PUBLISHED" ? "badge-info" : post.status === "ARCHIVED" ? "badge-error" : "badge-secondary"}`}>
                                            {post.status || "Uncategorized"}
                                        </span>
                                    </p>
                                    <h2 className="text-2xl font-bold mt-2">{post.title}</h2>
                                    <p className="mt-4">
                                        {post.description && post.description.length > 200
                                            ? post.description?.slice(0, 200) + "..."
                                            : post.description}
                                    </p>
                                </div>

                                {/* Tags and Read More */}
                                <div className="flex items-center justify-between mt-6">
                                    <div className="flex space-x-2">
                                        <span className='font-bold text-gray-600'>{post.author?.name} {post.author?.lastName}</span>
                                    </div>
                                    <div>
                                        <Link href={`/write?slug=${post.slug}`} className="btn btn-outline btn-accent btn-sm rounded-sm mr-2">
                                            <FaEdit /> Edit
                                        </Link>

                                        <Link href={`/blog/${post.slug}`} className="btn btn-outline btn-info btn-sm rounded-sm">
                                            <FaRegEye /> View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {blogPosts.length > 10 && (
                    <div className="mb-10">
                        <Pagination items={filteredPosts} itemsPerPage={itemsPerPage} onPageChange={setCurrentItems} />
                    </div>
                )}
            </div>
        </ProtectedPage>
    );
}
