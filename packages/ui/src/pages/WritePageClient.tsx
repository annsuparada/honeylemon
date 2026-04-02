'use client';

import '../styles/article.css';
import { EditorProvider } from '@tiptap/react';
import type { Extensions } from '@tiptap/core';
import React, { useEffect, useState } from 'react';
import { PageType, PostStatus } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedPage from '@honeylemon/ui/pages/ProtectedPage';
import AlertMessage from '../components/feedback/AlertMessage';
import MenuBar from '../tiptap/MenuBar';
import WriteForm from './WriteForm';
import type { WriteFormCategory, WritePageActions, WritePageSavePayload, WritePageLoadedPost } from '../types/write-page';

export interface WritePageClientProps {
    extensions: Extensions;
    placeholderImage: string;
    heroTitle?: string;
    checkPillarBaseUrl?: string;
    actions: WritePageActions;
    onSave: (payload: WritePageSavePayload) => Promise<void>;
    createPost: WritePageSavePayload['createPost'];
    updatePost: WritePageSavePayload['updatePost'];
}

const WritePageClient: React.FC<WritePageClientProps> = ({
    extensions,
    placeholderImage,
    heroTitle = 'Write Your Blog',
    checkPillarBaseUrl = '/api/check-pillar',
    actions,
    onSave,
    createPost,
    updatePost,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');

    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [categories, setCategories] = useState<WriteFormCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [tags, setTags] = useState<Array<{ id: string; name: string; slug: string }>>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [image, setImage] = useState<string>(placeholderImage);
    const [postId, setPostId] = useState<string | null>(null);
    const [pageType, setPageType] = useState<PageType>('BLOG_POST');
    const [, setStatus] = useState<PostStatus>('DRAFT');
    const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
    const [itemListItems, setItemListItems] = useState<Array<{ name: string; url: string }>>([]);
    const [showBackToTop, setShowBackToTop] = useState(false);

    const [excerpt, setExcerpt] = useState<string>('');
    const [heroImage, setHeroImage] = useState<string>('');
    const [metaTitle, setMetaTitle] = useState<string>('');
    const [metaDescription, setMetaDescription] = useState<string>('');
    const [focusKeyword, setFocusKeyword] = useState<string>('');
    const [featured, setFeatured] = useState<boolean>(false);
    const [pillarPage, setPillarPage] = useState<boolean>(false);
    const [trending, setTrending] = useState<boolean>(false);
    const [publishedAt, setPublishedAt] = useState<string>('');
    const [pillarWarning, setPillarWarning] = useState<string | null>(null);

    const pageTypeOptions = Object.values(PageType).map((type) => ({
        label: type,
        value: type,
    }));

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser) as { id?: string };
                setUser(parsed?.id ? { id: parsed.id } : null);
            } catch {
                setUser(null);
            }
        }

        setIsClient(true);

        async function loadCategories() {
            const data = await actions.fetchAllCategories();
            setCategories(data);
        }

        async function loadTags() {
            const data = await actions.fetchAllTags();
            setTags(data);
        }

        async function loadDraftPost() {
            if (!slug) return;

            try {
                const post = (await actions.fetchPostBySlug(slug)) as WritePageLoadedPost | null | undefined;
                if (post) {
                    setPostId(post.id);
                    setTitle(post.title);
                    setContent(post.content);
                    setDescription(post.description || '');
                    setExcerpt(post.excerpt || '');
                    setImage(post.image || placeholderImage);
                    setHeroImage(post.heroImage || '');
                    setSelectedCategory(post.categoryId);
                    setPageType(post.type);
                    setStatus(post.status || 'DRAFT');
                    setMetaTitle(post.metaTitle || '');
                    setMetaDescription(post.metaDescription || '');
                    setFocusKeyword(post.focusKeyword || '');
                    setFeatured(post.featured || false);
                    setPillarPage(post.pillarPage || false);
                    setTrending(post.trending || false);
                    setPublishedAt(
                        post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : ''
                    );
                    const tagIds = post.tags?.map((tag) => tag.id) || [];
                    setSelectedTagIds(tagIds);

                    if (post.faqs && post.faqs.length > 0) {
                        setFaqs(
                            post.faqs.map((faq: { question: string; answer: string }) => ({
                                question: faq.question,
                                answer: faq.answer,
                            }))
                        );
                    } else {
                        setFaqs([]);
                    }

                    if (post.itemListItems && post.itemListItems.length > 0) {
                        setItemListItems(
                            post.itemListItems.map((item: { name: string; url: string }) => ({
                                name: item.name,
                                url: item.url,
                            }))
                        );
                    } else {
                        setItemListItems([]);
                    }

                    if (post.tags && post.tags.length > 0) {
                        setTags((prevTags) => {
                            const existingTagIds = new Set(prevTags.map((t) => t.id));
                            const newTags = post.tags!.filter((tag) => !existingTagIds.has(tag.id));
                            return [...prevTags, ...newTags];
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading draft post:', error);
            }
        }

        loadCategories();
        loadTags();

        if (typeof window !== 'undefined') {
            setToken(localStorage.getItem('token'));
        }

        if (slug) {
            loadDraftPost();
        } else {
            setPostId(null);
            setTitle('');
            setContent('');
            setDescription('');
            setExcerpt('');
            setImage(placeholderImage);
            setHeroImage('');
            setSelectedCategory('');
            setPageType('BLOG_POST');
            setStatus('DRAFT');
            setMetaTitle('');
            setMetaDescription('');
            setFocusKeyword('');
            setFeatured(false);
            setPillarPage(false);
            setTrending(false);
            setPublishedAt('');
            setSelectedTagIds([]);
            setFaqs([]);
            setItemListItems([]);
        }
    }, [slug]);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkForExistingPillar = async () => {
            if (pillarPage && pageType && pageType !== PageType.BLOG_POST && selectedTagIds.length > 0) {
                try {
                    const url = `${checkPillarBaseUrl}?type=${pageType}&tagId=${selectedTagIds[0]}${
                        postId ? `&excludePostId=${postId}` : ''
                    }`;
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.exists) {
                        setPillarWarning(
                            '⚠️ A pillar page already exists for this destination. Creating this as a pillar will be blocked when you save. Consider creating a regular article instead.'
                        );
                    } else {
                        setPillarWarning(null);
                    }
                } catch (error) {
                    console.error('Error checking pillar:', error);
                    setPillarWarning(null);
                }
            } else {
                setPillarWarning(null);
            }
        };

        checkForExistingPillar();
    }, [pillarPage, pageType, selectedTagIds, postId, checkPillarBaseUrl]);

    useEffect(() => {
        if (message) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [message]);

    async function handleCreateCategory(name: string) {
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'Please enter a category' });
            return null;
        }

        try {
            const created = await actions.createCategory(name, token ?? '');
            if (created) {
                setCategories((prev) => [...prev, created]);
                setMessage({ type: 'success', text: 'Category created successfully!' });
                return { label: created.name, value: created.id };
            }
            setMessage({ type: 'error', text: 'Failed to create category. Try again!' });
        } catch {
            setMessage({ type: 'error', text: 'An error occurred. Please try again!' });
        }

        return null;
    }

    async function handleCreateTag(name: string) {
        if (!name.trim()) {
            setMessage({ type: 'error', text: 'Please enter a tag name' });
            return null;
        }

        if (!token) {
            setMessage({ type: 'error', text: 'Authentication required' });
            return null;
        }

        try {
            const tag = await actions.createTag(name, token);
            if (tag) {
                setTags((prev) => {
                    const exists = prev.some((t) => t.id === tag.id);
                    if (exists) {
                        return prev;
                    }
                    return [...prev, tag];
                });
                setMessage({ type: 'success', text: 'Tag added successfully!' });
                return tag;
            }
            setMessage({ type: 'error', text: 'Failed to create tag. Try again!' });
        } catch {
            setMessage({ type: 'error', text: 'An error occurred. Please try again!' });
        }

        return null;
    }

    const handleSave = async (isPublish: boolean) => {
        let tagSlug: string | undefined;
        if (pageType === PageType.DESTINATION && selectedTagIds.length > 0) {
            const selectedTag = tags.find((tag) => tag.id === selectedTagIds[0]);
            tagSlug = selectedTag?.slug;

            if (!tagSlug) {
                try {
                    const allTags = await actions.fetchAllTags();
                    const foundTag = allTags.find((t) => t.id === selectedTagIds[0]);
                    tagSlug = foundTag?.slug;
                    if (foundTag && !tags.find((t) => t.id === foundTag.id)) {
                        setTags((prev) => [...prev, foundTag]);
                    }
                } catch (error) {
                    console.error('Error fetching tag slug:', error);
                }
            }
        }

        await onSave({
            title,
            content,
            description,
            excerpt,
            selectedCategory,
            image,
            heroImage,
            pageType,
            status: undefined,
            postId,
            slug,
            user,
            isPublish,
            tagIds: selectedTagIds,
            tagSlug,
            metaTitle,
            metaDescription,
            focusKeyword,
            featured,
            pillarPage,
            trending,
            publishedAt,
            faqs: faqs.filter((faq) => faq.question.trim() && faq.answer.trim()),
            itemListItems: itemListItems.filter((item) => {
                const hasName = item.name.trim();
                const hasUrl = item.url.trim();
                if (!hasName || !hasUrl) return false;
                try {
                    new URL(item.url.trim());
                    return true;
                } catch {
                    return false;
                }
            }),
            createPost,
            updatePost,
            router,
            setMessage,
            setLoading,
        });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <ProtectedPage>
            <div className="bg-primary py-16">
                <h1 className="text-4xl font-bold text-center text-white mt-20 mb-10">{heroTitle}</h1>
            </div>
            <div className="min-h-screen py-16 px-2 max-w-screen-lg mx-auto">
                {message && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-screen-lg px-4">
                        <AlertMessage message={message} onClose={() => setMessage(null)} />
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center my-4">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                )}
                <WriteForm
                    title={title}
                    description={description}
                    excerpt={excerpt}
                    image={image}
                    heroImage={heroImage}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    pageType={pageType}
                    pageTypeOptions={pageTypeOptions}
                    tags={tags}
                    selectedTagIds={selectedTagIds}
                    metaTitle={metaTitle}
                    metaDescription={metaDescription}
                    focusKeyword={focusKeyword}
                    featured={featured}
                    pillarPage={pillarPage}
                    trending={trending}
                    publishedAt={publishedAt}
                    pillarWarning={pillarWarning}
                    onChange={{
                        title: setTitle,
                        description: setDescription,
                        excerpt: setExcerpt,
                        image: setImage,
                        heroImage: setHeroImage,
                        category: setSelectedCategory,
                        type: setPageType,
                        tags: setSelectedTagIds,
                        metaTitle: setMetaTitle,
                        metaDescription: setMetaDescription,
                        focusKeyword: setFocusKeyword,
                        featured: setFeatured,
                        pillarPage: setPillarPage,
                        trending: setTrending,
                        publishedAt: setPublishedAt,
                    }}
                    onCreateCategory={handleCreateCategory}
                    onCreateTag={handleCreateTag}
                    faqs={faqs}
                    onChangeFaqs={setFaqs}
                    itemListItems={itemListItems}
                    onChangeItemListItems={setItemListItems}
                />

                {isClient && (
                    <>
                        {slug ? (
                            <>
                                {content !== '' && (
                                    <EditorProvider
                                        slotBefore={<MenuBar />}
                                        extensions={extensions}
                                        content={content}
                                        onUpdate={({ editor }) => setContent(editor.getHTML())}
                                        editorProps={{
                                            editable: () => true,
                                            attributes: {
                                                class: 'tiptap-editor-content',
                                            },
                                        }}
                                    />
                                )}
                            </>
                        ) : (
                            <EditorProvider
                                slotBefore={<MenuBar />}
                                extensions={extensions}
                                content={content}
                                onUpdate={({ editor }) => setContent(editor.getHTML())}
                                editorProps={{
                                    editable: () => true,
                                    attributes: {
                                        class: 'tiptap-editor-content',
                                    },
                                }}
                            />
                        )}
                    </>
                )}
            </div>

            <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col gap-2 md:gap-3">
                {showBackToTop && (
                    <button
                        className="btn btn-circle btn-primary shadow-lg btn-sm md:btn-md"
                        onClick={scrollToTop}
                        aria-label="Back to top"
                        title="Back to top"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 md:h-6 md:w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                        </svg>
                    </button>
                )}
                {(pageType === PageType.BLOG_POST || !pillarPage) && (
                    <button
                        className="btn btn-primary shadow-lg btn-sm md:btn-md text-xs md:text-base"
                        onClick={() => handleSave(false)}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            'Save Draft'
                        )}
                    </button>
                )}
                <button
                    className="btn btn-accent shadow-lg btn-sm md:btn-md text-xs md:text-base"
                    onClick={() => handleSave(true)}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                        'Publish'
                    )}
                </button>
                {pageType !== PageType.BLOG_POST && pillarPage && (
                    <div className="bg-info/10 border border-info/30 rounded-lg p-2 text-xs text-info max-w-[200px] shadow-lg">
                        <p className="font-medium">
                            ℹ️ Drafts are not accessible for this page type. Use &quot;Publish&quot; to save.
                        </p>
                    </div>
                )}
            </div>
        </ProtectedPage>
    );
};

export default WritePageClient;
