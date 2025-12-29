'use client'

import sanitizeHtml from 'sanitize-html'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '../types'
import SectionHeader from './SectionHeader'
import FormattedDate from './FormattedDate'
import ReadTime from './ReadTime'

interface BlogSectionProps {
  posts: BlogPost[]
  title: string
  subTitle: string
  loading?: boolean
  threeColumns?: boolean
  showDescription?: boolean
  showAuthor?: boolean
}

const BlogSection: React.FC<BlogSectionProps> = ({
  posts,
  title,
  subTitle,
  loading = false,
  threeColumns = false,
  showDescription = true,
  showAuthor = false,
}) => {
  return (
    <div className="bg-white pt-24 sm:pt-32 pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`mx-auto ${threeColumns ? "" : "max-w-2xl lg:max-w-4xl"}`}>
          <SectionHeader title={title} subtitle={subTitle} />
          <Link
            href="/blog"
            className="block text-center text-accent hover:text-secondary transition-colors"
          >
            View all posts »
          </Link>

          {/* Loading Spinner */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <span role="status" className="loading loading-spinner loading-xl"></span>
            </div>
          ) : (
            <div
              className={`mt-16 ${threeColumns
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'space-y-20 lg:mt-20 lg:space-y-20'
                }`}
            >
              {posts.map((post) => {
                const sanitizedDescription = sanitizeHtml(post.description ?? '', {
                  allowedTags: ['b', 'i', 'em', 'strong', 'p'],
                  allowedAttributes: {},
                })

                return (<Link href={`/blog/${post.slug}`} key={post.slug}>
                  <article
                    className={`relative isolate rounded-md shadow-lg h-full flex flex-col justify-between ${threeColumns ? 'gap-2' : 'gap-4 lg:flex-row'}`}
                  >
                    <div
                      className={`relative overflow-hidden ${threeColumns ? 'h-52 w-full' : 'h-48 w-full lg:h-auto lg:w-64 lg:shrink-0'
                        }`}
                    >
                      <Image
                        alt={post.title}
                        src={
                          post.image ||
                          'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp'
                        }
                        fill
                        className={`object-cover ${threeColumns ? 'rounded-t-md' : 'lg:rounded-l-md'
                          }`}
                        unoptimized={!post.image}
                        priority
                      />
                    </div>

                    <div className="p-2">
                      <div className="flex items-center gap-x-4 text-xs">
                        <time dateTime={post.createdAt} className="text-gray-500">
                          <FormattedDate dateString={post.createdAt} />
                        </time>
                        {post.category?.name && (
                          <span
                            className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600"
                          >
                            {post.category.name}
                          </span>
                        )}
                      </div>
                      {/* Trending badge */}
                      {post.trending && (
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                            🔥 Trending
                          </span>
                        </div>
                      )}
                      {/* Read time */}
                      <div className="mt-2">
                        <ReadTime readTime={post.readTime} className="text-xs text-gray-500" />
                      </div>
                      <div className="group relative max-w-xl">
                        <h3 className="my-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
                          <span className="absolute inset-0" />
                          {post.title}
                        </h3>
                        {showDescription && (
                          <p
                            className="text-sm/6 text-gray-600 pb-3"
                            dangerouslySetInnerHTML={{
                              __html:
                                sanitizedDescription.length > 200
                                  ? sanitizedDescription.slice(0, 200) + '...'
                                  : sanitizedDescription,
                            }}
                          />
                        )}
                      </div>
                      {showAuthor && (
                        <div className="flex border-t border-gray-900/5 py-1">
                          <div className="relative flex items-center gap-x-4">
                            {post.author?.profilePicture && post.author?.name && (
                              <Image
                                alt={post.author.name}
                                src={post.author.profilePicture}
                                width={40}
                                height={40}
                                className="rounded-full bg-gray-50"
                              />
                            )}

                            <div className="text-sm/6">
                              <p className="font-semibold text-gray-900">
                                <span className="absolute inset-0" />
                                {post.author.name} {post.author.lastName}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BlogSection
