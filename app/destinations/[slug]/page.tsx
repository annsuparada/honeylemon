export const revalidate = 60;

import { Metadata } from 'next';
import { getPostBySlug, getPublishedPosts } from '@/app/lip/postService';
import { generatePostMetadata } from '@/app/lip/metadata-helpers';
import { PageType } from '@prisma/client';
import SinglePostPage from '@/app/components/SinglePostPage';

// Generate static pages for better performance & SEO
export async function generateStaticParams() {
  const posts = await getPublishedPosts(undefined, undefined, PageType.DESTINATION);
  return posts.map((post: { slug: string; }) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return generatePostMetadata(params.slug, '/destinations', getPostBySlug);
}

export default async function SingleDestinationPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  const destinationPosts = await getPublishedPosts(6, slug, PageType.DESTINATION);

  return (
    <SinglePostPage
      post={post}
      relatedPosts={destinationPosts}
      routePrefix="/destinations"
      breadcrumbLabel="Destinations"
      blogSectionTitle="More Destinations"
      blogSectionSubtitle="Discover more travel destinations and guides"
    />
  );
}
