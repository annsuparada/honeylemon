'use client'
import { useEffect, useState } from "react";
import BentoFeatures from "./components/BentoFeature";
import BlogSection from "./components/BlogSection";
import CardSection from "./components/CardSection";
import HeroSection from "./components/HeroSection";
import NewsLetterSection from "./components/NewsLetterSection";
import { destinations } from "./data/copy";
import { BlogPost } from "./types";
import { fetchPosts } from "@/utils/actions/postActions";

const POST_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/post` || 'http://localhost:3000/api/post';

const Home = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(false)
  const [featuredLoading, setFeaturedLoading] = useState(false)

  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      const loadedPosts = await fetchPosts("PUBLISHED", 6)
      // Only show BLOG_POST posts on the home page, excluding pillar pages
      const blogPosts = loadedPosts.filter((post: BlogPost) => post.type === 'BLOG_POST' && !post.pillarPage)
      setPosts(blogPosts)
      setLoading(false)
    }

    async function loadFeaturedPosts() {
      setFeaturedLoading(true)
      try {
        const res = await fetch(`${POST_API_URL}?status=PUBLISHED&featured=true&limit=5`, {
          method: 'GET',
          cache: 'no-store'
        });
        const data = await res.json();
        if (data && Array.isArray(data.posts)) {
          // Include all featured posts (including pillar pages and all post types)
          setFeaturedPosts(data.posts);
        }
      } catch (err) {
        console.error('Error fetching featured posts:', err);
      } finally {
        setFeaturedLoading(false);
      }
    }

    loadPosts()
    loadFeaturedPosts()
  }, [])
  return (
    <main>
      <HeroSection
        isHomepage={true}
        onCtaClick={() => window.open("https://trip.tp.st/mJKqNM8r", "_blank")}
        ctaText="Find Your Next Trip"
        title="Create Memories in Every Destination"
        description="Your ultimate guide to breathtaking destinations, travel tips, and exclusive deals. Let us help you plan your next dream vacation with the best offers from top travel agencies."
        imageUrl="https://images.unsplash.com/photo-1495822892661-2ead864e1c7b?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      {featuredPosts.length === 5 && (
        <BentoFeatures
          posts={featuredPosts}
          sectionTitle="Featured This Week"
          sectionSubTitle="Traveler Favorites: Best All-Inclusive Resorts"
        />
      )}
      <CardSection cardData={destinations} title="Popular Destinations" subtitle="Top travel spots our readers love" />
      <BlogSection
        loading={loading}
        posts={posts}
        title="Latest Travel Guides"
        subTitle="Fresh tips, itineraries, and destination insights"
        threeColumns={true}
      />
      <NewsLetterSection />
    </main>
  );
};

export default Home;

