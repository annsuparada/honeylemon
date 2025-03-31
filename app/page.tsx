'use client'
import { useEffect, useState } from "react";
import BentoFeatures from "./components/BentoFeature";
import BlogListSection from "./components/BlogListSection";
import BlogSection from "./components/BlogSection";
import CardSection from "./components/CardSection";
import HeroSection from "./components/HeroSection";
import NewsLetterSection from "./components/NewsLetterSection";
import { destinations, features } from "./data/homepageCopy";
import { BlogPost } from "./types";
import { fetchPosts } from "@/utils/postActions";

const Home = () => {
  const [posts, setPosts] = useState([])

  useEffect(() => {

    async function loadPosts() {
      const loadedPosts = await fetchPosts("PUBLISHED", 5)
      setPosts(loadedPosts)
    }

    loadPosts()
  }, [])
  return (
    <main>
      <HeroSection
        isHomepage={true}
        title="Create Memories in Every Destination"
        description="Your ultimate guide to breathtaking destinations, travel tips, and exclusive deals. Let us help you plan your next dream vacation with the best offers from top travel agencies."
        imageUrl="https://images.unsplash.com/photo-1625077506327-23f672fb68d7?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
      <BentoFeatures features={features} sectionTitle="Featured This Week" sectionSubTitle="Book now. Explore more. Spend less." />
      <CardSection cardData={destinations} title="Popular Destinations" subtitle="Top travel spots our readers love" />
      <BlogSection posts={posts} title={'Latest Travel Guides '} subTitle={"Fresh tips, itineraries, and destination insights"} />
      <NewsLetterSection />
    </main>
  );
};

export default Home;

