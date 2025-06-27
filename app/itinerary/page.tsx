import dynamic from "next/dynamic"
import CTA from "../components/CTA"
import HeroSection from "../components/HeroSection"
import { Metadata } from "next"
import { getPublishedPosts } from "../lip/postService"

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: "Curated Travel Itineraries for Every Explorer",
        description:
            "Plan your perfect trip with our handpicked itineraries — from weekend getaways to epic adventures.",
        openGraph: {
            title: "Curated Travel Itineraries for Every Explorer",
            description:
                "Plan your perfect trip with our handpicked itineraries — from weekend getaways to epic adventures.",
            url: "https://travomad.com/itinerary",
            images: [
                {
                    url: "https://images.unsplash.com/photo-1553437317-082fab6b3f4b?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    width: 1200,
                    height: 630,
                    alt: "Travomad Itinerary Cover",
                },
            ],
        },
    }
}
const BlogSection = dynamic(() => import("../components/BlogSection"), { ssr: false });


const Itinerary = async () => {
    const blogPosts = await getPublishedPosts(6);
    return (
        <div>
            <HeroSection
                title={"Travel Deals for Every Budget"}
                description={"From backpacker steals to luxury escapes — your next trip starts here."}
                imageUrl="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <BlogSection posts={blogPosts} title="Budget Travel Deals" subTitle="Big adventures. Tiny prices." threeColumns={true} showAuthor={false} />
            {/* <BlogSection posts={midRangePosts} title="Mid-Range Deals" subTitle="Great stays. Better prices. No sacrifices." threeColumns={true} showAuthor={false} showDescription={false} /> */}
            <CTA
                title="Ready to Book?"
                subtitle="Find flights, hotels, and tours on Trip.com"
                buttonText="Get started"
                buttonUrl="https://trip.tp.st/yQI9sIWC"
            />
            {/* <BlogSection posts={luxuryPosts} title="Luxury for Less" subTitle="Champagne lifestyle, economy budget." threeColumns={true} showAuthor={false} showDescription={false} /> */}
            {/* <PromotionSection
                items={promotions}
                heading="🔥 Travel Deals You Shouldn't Miss"
                subheading="Updated weekly. Limited availability."
            /> */}
        </div>
    )
}

export default Itinerary