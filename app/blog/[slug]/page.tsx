export const revalidate = 60;

import { Metadata } from 'next';
import { getPostBySlug, getPublishedPosts } from '@/app/lib/postService';
import { generatePostMetadata } from '@/app/lib/metadata-helpers';
import SinglePostPage from '@/app/components/SinglePostPage';

// Generate static pages for better performance & SEO
export async function generateStaticParams() {
  // Exclude pillar pages from blog static generation
  const posts = await getPublishedPosts(undefined, undefined, undefined, undefined, true);
  return posts.map((post: { slug: string; }) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return generatePostMetadata(params.slug, '/blog', getPostBySlug);
}

export default async function SingleBlogPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  // Exclude pillar pages from related posts
  const blogPosts = await getPublishedPosts(6, slug, undefined, undefined, true);

  return (
    <SinglePostPage
      post={post}
      relatedPosts={blogPosts}
      routePrefix="/blog"
      breadcrumbLabel="Blog"
      blogSectionTitle="Latest Travel Guides"
      blogSectionSubtitle="Fresh tips, itineraries, and destination insights"
    />
  );
}
