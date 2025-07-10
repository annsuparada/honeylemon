'use client'

import './styles.css'
import { EditorProvider } from '@tiptap/react'
import React, { useEffect, useState } from 'react'
import { createPost, fetchPostBySlug, updatePost } from '@/utils/postActions'
import { createCategory, fetchAllCategories } from '@/utils/categotyAction'
import ProtectedPage from '../components/ProtectedPage'
import MenuBar from '../components/tiptap/MenuBar'
import { Author, Category } from '../types'
import { PageType, PostStatus } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'
import AlertMessage from '../components/AlertMessage'
import { extensions } from '../lip/tiptapExtensions'
import WriteForm from './components/WriteForm'
import { handleSavePost } from '@/utils/handlers/savePostHandler'


const placeholderImg = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
const WritePage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug')

    const [content, setContent] = useState('');
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState<Author | null>(null);
    const [categories, setCategories] = useState<Category[] | []>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [image, setImage] = useState<string>(placeholderImg);
    const [postId, setPostId] = useState<string | null>(null);
    const [pageType, setPageType] = useState<PageType>('ARTICLE');

    const pageTypeOptions = Object.values(PageType).map(type => ({
        label: type,
        value: type
    }))

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
                    setDescription(post.description);
                    setImage(post.image || placeholderImg);
                    setSelectedCategory(post.categoryId);
                    setPageType(post.type)
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
            setDescription("");
            setImage(placeholderImg);
            setSelectedCategory("");
            setPageType("ARTICLE")
        }
    }, [slug]);

    async function handleCreateCategory(name: string) {
        if (!name.trim()) {
            setMessage({ type: "error", text: "Please enter a category" });
            return null;
        }

        try {
            const created = await createCategory(name, token!);
            if (created) {
                setCategories(prev => [...prev, created]);
                setMessage({ type: "success", text: "Category created successfully!" });
                return { label: created.name, value: created.id };
            } else {
                setMessage({ type: "error", text: "Failed to create category. Try again!" });
            }
        } catch (error) {
            setMessage({ type: "error", text: "An error occurred. Please try again!" });
        }

        return null;
    }

    const handleSave = async (isPublish: boolean) => {
        await handleSavePost({
            title,
            content,
            description,
            selectedCategory,
            image,
            pageType,
            postId,
            slug,
            user,
            isPublish,
            createPost,
            updatePost,
            router,
            setMessage,
            setLoading
        });
    };
    console.log('content---', content)

    return (
        <ProtectedPage>
            <div className='bg-primary py-16'>
                <h1 className="text-4xl font-bold mb-3 text-center text-white mt-20 mb-10">Write Your Blog</h1>
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
                <WriteForm
                    title={title}
                    description={description}
                    image={image}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    pageType={pageType}
                    pageTypeOptions={pageTypeOptions}
                    onChange={{
                        title: setTitle,
                        description: setDescription,
                        image: setImage,
                        category: setSelectedCategory,
                        type: setPageType,
                    }}
                    onCreateCategory={handleCreateCategory}
                />

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

