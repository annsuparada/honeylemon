export const revalidate = 60;

import { Metadata } from 'next';
import { getPostBySlug, getPublishedPosts } from '@/app/lib/postService';
import { generatePostMetadata } from '@/app/lib/metadata-helpers';
import { PageType } from '@prisma/client';
import { SinglePostPage } from '@honeylemon/ui';

// Generate static pages for better performance & SEO
export async function generateStaticParams() {
  const posts = await getPublishedPosts(undefined, undefined, PageType.ITINERARY);
  return posts.map((post: { slug: string; }) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return generatePostMetadata(params.slug, '/itineraries', getPostBySlug);
}

export default async function SingleItineraryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const post = await getPostBySlug(slug);
  const itineraryPosts = await getPublishedPosts(6, slug, PageType.ITINERARY);

  return (
    <SinglePostPage
      post={post}
      relatedPosts={itineraryPosts}
      routePrefix="/itineraries"
      breadcrumbLabel="Itineraries"
      blogSectionTitle="More Itineraries"
      blogSectionSubtitle="Discover more travel itineraries and guides"
    />
  );
}
