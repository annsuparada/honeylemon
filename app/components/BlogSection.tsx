'use client';
import sanitizeHtml from "sanitize-html";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "../types";

interface BlogSectionProps {
  posts: BlogPost[];
}

const BlogSection: React.FC<BlogSectionProps> = ({ posts }) => {
  return (
    <div className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Find out more content in our Blog
        </h2>
        <Link href="/blog" className="text-accent mb-10 block text-center hover:text-secondary">
          View all posts »
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-lg mx-auto">
          {posts.map((post) => {
            const sanitizedDescription = sanitizeHtml(post.description ?? "", {
              allowedTags: ["b", "i", "em", "strong", "p"],
              allowedAttributes: {},
            });

            return (
              <div key={post.slug} className="card shadow-2xl rounded-sm glass-bg">
                <figure>
                  <Image
                    src={post.image || "https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                    width={400}
                    height={200}
                    unoptimized={post.image === null}
                    priority
                  />
                </figure>
                <div className="card-body">
                  <h3 className="text-xl font-semibold">{post.title}</h3>
                  <p
                    className="mt-2 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: sanitizedDescription.length > 200
                        ? sanitizedDescription.slice(0, 200) + "..."
                        : sanitizedDescription,
                    }}
                  />
                  <Link href={`/blog/${post.slug}`} className="btn btn-outline mt-4">
                    Read More
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlogSection;
