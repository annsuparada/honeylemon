import { fetchPosts } from "@/utils/postActions"
import HeroSection from "@/app/components/HeroSection"
import FormattedDate from "@/app/components/FormattedDate"
import Image from "next/image"
import Link from "next/link"
import Pagination from "@/app/components/PaginationSSR"
import { BlogPost } from "@/app/types"
import { Metadata } from "next"

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Travomad Blog — Real Travel Stories, Smart Tips & Hidden Deals",
    description:
      "From travel hacks and destination guides to the latest flight deals — the Travomad blog helps smart explorers plan better, travel cheaper, and experience more. No hype, just real-world insight.",
    openGraph: {
      title: "Travomad Blog",
      description:
        "Explore expert travel guides, smart tips, and hidden deals. Stay inspired with real travel stories on the Travomad blog.",
      url: "https://travomad.com/blog",
      images: [
        {
          url: "https://images.pexels.com/photos/27855084/pexels-photo-27855084/free-photo-of-acropolis.png",
          width: 1200,
          height: 630,
          alt: "Travomad Travel Blog Cover",
        },
      ],
    },
  }
}


export default async function BlogPage({ searchParams }: { searchParams?: { page?: string } }) {
  const itemsPerPage = 5
  const page = parseInt(searchParams?.page || "1", 10)

  const allPosts: BlogPost[] = await fetchPosts("PUBLISHED")
  const totalPages = Math.ceil(allPosts.length / itemsPerPage)
  const start = (page - 1) * itemsPerPage
  const currentItems = allPosts.slice(start, start + itemsPerPage)

  return (
    <>
      <HeroSection
        isHomepage={false}
        title="Real Travel Stories, Smart Tips & Hidden Deals"
        description="From travel hacks and destination guides to the latest flight deals — the Travomad blog helps smart explorers plan better, travel cheaper, and experience more. No hype, just real-world insight."
        imageUrl="https://images.pexels.com/photos/27855084/pexels-photo-27855084/free-photo-of-acropolis.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      />

      <div className="text-center pt-16">
        <h2 className="text-4xl font-bold">Latest Posts</h2>
      </div>

      <div className="max-w-screen-lg mx-auto p-6 grid gap-12 grid-cols-1">
        {currentItems.map((post) => (
          <div
            key={post.slug}
            className="flex flex-col md:flex-row rounded-sm shadow-lg overflow-hidden glass-bg"
          >
            <div className="w-full md:w-1/3 relative h-48 md:h-auto flex-shrink-0">
              <Image
                src={
                  post.image || 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp'
                }
                alt={post.title}
                priority
                style={{ objectFit: "cover" }}
                className="rounded-t-sm md:rounded-none md:rounded-l-sm object-cover h-full w-full"
                width={400}
                height={350}
              />
            </div>

            <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
              <div>
                <p className="text-sm">
                  <span className='text-gray-500'>
                    <FormattedDate dateString={post.createdAt} />
                  </span>{' '}
                  ·{' '}
                  <span className="badge badge-soft badge-neutral rounded-sm">
                    {post.category?.name || "Uncategorized"}
                  </span>
                </p>
                <h2 className="text-2xl font-bold mt-2">{post.title}</h2>
                <p className="mt-4">
                  {post.description && post.description.length > 200
                    ? post.description.slice(0, 200) + "..."
                    : post.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-6">
                <span className="font-bold text-gray-600">
                  {post.author?.name} {post.author?.lastName}
                </span>
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

      {totalPages > 1 && (
        <div className="mb-10">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath="/blog"
          />
        </div>
      )}
    </>
  )
}
