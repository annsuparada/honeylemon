export const revalidate = 60;

import { Metadata } from 'next';
import Image from 'next/image'
import sanitizeHtml from 'sanitize-html';
import './article.css'
import dynamic from "next/dynamic";
import HeroSection from '@/app/components/HeroSection';
import { getPostBySlug, getPublishedPosts } from '@/app/lip/postService';
import { VscError } from "react-icons/vsc";
import { getBaseOpenGraph, getCanonicalUrl, getOpenGraphImages, getRobotsMetadata, getTwitterMetadata } from '@/app/lip/metadata-helpers';

// Generate static pages for better performance & SEO
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
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

  const authorName = post.author.name
    ? `${post.author.name}${post.author.lastName ? ' ' + post.author.lastName : ''}`
    : post.author.username;

  const tagNames = post.tags.map(tag => tag.name);
  const keywords = [post.category.name, ...tagNames, "travel"].join(', ');
  const url = `/blog/${post.slug}`;
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

export default async function SingleBlogPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  const blogPosts = await getPublishedPosts(6, slug);

  if (!post) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
      <VscError size={48} />
      <h1 className="text-2xl font-semibold mt-6">Post Not Found</h1>
    </div>
  }

  const sanitizedContent = sanitizeHtml(post.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Keep common tags
    allowedAttributes: { 'a': ['href', 'target'], 'img': ['src', 'alt'] } // Keep links & images safe
  });

  // Generate FAQPage structured data for SEO
  const faqStructuredData = post.faqs && post.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": post.faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <>
      {/* FAQPage Structured Data for Rich Results */}
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData)
          }}
        />
      )}
      <HeroSection
        isHomepage={false}
        isSingleBlogPage={true}
        title={post.title}
        description={post.description}
        category={post.category.name}
        author={
          post.author?.name
            ? `${post.author.name} ${post.author.lastName}`
            : post.author?.username || "Unknown"
        }

        date={post.updatedAt}
        imageUrl="https://images.unsplash.com/photo-1546437744-529610df132e?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      <div className="max-w-screen-md mx-auto py-10 px-4">
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
            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
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



      <CTA
        title="Ready to Book?"
        subtitle="Find flights, hotels, and tours on Trip.com"
        buttonText="Get started"
        buttonUrl="https://trip.tp.st/yQI9sIWC"
      />

      <div className="mx-auto py-10 px-4">
        {/* Blog Section */}
        <BlogSection
          posts={blogPosts}
          title="Latest Travel Guides"
          subTitle="Fresh tips, itineraries, and destination insights"
          threeColumns={true}
        />
      </div>
    </>
  );
}
