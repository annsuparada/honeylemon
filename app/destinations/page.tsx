'use client'
import { fetchPosts } from "@/utils/postActions"
import BlogSection from "../components/BlogSection"
import CardSection from "../components/CardSection"
import HeroSection from "../components/HeroSection"
import { destinations, regions } from "../data/copy"
import { BlogPost } from "../types"
import { useEffect, useState } from "react"
import Pagination from "../components/Pagination"
import AlertMessage from "../components/AlertMessage"
import CTA from "../components/CTA"

const Destination = () => {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
    const itemsPerPage = 3;
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [currentItems, setCurrentItems] = useState<BlogPost[]>([]);

    useEffect(() => {
        async function loadPosts() {
            try {
                const posts = await fetchPosts("PUBLISHED")
                setBlogPosts(posts)
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
        <div>
            <HeroSection
                title={"Find Your Next Destination  "}
                description={"Explore cities, coasts, and hidden gems around the world — no hype, just real travel insights. Whether you're planning your first trip or your next big adventure, Travomad helps you discover where to go and how to get there smart."}
                imageUrl="https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=2159&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />

            {/* Loading Indicator */}
            {loading && (
                <div className="flex items-center justify-center my-4">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            )}
            {message && <AlertMessage message={message} onClose={() => setMessage(null)} />}

            <CardSection cardData={regions} title={"Browse by Region"} subtitle={"Browse by Region"} />
            <CardSection cardData={destinations} title="Popular Destinations" subtitle="Top travel spots our readers love" />
            <CTA
                title="Ready to Book?"
                subtitle="Find flights, hotels, and tours on Trip.com — fast, reliable, and great deals for every budget."
                buttonText="Get started"
                buttonUrl="https://trip.tp.st/yQI9sIWC"
            />

            <BlogSection posts={currentItems} title={"Travel Experiences"} subTitle={"Travel Experiences"} threeColumns={true} />
            {blogPosts.length > 3 && (
                <div className="mb-10">
                    <Pagination items={blogPosts} itemsPerPage={itemsPerPage} onPageChange={setCurrentItems} />
                </div>
            )}

        </div>
    )
}

export default Destination