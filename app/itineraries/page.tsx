import CTA from "../components/CTA"
import HeroSection from "../components/HeroSection"
import BlogSection from "../components/BlogSection"
import { Metadata } from "next"
import { getPublishedPosts } from "../lib/postService"
import { PageType } from "@prisma/client"

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: "Travel Itineraries for Every Explorer | Travomad",
        description: "Plan your perfect trip with our handpicked itineraries — from weekend getaways to epic adventures. Get day-by-day guides, tips, and schedules for your dream vacation.",
        keywords: "travel itineraries, trip plans, vacation planning, travel schedules, day-by-day guides, weekend getaways, adventure travel",

        openGraph: {
            title: "Travel Itineraries for Every Explorer",
            description: "Plan your perfect trip with our handpicked itineraries — from weekend getaways to epic adventures.",
            url: `${process.env.NEXT_PUBLIC_API_URL}/itineraries`,
            siteName: "Travomad",
            locale: "en_US",
            type: "website",
            images: [
                {
                    url: "https://images.unsplash.com/photo-1553437317-082fab6b3f4b?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    width: 1200,
                    height: 630,
                    alt: "Travomad Travel Itineraries - Plan Your Perfect Trip",
                    type: "image/jpeg",
                },
            ],
        },

        // Twitter Card
        twitter: {
            card: "summary_large_image",
            title: "Travel Itineraries for Every Explorer",
            description: "Plan your perfect trip with our handpicked itineraries — from weekend getaways to epic adventures.",
            images: ["https://images.unsplash.com/photo-1553437317-082fab6b3f4b?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],
            creator: "@travomad",
            site: "@travomad",
        },

        // Canonical URL
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_API_URL}/itineraries`,
        },

        // Robots
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    }
}

const Itinerary = async () => {
    const blogPosts = await getPublishedPosts(6, undefined, PageType.ITINERARY);
    console.log('blogPosts', blogPosts);
    return (
        <div>
            <HeroSection
                title={"Travel Itineraries for Every Explorer"}
                description={"Plan your perfect trip with our handpicked itineraries — from weekend getaways to epic adventures."}
                imageUrl="https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
            <BlogSection
                posts={blogPosts}
                title="Budget Travel Deals"
                subTitle="Big adventures. Tiny prices."
                threeColumns={true}
                showAuthor={false}
                showDescription={false}
            />
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