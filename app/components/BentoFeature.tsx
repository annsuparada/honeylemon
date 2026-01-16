import SectionHeader from "./SectionHeader";
import Link from "next/link";
import { BlogPost } from "../types";
import { getPostRoute } from "@/utils/helpers/routeHelpers";
import { PageType } from "@prisma/client";

export type FeatureItem = {
    title: string;
    subtitle: string;
    description: string;
    imageUrl: string;
    highlightColor?: string;
};

export type BentoFeatureCardProps = {
    post: BlogPost;
    className?: string;
    roundedClass?: string;
};

const BentoFeatureCard = ({ post, className = "", roundedClass = "" }: BentoFeatureCardProps) => {
    const imageUrl = post.image || 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp';
    const description = post.description || '';
    const categoryName = post.category?.name || 'Uncategorized';

    // Get the correct route based on post type
    // For DESTINATION posts, use the tag slug (country name) instead of post slug
    const getPostHref = () => {
        if (post.type === PageType.DESTINATION && post.tags && post.tags.length > 0) {
            // Use the first tag's slug as the country name for destination routing
            const tagSlug = post.tags[0].slug;
            return getPostRoute(post.type, post.slug, tagSlug);
        }
        return getPostRoute(post.type, post.slug);
    };

    return (
        <Link href={getPostHref()} className={`relative block ${className}`}>
            <div className={`absolute inset-px rounded-lg bg-base-100 shadow ${roundedClass}`} />
            <div className={`relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] ${roundedClass} transition-transform hover:scale-[1.02]`}>
                <img
                    alt={post.title}
                    src={imageUrl}
                    className="h-80 object-cover object-center"
                />
                <div className="p-10 pt-4">
                    <h3 className="text-sm/4 font-semibold text-primary">
                        {post.title}
                    </h3>
                    <p className="mt-2 text-lg font-medium tracking-tight text-secondary">{categoryName}</p>
                    <p className="mt-2 max-w-lg text-sm/6 text-neutral-content line-clamp-3">{description}</p>
                </div>
            </div>
            <div className={`pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 ${roundedClass}`} />
        </Link>
    );
};

type BentoFeaturesProps = {
    sectionTitle: string;
    sectionSubTitle: string;
    posts: BlogPost[];
};

export default function BentoFeatures({ posts, sectionTitle, sectionSubTitle }: BentoFeaturesProps) {
    // Only display when there are exactly 5 posts for the bento grid layout
    if (!posts || !Array.isArray(posts) || posts.length !== 5) {
        return null;
    }

    const displayPosts = posts.slice(0, 5);

    return (
        <div className="bg-base-100 py-24 sm:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
                <SectionHeader title={sectionTitle} subtitle={sectionSubTitle} />
                <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
                    {displayPosts.map((post, index) => {
                        const gridClass =
                            index === 0
                                ? "lg:col-span-3 lg:rounded-tl-[2rem]"
                                : index === 1
                                    ? "lg:col-span-3 lg:rounded-tr-[2rem]"
                                    : index === 2
                                        ? "lg:col-span-2 lg:rounded-bl-[2rem]"
                                        : index === 4
                                            ? "lg:col-span-2 lg:rounded-br-[2rem]"
                                            : "lg:col-span-2";

                        return (
                            <BentoFeatureCard
                                key={post.id}
                                post={post}
                                className={gridClass}
                                roundedClass={gridClass.replace("lg:", "")}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
