import Image from 'next/image'
import sanitizeHtml from 'sanitize-html';
import '@/app/styles/article.css'
import dynamic from "next/dynamic";
import HeroSection from '@/app/components/HeroSection';
import Breadcrumb from '@/app/components/Breadcrumb';
import { VscError } from "react-icons/vsc";
import { generateArticleStructuredData, generateFAQStructuredData, generateBreadcrumbListStructuredData, generateItemListStructuredData, formatAuthorName } from '@/app/lip/structured-data-helpers';
import { extractHeadings, addIdsToHeadings } from '@/app/lip/toc-helpers';
import TableOfContents from '@/app/components/TableOfContents';
import ViewCounter from '@/app/components/ViewCounter';
import ReadTime from '@/app/components/ReadTime';
import { BlogPost } from '@/app/types';

const ShareButton = dynamic(() => import("./ShareButton"), { ssr: false });
const EditPostButton = dynamic(() => import("./EditPostButton"), { ssr: false });
const CTA = dynamic(() => import("./CTA"), { ssr: false });
const BlogSection = dynamic(() => import("./BlogSection"), { ssr: false });
const FAQSection = dynamic(() => import("./FAQSection"), { ssr: false });

interface SinglePostPageProps {
    post: BlogPost | null;
    relatedPosts: BlogPost[];
    routePrefix: string;
    breadcrumbLabel: string;
    blogSectionTitle: string;
    blogSectionSubtitle: string;
    countryName?: string;
    countrySlug?: string;
}

export default function SinglePostPage({
    post,
    relatedPosts,
    routePrefix,
    breadcrumbLabel,
    blogSectionTitle,
    blogSectionSubtitle,
    countryName,
    countrySlug,
}: SinglePostPageProps) {
    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
                <VscError size={48} />
                <h1 className="text-2xl font-semibold mt-6">Post Not Found</h1>
            </div>
        );
    }

    const sanitizedContent = sanitizeHtml(post.content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
            'a': ['href', 'target'],
            'img': ['src', 'alt'],
            'h2': ['id'],
            'h3': ['id'],
            'h4': ['id'],
            'h5': ['id'],
            'h6': ['id']
        }
    });

    // Add IDs to headings and extract them for TOC
    const contentWithIds = addIdsToHeadings(sanitizedContent);
    const headings = extractHeadings(contentWithIds);

    // Generate FAQ items for TOC
    const faqItems = post.faqs && post.faqs.length > 0
        ? post.faqs.map((faq, index) => {
            // Generate a slug-friendly ID from the question (matching FAQSection)
            const faqId = `faq-${faq.question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${index}`;
            return {
                id: faqId,
                question: faq.question
            };
        })
        : [];

    // Generate structured data for SEO
    const articleStructuredData = generateArticleStructuredData(post);
    const faqStructuredData = generateFAQStructuredData(post.faqs);
    const breadcrumbStructuredData = generateBreadcrumbListStructuredData(
        post,
        routePrefix,
        countryName,
        countrySlug
    );
    const itemListStructuredData = generateItemListStructuredData(post.itemListItems);

    return (
        <>
            {/* View Counter - increments views but doesn't display */}
            <ViewCounter slug={post.slug} />
            {/* Article Structured Data for Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(articleStructuredData)
                }}
            />
            {/* BreadcrumbList Structured Data for Rich Results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbStructuredData)
                }}
            />
            {/* FAQPage Structured Data for Rich Results */}
            {faqStructuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(faqStructuredData)
                    }}
                />
            )}
            {/* ItemList Structured Data for Rich Results */}
            {itemListStructuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(itemListStructuredData)
                    }}
                />
            )}
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
                <div className="flex gap-8">
                    {/* Table of Contents - Desktop Sidebar / Mobile Floating Button */}
                    {(headings.length > 0 || faqItems.length > 0) && (
                        <TableOfContents headings={headings} faqs={faqItems} />
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {/* Breadcrumbs */}
                        <div className="mb-4">
                            <Breadcrumb
                                items={[
                                    { name: breadcrumbLabel, href: routePrefix, current: false },
                                    ...(countryName && countrySlug
                                        ? [{ name: countryName, href: `${routePrefix}/${countrySlug}`, current: true }]
                                        : [{ name: post.title, href: `${routePrefix}/post/${post.slug}`, current: true }]),
                                ]}
                            />
                        </div>
                        {/* Blog Header */}
                        <header className="mb-8">
                            <div className="mt-8 w-full flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <div className="badge badge-soft badge-neutral rounded-sm p-3">
                                            {post.category?.name}
                                        </div>
                                        {post.trending && (
                                            <span className="badge badge-error rounded-sm text-xs">
                                                🔥 Trending
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <EditPostButton authorId={post.author.id} slug={post.slug} />
                                        <ShareButton title={post.title} />
                                    </div>
                                </div>
                                {/* Read time indicator */}
                                <ReadTime readTime={post.readTime} />
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

            <CTA
                title="Ready to Book?"
                subtitle="Find flights, hotels, and tours on Trip.com"
                buttonText="Get started"
                buttonUrl="https://trip.tp.st/yQI9sIWC"
            />

            <div className="mx-auto py-10 px-4">
                {/* Blog Section */}
                <BlogSection
                    posts={relatedPosts}
                    title={blogSectionTitle}
                    subTitle={blogSectionSubtitle}
                    threeColumns={true}
                />
            </div>
        </>
    );
}

