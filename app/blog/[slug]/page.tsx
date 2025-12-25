export const revalidate = 60;

import { Metadata } from 'next';
import { getPostBySlug, getPublishedPosts } from '@/app/lip/postService';
import { generatePostMetadata } from '@/app/lip/metadata-helpers';
import SinglePostPage from '@/app/components/SinglePostPage';

// Generate static pages for better performance & SEO
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post: { slug: string; }) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return generatePostMetadata(params.slug, '/blog', getPostBySlug);
}

export default async function SingleBlogPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  const blogPosts = await getPublishedPosts(6, slug);

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
