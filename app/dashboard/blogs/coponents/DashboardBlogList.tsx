import Link from "next/link";
import Image from "next/image";
import { SlOptionsVertical } from "react-icons/sl";
import { BlogPost } from "@/app/types";
import FormattedDate from "@/app/components/FormattedDate";
import { FaEdit, FaRegEye } from "react-icons/fa";

interface DashboardBlogListProps {
    loading: boolean;
    posts: BlogPost[];
    handleArchive: (post: BlogPost) => void;
    handleDelete: (postId: string) => void;
}


export default function DashboardBlogList({ posts, loading, handleArchive, handleDelete }: DashboardBlogListProps) {

    return (
        <div>
            {loading ? (
                <div className="text-center py-10">
                    <span className="loading loading-spinner loading-xl mr-4" role="status"></span>
                    Loading...
                </div>
            ) : posts.map(post => (
                <div key={post.slug} className="flex flex-col md:flex-row overflow-hidden rounded shadow-lg mb-8">
                    <div className="md:w-1/3 w-full h-48 md:h-auto">
                        <Image
                            src={post.image || "https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp"}
                            alt={post.title}
                            width={400}
                            height={266}
                            className="w-full h-full object-cover block"
                            priority
                        />
                    </div>

                    <div className="md:w-2/3 w-full p-6 relative bg-white">
                        <div className="absolute top-4 right-4">
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button">
                                    <SlOptionsVertical />
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded w-44 shadow">
                                    <li>
                                        <a onClick={() => handleArchive(post)}>Archive</a>
                                    </li>
                                    <li>
                                        <a className="text-red-500" onClick={() => handleDelete(post.id)}>Delete</a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500">
                            <FormattedDate dateString={post.createdAt} /> · {post.category?.name || "Uncategorized"} ·{" "}
                            <span className={`badge rounded ${post.status === "DRAFT" ? "badge-warning" : post.status === "PUBLISHED" ? "badge-info" : "badge-error"}`}>
                                {post.status}
                            </span>
                        </p>
                        <h3 className="text-2xl font-bold mt-2">{post.title}</h3>
                        <p className="mt-2 mb-10 text-gray-700">
                            {post.description?.slice(0, 200)}
                            {post.description && post.description.length > 200 ? "..." : ""}

                        </p>
                        <div className="flex md:absolute md:bottom-4 md:right-4 gap-2 mt-4 md:mt-0">
                            <Link
                                href={`/write?slug=${post.slug}`}
                                className="btn btn-outline btn-accent btn-sm rounded"
                            >
                                <FaEdit /> Edit
                            </Link>
                            <Link
                                href={`/blog/${post.slug}`}
                                className="btn btn-outline btn-info btn-sm rounded"
                            >
                                <FaRegEye /> View
                            </Link>
                        </div>

                    </div>
                </div>
            ))}
        </div>
    )
}
