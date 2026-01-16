"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { fetchPosts } from "@/utils/actions/postActions";
import { BlogPost } from "@/app/types";
import { PostStatus, PageType } from "@prisma/client";
import ProtectedPage from "@/app/components/ProtectedPage";
import FormattedDate from "@/app/components/FormattedDate";

interface NewsletterSubscription {
    id: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function DashboardHomePage() {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [subscriptions, setSubscriptions] = useState<NewsletterSubscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [postsData, newsletterData] = await Promise.all([
                    fetchPosts(),
                    fetch("/api/newsletter").then(res => res.json()).catch(() => ({ subscriptions: [] }))
                ]);

                setBlogPosts(postsData);
                setSubscriptions(newsletterData.subscriptions || []);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Calculate statistics
    const stats = useMemo(() => {
        const statusCounts = blogPosts.reduce((acc, post) => {
            acc[post.status] = (acc[post.status] || 0) + 1;
            return acc;
        }, {} as Record<PostStatus, number>);

        const pageTypeCounts = blogPosts.reduce((acc, post) => {
            acc[post.type] = (acc[post.type] || 0) + 1;
            return acc;
        }, {} as Record<PageType, number>);

        const totalViews = blogPosts.reduce((sum, post) => sum + (post.views || 0), 0);
        const publishedPosts = blogPosts.filter(p => p.status === PostStatus.PUBLISHED);
        const totalReadTime = publishedPosts.reduce((sum, post) => sum + (post.readTime || 0), 0);
        const avgReadTime = publishedPosts.length > 0 ? Math.round(totalReadTime / publishedPosts.length) : 0;

        const featuredCount = blogPosts.filter(p => p.featured).length;
        const pillarCount = blogPosts.filter(p => p.pillarPage).length;
        const trendingCount = blogPosts.filter(p => p.trending).length;

        const activeSubscribers = subscriptions.filter(s => s.isActive).length;
        const totalSubscribers = subscriptions.length;

        // Get posts from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentPosts = blogPosts.filter(p => {
            const publishedDate = new Date(p.createdAt);
            return publishedDate >= thirtyDaysAgo && p.status === PostStatus.PUBLISHED;
        }).length;

        return {
            statusCounts,
            pageTypeCounts,
            totalPosts: blogPosts.length,
            totalViews,
            avgReadTime,
            featuredCount,
            pillarCount,
            trendingCount,
            activeSubscribers,
            totalSubscribers,
            recentPosts,
            publishedCount: statusCounts[PostStatus.PUBLISHED] || 0,
            draftCount: statusCounts[PostStatus.DRAFT] || 0,
            scheduledCount: statusCounts[PostStatus.SCHEDULED] || 0,
            archivedCount: statusCounts[PostStatus.ARCHIVED] || 0,
        };
    }, [blogPosts, subscriptions]);

    // Top performing posts (by views)
    const topPosts = useMemo(() => {
        return [...blogPosts]
            .filter(p => p.status === PostStatus.PUBLISHED && (p.views || 0) > 0)
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
    }, [blogPosts]);

    // Recent posts
    const recentPosts = useMemo(() => {
        return [...blogPosts]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5);
    }, [blogPosts]);

    if (loading) {
        return (
            <ProtectedPage>
                <div className="flex items-center justify-center py-12">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </ProtectedPage>
        );
    }

    return (
        <ProtectedPage>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-base-content">Dashboard</h1>
                    <p className="mt-2 text-base-content/80">Overview of your content and audience</p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <Link href="/write" className="btn btn-primary">
                        ✍️ Write New Post
                    </Link>
                    <Link href="/dashboard/blogs" className="btn btn-outline">
                        📝 View All Blogs
                    </Link>
                    <Link href="/dashboard/email" className="btn btn-outline">
                        📧 Email Dashboard
                    </Link>
                </div>

                {/* Main Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Total Posts */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-base-content/80">Total Posts</p>
                                <p className="text-2xl font-bold text-base-content">{stats.totalPosts}</p>
                            </div>
                        </div>
                    </div>

                    {/* Published Posts */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-success/20 rounded-lg">
                                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-base-content/80">Published</p>
                                <p className="text-2xl font-bold text-base-content">{stats.publishedCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Drafts */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-warning/20 rounded-lg">
                                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-base-content/80">Drafts</p>
                                <p className="text-2xl font-bold text-base-content">{stats.draftCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Views */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-accent/20 rounded-lg">
                                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-base-content/80">Total Views</p>
                                <p className="text-2xl font-bold text-base-content">{stats.totalViews.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Subscribers */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-info/20 rounded-lg">
                                <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-base-content/80">Subscribers</p>
                                <p className="text-2xl font-bold text-base-content">{stats.totalSubscribers}</p>
                                <p className="text-xs text-base-content/60">{stats.activeSubscribers} active</p>
                            </div>
                        </div>
                    </div>

                    {/* Average Read Time */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-success/20 rounded-lg">
                                <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-base-content/80">Avg Read Time</p>
                                <p className="text-2xl font-bold text-base-content">{stats.avgReadTime} min</p>
                            </div>
                        </div>
                    </div>

                    {/* Featured Posts */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-warning/20 rounded-lg">
                                <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-base-content/80">Featured Posts</p>
                                <p className="text-2xl font-bold text-base-content">{stats.featuredCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Posts (30 days) */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-error/20 rounded-lg">
                                <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-base-content/80">Published (30d)</p>
                                <p className="text-2xl font-bold text-base-content">{stats.recentPosts}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post Status Breakdown */}
                <div className="bg-base-100 p-6 rounded-lg shadow-sm border mb-8">
                    <h2 className="text-xl font-bold text-base-content mb-4">Post Status Breakdown</h2>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/dashboard/blogs" className="badge badge-success badge-lg px-4 py-3">
                            Published ({stats.publishedCount})
                        </Link>
                        <Link href="/dashboard/blogs" className="badge badge-warning badge-lg px-4 py-3">
                            Draft ({stats.draftCount})
                        </Link>
                        {stats.scheduledCount > 0 && (
                            <Link href="/dashboard/blogs" className="badge badge-info badge-lg px-4 py-3">
                                Scheduled ({stats.scheduledCount})
                            </Link>
                        )}
                        {stats.archivedCount > 0 && (
                            <Link href="/dashboard/blogs" className="badge badge-error badge-lg px-4 py-3">
                                Archived ({stats.archivedCount})
                            </Link>
                        )}
                        {stats.featuredCount > 0 && (
                            <span className="badge badge-outline badge-lg px-4 py-3">
                                ⭐ Featured ({stats.featuredCount})
                            </span>
                        )}
                        {stats.pillarCount > 0 && (
                            <span className="badge badge-accent badge-lg px-4 py-3">
                                📚 Pillar ({stats.pillarCount})
                            </span>
                        )}
                        {stats.trendingCount > 0 && (
                            <span className="badge badge-outline badge-lg px-4 py-3">
                                🔥 Trending ({stats.trendingCount})
                            </span>
                        )}
                    </div>
                </div>

                {/* Two Column Layout for Top Posts and Recent Posts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Performing Posts */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-base-content">Top Performing Posts</h2>
                            <Link href="/dashboard/blogs" className="text-sm text-primary hover:underline">
                                View all →
                            </Link>
                        </div>
                        {topPosts.length > 0 ? (
                            <div className="space-y-4">
                                {topPosts.map((post, index) => (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        className="block p-4 border rounded-lg hover:bg-base-200 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm font-bold text-base-content/40">#{index + 1}</span>
                                                    <span className={`badge rounded text-xs ${post.status === "PUBLISHED" ? "badge-success" : "badge-warning"}`}>
                                                        {post.status}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-base-content line-clamp-2">{post.title}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-base-content/60">
                                                    <span>👁️ {post.views?.toLocaleString() || 0} views</span>
                                                    {post.readTime && <span>📖 {post.readTime} min</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-base-content/60 text-center py-8">No published posts with views yet.</p>
                        )}
                    </div>

                    {/* Recent Posts */}
                    <div className="bg-base-100 p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-base-content">Recent Posts</h2>
                            <Link href="/dashboard/blogs" className="text-sm text-primary hover:underline">
                                View all →
                            </Link>
                        </div>
                        {recentPosts.length > 0 ? (
                            <div className="space-y-4">
                                {recentPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/dashboard/blogs`}
                                        className="block p-4 border rounded-lg hover:bg-base-200 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`badge rounded text-xs ${post.status === "PUBLISHED" ? "badge-success" : post.status === "DRAFT" ? "badge-warning" : "badge-error"}`}>
                                                        {post.status}
                                                    </span>
                                                    {post.featured && <span className="badge badge-warning rounded text-xs">⭐ Featured</span>}
                                                    {post.trending && <span className="badge badge-error rounded text-xs">🔥 Trending</span>}
                                                </div>
                                                <h3 className="font-semibold text-base-content line-clamp-2">{post.title}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-base-content/60">
                                                    <FormattedDate dateString={post.updatedAt} />
                                                    {post.views !== undefined && <span>👁️ {post.views.toLocaleString()}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-base-content/60 text-center py-8">No posts yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}
