'use client'
import sanitizeHtml from 'sanitize-html'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '../types'
import SectionHeader from './SectionHeader'
import FormattedDate from './FormattedDate'

interface BlogSectionProps {
  posts: BlogPost[]
  title: string
  subTitle: string
  threeColumns?: boolean
  showDescription?: boolean
  showAuthor?: boolean
}

const BlogSection: React.FC<BlogSectionProps> = ({ posts, title, subTitle, threeColumns = false, showDescription = true, showAuthor = true }) => {
  return (
    <div className="bg-white pt-24 sm:pt-32 pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className={`mx-auto ${threeColumns ? "" : "max-w-2xl lg:max-w-4xl"} `}>
          <SectionHeader title={title} subtitle={subTitle} />
          <Link
            href="/blog"
            className="block text-center text-accent hover:text-secondary transition-colors"
          >
            View all posts »
          </Link>
          <div
            className={`mt-16 ${threeColumns
              ? 'grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-20 lg:mt-20 lg:space-y-20'
              }`}
          >
            {posts.map((post) => {
              const sanitizedDescription = sanitizeHtml(post.description ?? '', {
                allowedTags: ['b', 'i', 'em', 'strong', 'p'],
                allowedAttributes: {},
              })

              return (
                <article
                  key={post.slug}
                  className={`relative isolate ${threeColumns ? 'flex flex-col gap-6' : 'flex flex-col gap-8 lg:flex-row'
                    }`}
                >
                  <div className={`relative ${threeColumns ? 'h-52' : 'h-64'} w-full ${threeColumns ? '' : 'lg:w-64 lg:h-auto lg:shrink-0'}`}>
                    <Image
                      alt={post.title}
                      src={post.image || 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp'}
                      fill
                      className="rounded-sm object-cover"
                      unoptimized={!post.image}
                      priority
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-gray-900/10 ring-inset" />
                  </div>

                  <div>
                    <div className="flex items-center gap-x-4 text-xs">
                      <time dateTime={post.createdAt} className="text-gray-500">
                        <FormattedDate dateString={post.createdAt} />
                      </time>
                      {post.category?.name && (
                        <Link
                          href={post.category.name}
                          className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                        >
                          {post.category.name}
                        </Link>
                      )}
                    </div>
                    <div className="group relative max-w-xl">
                      <h3 className="mt-3 text-lg/6 font-semibold text-gray-900 group-hover:text-gray-600">
                        <Link href={`/blog/${post.slug}`}>
                          <span className="absolute inset-0" />
                          {post.title}
                        </Link>
                      </h3>
                      {showDescription &&
                        <p
                          className="mt-5 text-sm/6 text-gray-600"
                          dangerouslySetInnerHTML={{
                            __html:
                              sanitizedDescription.length > 200
                                ? sanitizedDescription.slice(0, 200) + '...'
                                : sanitizedDescription,
                          }}
                        />
                      }
                    </div>
                    {showAuthor &&
                      <div className="mt-6 flex border-t border-gray-900/5 pt-6">
                        <div className="relative flex items-center gap-x-4">
                          {post.author?.profilePicture && (
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
                              <Link href={post.author.name || '#'}>
                                <span className="absolute inset-0" />
                                {post.author.name}
                              </Link>
                            </p>
                            {post.author.role && <p className="text-gray-600">{post.author.role}</p>}
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </article>
              )
            })}
          </div>


        </div>
      </div>
    </div>
  )
}


export default BlogSection
