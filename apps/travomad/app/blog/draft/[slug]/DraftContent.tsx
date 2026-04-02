'use client';

import Image from 'next/image'
import sanitizeHtml from 'sanitize-html';
import '@honeylemon/ui/styles/article.css'
import {
  HeroSection,
  Breadcrumb,
  TableOfContents,
  ProtectedPage,
  ShareButton,
  FAQSection,
} from '@honeylemon/ui';
import { formatAuthorName } from '@/app/lib/structured-data-helpers';
import { extractHeadings, addIdsToHeadings } from '@/app/lib/toc-helpers';
import Link from 'next/link';
import { BlogPost } from '@/app/types';

interface DraftContentProps {
    post: BlogPost;
}

export default function DraftContent({ post }: DraftContentProps) {
    const sanitizedContent = sanitizeHtml(post.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Keep common tags
        allowedAttributes: { 'a': ['href', 'target'], 'img': ['src', 'alt'], 'h2': ['id'], 'h3': ['id'], 'h4': ['id'], 'h5': ['id'], 'h6': ['id'] } // Keep links & images safe, allow IDs on headings
    });

    // Add IDs to headings and extract them for TOC
    const contentWithIds = addIdsToHeadings(sanitizedContent);
    const headings = extractHeadings(contentWithIds);

    return (
        <ProtectedPage>
            <>
                <HeroSection
                    isHomepage={false}
                    isSingleBlogPage={true}
                    title={post.title}
                    description={post.description}
                    category={post.category.name}
                    author={formatAuthorName(post.author)}
                    date={post.updatedAt}
                    imageUrl="https://images.unsplash.com/photo-1546437744-529610df132e?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                />
                <div className="max-w-screen-2xl mx-auto py-10 px-4">
                    {/* Draft Banner */}
                    <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="font-bold mr-2">DRAFT PREVIEW</span>
                                <span className="text-sm">This is a preview of your draft. It is not visible to the public.</span>
                            </div>
                            <Link
                                href={`/write?slug=${post.slug}`}
                                className="btn btn-sm btn-primary"
                            >
                                Edit Draft
                            </Link>
                        </div>
                    </div>

                    <div className="flex gap-8">
                        {/* Table of Contents - Desktop Sidebar / Mobile Floating Button */}
                        {headings.length > 0 && <TableOfContents headings={headings} />}

                        {/* Main Content Area */}
                        <div className="flex-1">
                            {/* Breadcrumbs */}
                            <div className="mb-4">
                                <Breadcrumb
                                    items={[
                                        { name: 'Blog', href: '/blog', current: false },
                                        { name: post.title, href: `/blog/draft/${post.slug}`, current: true },
                                    ]}
                                />
                            </div>
                            {/* Blog Header */}
                            <header className="mb-8">
                                <div className="mt-8 w-full flex justify-between items-center">
                                    <div className="badge badge-soft badge-neutral rounded-sm p-3">
                                        {post.category?.name}
                                    </div>
                                    <ShareButton title={post.title} />
                                </div>
                            </header>

                            {/* Featured Image */}
                            <div className="aspect-w-16 aspect-h-9 mb-6 rounded-sm shadow-lg overflow-hidden">
                                <Image
                                    src={post.heroImage || post.image || 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp'}
                                    alt={post.title}
                                    fill
                                    style={{ objectFit: "cover" }}
                                    className="rounded-sm"
                                    priority
                                />
                            </div>

                            {/* Blog Content */}
                            <article className="prose lg:prose-xl max-w-none text-gray-800 leading-relaxed">
                                <div className='post-content'>
                                    <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />
                                </div>
                            </article>
                            {/* FAQs Section */}
                            {post.faqs && post.faqs.length > 0 && (
                                <FAQSection
                                    faqs={post.faqs.map(faq => ({
                                        question: faq.question,
                                        answer: faq.answer
                                    }))}
                                />
                            )}
                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="">
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                                            Tags
                                        </h3>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {post.tags.map((tag) => {
                                            // Format tag name: capitalize, replace dashes with spaces
                                            const formattedName = tag.name
                                                .split('-')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                .join(' ');
                                            return (
                                                <span
                                                    key={tag.id}
                                                    className="badge badge-primary badge-lg px-4 py-2 rounded-full font-medium hover:badge-secondary transition-colors cursor-default"
                                                >
                                                    {formattedName}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        </ProtectedPage>
    );
}

