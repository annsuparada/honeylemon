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
        onCtaClick={() => window.open("https://trip.tp.st/mJKqNM8r", "_blank")}
        ctaText="Find Your Next Trip"
        title="Create Memories in Every Destination"
        description="Your ultimate guide to breathtaking destinations, travel tips, and exclusive deals. Let us help you plan your next dream vacation with the best offers from top travel agencies."
        imageUrl="https://images.pexels.com/photos/165505/pexels-photo-165505.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
      />
      <BentoFeatures features={features} sectionTitle="Featured This Week" sectionSubTitle="Book now. Explore more. Spend less." />
      <CardSection cardData={destinations} title="Popular Destinations" subtitle="Top travel spots our readers love" />
      <BlogSection posts={posts} title={'Latest Travel Guides '} subTitle={"Fresh tips, itineraries, and destination insights"} />
      <NewsLetterSection />
    </main>
  );
};

export default Home;

