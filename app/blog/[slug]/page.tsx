import { fetchPostBySlug, fetchPosts } from '@/utils/postActions'
import { Metadata } from 'next';
import Image from 'next/image'
import BlogSection from '@/app/components/BlogSection'
import sanitizeHtml from 'sanitize-html';
import FormattedDate from '@/app/components/FormattedDate';
import './article.css'
import { PostStatus } from '@prisma/client';
import dynamic from "next/dynamic";

// Generate static pages for better performance & SEO
export async function generateStaticParams() {
  const posts = await fetchPosts(PostStatus.PUBLISHED);
  return posts.map((post: { slug: string; }) => ({ slug: post.slug }));
}
const ShareButton = dynamic(() => import("../../components/ShareButton"), { ssr: false });

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    return { title: "Post Not Found", description: "This post does not exist." };
  }

  return {
    title: `${post.title} | Andrew Kantos`,
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
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || "Read this amazing blog post",
      images: [
        post.image || 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp'
      ],
    },
  };
}

export default async function SingleBlogPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await fetchPostBySlug(slug);
  const blogPosts = await fetchPosts(PostStatus.PUBLISHED);

  if (!post) {
    return <div className="text-center py-10 text-red-500">Post not found</div>;
  }

  const sanitizedContent = sanitizeHtml(post.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']), // Keep common tags
    allowedAttributes: { 'a': ['href', 'target'], 'img': ['src', 'alt'] } // Keep links & images safe
  });

  const avatar = 'https://res.cloudinary.com/dejr86qx8/image/upload/v1739062228/HIMidLow/avatar_c1axsr.png';

  return (
    <>
      <div className="max-w-screen-md mx-auto py-10 px-4">
        {/* Blog Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
          <div className="flex">
            <div className="badge badge-soft badge-neutral rounded-sm mr-4 p-3">
              {post.category?.name}
            </div>
          </div>
          <div className="mt-8 w-full flex justify-between">
            <div className="flex">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Image
                  className="h-12 w-12 rounded-full object-cover"
                  src={post.author?.profilePicture ? post.author.profilePicture : avatar}
                  alt={'Author'}
                  width={70}
                  height={70}
                />
              </div>
              {/* Name and Title */}
              <div className="ml-4 ">
                <div className="text-lg font-semibold text-gray-900">
                  {post.author?.name
                    ? `${post.author.name} ${post.author.lastName}`
                    : post.author?.username}
                </div>
                <span className='text-gray-500'><FormattedDate dateString={post.createdAt} /></span>
              </div>
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

      <div className="max-w-screen-lg mx-auto py-10 px-4">
        {/* Blog Section */}
        <BlogSection posts={blogPosts} />
      </div>
    </>
  );
}
