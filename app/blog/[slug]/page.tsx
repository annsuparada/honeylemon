export const revalidate = 60;

import { Metadata } from 'next';
import Image from 'next/image'
import sanitizeHtml from 'sanitize-html';
import './article.css'
import dynamic from "next/dynamic";
import HeroSection from '@/app/components/HeroSection';
import { getPostBySlug, getPublishedPosts } from '@/app/lip/postService';

// Generate static pages for better performance & SEO
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post: { slug: string; }) => ({ slug: post.slug }));
}
const ShareButton = dynamic(() => import("../../components/ShareButton"), { ssr: false });
const CTA = dynamic(() => import("../../components/CTA"), { ssr: false });
const BlogSection = dynamic(() => import("../../components/BlogSection"), { ssr: false });

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return { title: "Post Not Found", description: "This post does not exist." };
  }

  return {
    title: `${post.title}`,
    description: post.description || "Read this amazing blog post",
    openGraph: {
      title: post.title,
      description: post.description || "Read this amazing blog post",
      url: `${process.env.NEXT_PUBLIC_API_URL}/blog/${post.slug}`,
      type: "article",
      images: [
        {
          url: post.image || 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function SingleBlogPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  const blogPosts = await getPublishedPosts(6, slug);

  if (!post) {
    return <div className="text-center py-10 text-red-500">Post not found</div>;
  }

  const sanitizedContent = sanitizeHtml(post.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Keep common tags
    allowedAttributes: { 'a': ['href', 'target'], 'img': ['src', 'alt'] } // Keep links & images safe
  });

  return (
    <>
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
          <div className="mt-8 w-full flex justify-between">
            <div className="badge badge-soft badge-neutral rounded-sm mr-4 p-3">
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
      </div>
      <CTA
        title="Ready to Book?"
        subtitle="Find flights, hotels, and tours on Trip.com"
        buttonText="Get started"
        buttonUrl="https://trip.tp.st/yQI9sIWC"
      />

      <div className="max-w-screen-lg mx-auto py-10 px-4">
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
