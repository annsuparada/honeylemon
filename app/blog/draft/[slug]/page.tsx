export const revalidate = 0; // Always fetch fresh data for drafts

import { Metadata } from 'next';
import { getPostBySlug } from '@/app/lip/postService';
import { BlogPost } from '@/app/types';
import { formatAuthorName } from '@/app/lip/structured-data-helpers';
import DraftContent from './DraftContent';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        return { title: "Draft Not Found", description: "This draft does not exist." };
    }

    const authorName = formatAuthorName(post.author);

    return {
        title: `Draft: ${post.title} | Travomad`,
        description: post.description || "Draft preview",
        robots: {
            index: false,
            follow: false,
            noarchive: true,
            nosnippet: true,
        },
    };
}

export default async function DraftBlogPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
                <h1 className="text-2xl font-semibold mt-6">Draft Not Found</h1>
            </div>
        );
    }

    // Only show if it's actually a draft
    if (post.status !== 'DRAFT') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
                <h1 className="text-2xl font-semibold mt-6">This post is not a draft</h1>
            </div>
        );
    }

    return <DraftContent post={post} />;
}

