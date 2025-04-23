'use client'
import './styles.css'

import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import { EditorProvider } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';
import React, { useEffect, useState } from 'react'
import { createPost, fetchPostBySlug, updatePost } from '@/utils/postActions'
import { createCategory, fetchAllCategories } from '@/utils/categotyAction'
import ProtectedPage from '../components/ProtectedPage'
import MenuBar from '../components/tiptap/MenuBar'
import { Author, Category } from '../types'
import Image from 'next/image'
import { PostStatus } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import LinkExtension from "@tiptap/extension-link";
import AlertMessage from '../components/AlertMessage'
import { ImageWithAlt } from '../components/tiptap/ImageWithAlt'

const extensions = [
    Color,
    TextStyle,
    Placeholder.configure({
        placeholder: "Start writing here...",
        emptyEditorClass: "before:content-[attr(data-placeholder)] before:absolute before:text-gray-400 before:italic before:pointer-events-none",
    }),

    StarterKit.configure({
        bulletList: false,  // Disable default bullet list
        orderedList: false, // Disable default ordered list
        listItem: false,
    }),
    ListItem.configure({
        HTMLAttributes: {
            class: "ml-6",
        },
    }),
    BulletList.configure({
        HTMLAttributes: {
            class: "list-disc",
        },
    }),
    OrderedList.configure({
        HTMLAttributes: {
            class: "list-decimal",
        },
    }),
    ImageWithAlt.configure({
        HTMLAttributes: {
            class: 'my-image-class',
        },
    }),
    LinkExtension.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
            class: "tiptap-link",
        },
    }),

]
const placeholderImg = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
const WritePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug')

    const [content, setContent] = useState('');
    const [title, setTitle] = useState('')
    const [description, setDesciption] = useState('')
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState<Author | null>(null);
    const [categories, setCategories] = useState<Category[] | []>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [newCategory, setNewCategory] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [image, setImage] = useState<string>(placeholderImg);
    const [postId, setPostId] = useState<string | null>(null);


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        setIsClient(true);

        async function loadCategories() {
            const data = await fetchAllCategories();
            setCategories(data);
        }

        async function loadDraftPost() {
            if (!slug || postId) return;

            try {
                const post = await fetchPostBySlug(slug);
                if (post) {
                    setPostId(post.id);
                    setTitle(post.title);
                    setContent(post.content);
                    setDesciption(post.description);
                    setImage(post.image || placeholderImg);
                    setSelectedCategory(post.categoryId);
                }
            } catch (error) {
                console.error("Error loading draft post:", error);
            }
        }

        loadCategories();

        if (typeof window !== "undefined") {
            setToken(localStorage.getItem("token"));
        }

        if (slug) {
            loadDraftPost();
        } else {
            // Reset fields for new post
            setPostId(null);
            setTitle("");
            setContent("");
            setDesciption("");
            setImage(placeholderImg);
            setSelectedCategory("");
        }
    }, [slug]);


    async function handleCreateCategory() {
        if (!newCategory.trim()) {
            setMessage({ type: "error", text: "Please enter a category" });
            return null;
        }

        try {
            const created = await createCategory(newCategory, token!);
            if (created) {
                setCategories([...categories, created]);
                setNewCategory("");
                setMessage({ type: "success", text: "Category created successfully!" });
                return created; // Return the created category to auto-select
            } else {
                setMessage({ type: "error", text: "Failed to create category. Try again!" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred. Please try again!" });
        }

        return null;
    }


    const handleSave = async (isPublish: boolean) => {
        if (!title.trim()) {
            setMessage({ type: "error", text: "Title is required!" });
            return;
        }

        if (!user || !user.id) {
            setMessage({ type: "error", text: "Author ID is missing! Please log in." });
            return;
        }

        if (!selectedCategory.trim()) {
            setMessage({ type: "error", text: "Category is required!" });
            return;
        }

        setLoading(true);
        setMessage(null);

        const postData = {
            title,
            content,
            image,
            description,
            status: isPublish ? PostStatus.PUBLISHED : PostStatus.DRAFT,
            authorId: user.id,
            categoryId: selectedCategory,
        };

        try {
            let result;

            if (postId) {
                // If postId exists, update the existing post
                result = await updatePost({ id: postId, ...postData });
            } else {
                // If no postId, create a new post
                result = await createPost(postData);
            }

            if (result && !result.error) {
                setMessage({ type: "success", text: "Post saved successfully!" });

                let param
                if (slug) {
                    param = slug
                } else {
                    param = result.post.slug
                }
                if (isPublish) {
                    router.push(`/blog/${param}`);
                } else {
                    router.push('/dashboard')
                }

            } else {
                setMessage({ type: "error", text: "Failed to save post. Try again later." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred while saving the post." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedPage>
            <div className='bg-primary py-16'>
                <h1 className="text-4xl font-bold mb-3 text-center text-white">Write Your Blog</h1>
            </div>
            <div className="min-h-screen py-16 px-2 max-w-screen-lg mx-auto">
                <div className="flex justify-end">
                    <button className="btn btn-soft mb-6 mr-3" onClick={() => handleSave(false)}>
                        Save Draft
                    </button>
                    <button className="btn btn-accent mb-6" onClick={() => handleSave(true)}>
                        Publish
                    </button>
                </div>
                {/* Alert Message */}
                {message && (
                    <AlertMessage message={message} onClose={() => setMessage(null)} />
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex items-center justify-center my-4">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                )}

                {/* form */}
                <div className="max-w-screen-lg mx-auto bg-white shadow-md rounded-lg p-6">
                    {/* Title Input */}
                    <div className="mb-4">
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            className="border border-gray-300 p-3 w-full rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                            placeholder="Enter title here..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description Input */}
                    <div className="mb-4">
                        <label className="block text-lg font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            className="border border-gray-300 p-3 w-full rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                            placeholder="Write a short description..."
                            value={description}
                            onChange={(e) => setDesciption(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Category Selection / Creation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mb-6">
                        {/* Select Category */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">Select Category</label>
                            <select
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                value={selectedCategory || ""}
                                className="border border-gray-300 p-3 w-full rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Create New Category */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-700 mb-2">Create New Category</label>

                            {/* Show button when input is hidden */}
                            {!showCategoryInput && (
                                <button
                                    className="btn btn-outline w-full"
                                    onClick={() => setShowCategoryInput(true)}
                                >
                                    Create New Category
                                </button>
                            )}

                            {/* Show input when button is clicked */}
                            {showCategoryInput && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="border border-gray-300 p-3 w-full rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
                                        placeholder="Enter new category"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-outline btn-primary"
                                        onClick={async () => {
                                            const created = await handleCreateCategory();
                                            if (created) {
                                                setSelectedCategory(created.id); // Auto-select new category
                                                setShowCategoryInput(false); // Hide input after creation
                                            }
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => setShowCategoryInput(false)} // Cancel input
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <button
                        className='btn btn-outline'
                        onClick={() => {
                            const url = window.prompt('Enter Image URL', image);
                            if (url) setImage(url);
                        }}>
                        Add Image from URL
                    </button>
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-semibold text-gray-700 mb-2 mt-4">Cover Image</label>

                    <div className="relative w-full h-64 border rounded-md overflow-hidden">
                        <Image
                            src={image}
                            alt="Article cover image"
                            width={500}
                            height={400}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => {
                                const url = window.prompt('Enter Image URL', image);
                                if (url) setImage(url);
                            }}
                            priority
                        />
                    </div>
                </div>

                {isClient && (
                    <>
                        {slug
                            ? <>{content !== "" && <EditorProvider // load content before render
                                slotBefore={<MenuBar />}
                                extensions={extensions}
                                content={content} // Ensure content is set before rendering
                                onUpdate={({ editor }) => setContent(editor.getHTML())}
                                editorProps={{ editable: () => true }}
                            />}</>

                            : <EditorProvider
                                slotBefore={<MenuBar />}
                                extensions={extensions}
                                content={content} // Ensure content is set before rendering
                                onUpdate={({ editor }) => setContent(editor.getHTML())}
                                editorProps={{ editable: () => true }}
                            />}
                    </>
                )}
            </div>
        </ProtectedPage>
    );
};

export default WritePage

