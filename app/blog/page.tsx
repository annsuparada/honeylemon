'use client'
import Image from 'next/image'
import Link from 'next/link'
import FormattedDate from '../components/FormattedDate';
import { fetchPosts } from '@/utils/postActions';
import { BlogPost } from '../types';
import { useEffect, useState } from 'react';
import AlertMessage from '../components/AlertMessage';
import Pagination from '../components/Pagination';
import HeroSection from '../components/HeroSection';


export default function BlogPage() {
  const [blogPosts, setBlogPost] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const itemsPerPage = 5;
  const [currentItems, setCurrentItems] = useState<BlogPost[]>([]);


  useEffect(() => {
    async function loadPosts() {
      try {
        const posts = await fetchPosts("PUBLISHED")
        setBlogPost(posts)
        setCurrentItems(posts.slice(0, itemsPerPage));
        setLoading(false)
      } catch (error) {
        setMessage({ type: "error", text: "Something went wrong, please try agin later." })
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <>
      <HeroSection
        isHomepage={false}
        title="Create Memories in Every Destination"
        description="Your ultimate guide to breathtaking destinations, travel tips, and exclusive deals. Let us help you plan your next dream vacation with the best offers from top travel agencies."
        imageUrl="https://images.pexels.com/photos/27855084/pexels-photo-27855084/free-photo-of-acropolis.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      />

      <div className="">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold">The Audio Blueprint</h1>
          <p className="text-lg mt-4">
            A Deep Dive into the World of Sound Design and Mixing
          </p>
        </div>
        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center my-4">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
        {/* Blog Posts Section */}
        <div className="max-w-screen-lg mx-auto p-6 grid gap-12 grid-cols-1">
          {message && <AlertMessage message={message} onClose={() => setMessage(null)} />}
          {currentItems.map((post) => (
            <div
              key={post.slug}
              className="flex flex-col md:flex-row rounded-sm shadow-lg overflow-hidden glass-bg"
            >
              {/* Image */}
              <div className="w-full md:w-1/3 relative h-48 md:h-auto flex-shrink-0">
                <Image
                  src={
                    post.image ? post.image :
                      'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp'
                  }
                  alt={post.title}
                  priority
                  style={{ objectFit: "cover" }}
                  className="rounded-t-sm md:rounded-none md:rounded-l-sm object-cover h-full w-full"
                  width={400}
                  height={350}
                />
              </div>

              {/* Text Content */}
              <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                <div>
                  <p className="text-sm">
                    <span className='text-gray-500'><FormattedDate dateString={post.createdAt} /> </span>·{' '}
                    <span className="badge badge-soft badge-neutral rounded-sm">{post.category?.name || "Uncategorized"}</span>
                  </p>
                  <h2 className="text-2xl font-bold mt-2">{post.title}</h2>
                  <p className="mt-4">
                    {post.description && post.description.length > 200
                      ? post.description?.slice(0, 200) + "..."
                      : post.description}
                  </p>
                </div>

                {/* Tags and Read More */}
                <div className="flex items-center justify-between mt-6">
                  <div className="flex space-x-2">
                    <span className='font-bold text-gray-600'>{post.author?.name} {post.author?.lastName}</span>
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-secondary hover:underline"
                  >
                    Read More »
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {blogPosts.length > 5 && (
          <div className="mb-10">
            <Pagination items={blogPosts} itemsPerPage={itemsPerPage} onPageChange={setCurrentItems} />
          </div>
        )}
      </div>

    </>
  );
}
