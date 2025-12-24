export const revalidate = 60;

import { Metadata } from 'next';
import Image from 'next/image'
import sanitizeHtml from 'sanitize-html';
import '@/app/styles/article.css'
import dynamic from "next/dynamic";
import HeroSection from '@/app/components/HeroSection';
import Breadcrumb from '@/app/components/Breadcrumb';
import { getPostBySlug, getPublishedPosts } from '@/app/lip/postService';
import { VscError } from "react-icons/vsc";
import { getBaseOpenGraph, getCanonicalUrl, getOpenGraphImages, getRobotsMetadata, getTwitterMetadata } from '@/app/lip/metadata-helpers';
import { generateArticleStructuredData, generateFAQStructuredData, generateBreadcrumbListStructuredData, generateItemListStructuredData, formatAuthorName } from '@/app/lip/structured-data-helpers';
import { extractHeadings, addIdsToHeadings } from '@/app/lip/toc-helpers';
import TableOfContents from '@/app/components/TableOfContents';
import { PageType } from '@prisma/client';

// Generate static pages for better performance & SEO
export async function generateStaticParams() {
  const posts = await getPublishedPosts(undefined, undefined, PageType.DESTINATION);
  return posts.map((post: { slug: string; }) => ({ slug: post.slug }));
}
const ShareButton = dynamic(() => import("../../components/ShareButton"), { ssr: false });
const CTA = dynamic(() => import("../../components/CTA"), { ssr: false });
const BlogSection = dynamic(() => import("../../components/BlogSection"), { ssr: false });
const FAQSection = dynamic(() => import("../../components/FAQSection"), { ssr: false });

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return { title: "Post Not Found", description: "This post does not exist." };
  }

  const authorName = formatAuthorName(post.author);

  const tagNames = post.tags.map(tag => tag.name);
  const keywords = [post.category.name, ...tagNames, "travel"].join(', ');
  const url = `/destinations/${post.slug}`;
  const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;

  return {
    title: `${post.title} | Travomad`,
    description: post.description || "Discover travel tips, destination guides, and exclusive deals on Travomad",
    keywords: keywords,
    authors: [{ name: authorName }],
    creator: authorName,
    publisher: "Travomad",
    category: post.category.name,

    openGraph: {
      ...getBaseOpenGraph(post.title, post.description || '', fullUrl),
      type: "article",
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [authorName],
      section: post.category.name,
      tags: [post.category.name, ...tagNames],
      images: getOpenGraphImages(post.image, post.title),
    },

    twitter: getTwitterMetadata(
      post.title,
      post.description || "Discover travel tips and destination guides on Travomad",
      post.image
    ),

    alternates: getCanonicalUrl(url),

    robots: getRobotsMetadata(post.status === 'PUBLISHED'),
  };
}

export default async function SingleDestinationPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  const destinationPosts = await getPublishedPosts(6, slug, PageType.DESTINATION);

  if (!post) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
      <VscError size={48} />
      <h1 className="text-2xl font-semibold mt-6">Post Not Found</h1>
    </div>
  }

  const sanitizedContent = sanitizeHtml(post.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Keep common tags
    allowedAttributes: { 'a': ['href', 'target'], 'img': ['src', 'alt'], 'h2': ['id'], 'h3': ['id'], 'h4': ['id'], 'h5': ['id'], 'h6': ['id'] } // Keep links & images safe, allow IDs on headings
  });

  // Add IDs to headings and extract them for TOC
  const contentWithIds = addIdsToHeadings(sanitizedContent);
  const headings = extractHeadings(contentWithIds);

  // Generate structured data for SEO
  const articleStructuredData = generateArticleStructuredData(post);
  const faqStructuredData = generateFAQStructuredData(post.faqs);
  const breadcrumbStructuredData = generateBreadcrumbListStructuredData(post);
  const itemListStructuredData = generateItemListStructuredData(post.itemListItems);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://travomad.vercel.app';

  return (
    <>
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
          {headings.length > 0 && <TableOfContents headings={headings} />}

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Breadcrumbs */}
            <div className="mb-4">
              <Breadcrumb
                items={[
                  { name: 'Destinations', href: '/destinations', current: false },
                  { name: post.title, href: `/destinations/${post.slug}`, current: true },
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
                src={post.image ? post.image : 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp'}
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
          posts={destinationPosts}
          title="More Destinations"
          subTitle="Discover more travel destinations and guides"
          threeColumns={true}
        />
      </div>
    </>
  );
}
