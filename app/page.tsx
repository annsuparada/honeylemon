'use client'
import { useEffect, useState } from "react";
import BentoFeatures from "./components/BentoFeature";
import BlogSection from "./components/BlogSection";
import CardSection from "./components/CardSection";
import HeroSection from "./components/HeroSection";
import NewsLetterSection from "./components/NewsLetterSection";
import { destinations, features } from "./data/copy";
import { BlogPost } from "./types";
import { fetchPosts } from "@/utils/postActions";

const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    async function loadPosts() {
      setLoading(true)
      const loadedPosts = await fetchPosts("PUBLISHED", 6)
      setPosts(loadedPosts)
      setLoading(false)
    }

    loadPosts()
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
      <BentoFeatures features={features} sectionTitle="Featured This Week" sectionSubTitle="Book now. Explore more. Spend less." />
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

