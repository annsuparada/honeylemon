'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '../types/blog'
import SectionHeader from '../components/typography/SectionHeader'
import FormattedDate from '../components/data-display/FormattedDate'
import ReadTime from '../components/data-display/ReadTime'
import { getBlogRoute } from '../lib/routeHelpers'

interface TrendingPostsProps {
  posts: BlogPost[]
  title?: string
  subTitle?: string
}

const TrendingPosts: React.FC<TrendingPostsProps> = ({
  posts,
  title = "🔥 Trending Now",
  subTitle = "Popular posts our readers love",
}) => {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="bg-base-100 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader title={title} subtitle={subTitle} />
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const imageUrl = post.image || 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp';
            const description = post.description || '';

            return (
              <Link 
                href={getBlogRoute(post.slug)} 
                key={post.id}
                className="group relative isolate rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02]"
              >
                <article className="flex flex-col h-full">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      alt={post.title}
                      src={imageUrl}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized={!post.image}
                      priority
                    />
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center rounded-md bg-error/10 px-2 py-1 text-xs font-medium text-error ring-1 ring-inset ring-error/20">
                        🔥 Trending
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center gap-x-3 text-xs mb-2">
                      <time dateTime={post.createdAt} className="text-base-content/60">
                        <FormattedDate dateString={post.createdAt} />
                      </time>
                      {post.category?.name && (
                        <span className="relative z-10 rounded-full bg-base-200 px-2 py-1 font-medium text-base-content/80">
                          {post.category.name}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-base-content group-hover:text-base-content/80 mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    {description && (
                      <p className="text-sm text-base-content/80 line-clamp-3 mb-3 flex-grow">
                        {description.length > 150 ? description.slice(0, 150) + '...' : description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-base-200">
                      <ReadTime readTime={post.readTime} className="text-xs text-base-content/60" />
                      {post.views !== undefined && (
                        <span className="text-xs text-base-content/60">
                          👁️ {post.views.toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  )
}

export default TrendingPosts

