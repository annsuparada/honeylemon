import BlogSection from "@/app/components/BlogSection"
import HeroSection from "@/app/components/HeroSection"
import CardSection from "@/app/components/CardSection"
import CTA from "@/app/components/CTA"
import { destinations, regions } from "@/app/data/copy"
import { Metadata } from "next"
import { getPublishedPosts } from "../lip/postService"

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: "Find Your Next Destination | Travomad",
        description: "Explore cities, coasts, and hidden gems. Discover the world's best travel destinations with comprehensive guides, tips, and insider advice for your next adventure.",
        keywords: "travel destinations, vacation spots, travel guides, places to visit, best destinations, cities, beaches, hidden gems",

        openGraph: {
            title: "Find Your Next Destination",
            description: "Explore cities, coasts, and hidden gems. Discover the world's best travel destinations.",
            url: `${process.env.NEXT_PUBLIC_API_URL}/destinations`,
            siteName: "Travomad",
            locale: "en_US",
            type: "website",
            images: [
                {
                    url: "https://images.pexels.com/photos/6965514/pexels-photo-6965514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
                    width: 1200,
                    height: 630,
                    alt: "Travomad Travel Destinations - Explore the World",
                    type: "image/jpeg",
                },
            ],
        },

        // Twitter Card
        twitter: {
            card: "summary_large_image",
            title: "Find Your Next Destination",
            description: "Explore cities, coasts, and hidden gems. Discover the world's best travel destinations.",
            images: ["https://images.pexels.com/photos/6965514/pexels-photo-6965514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"],
            creator: "@travomad",
            site: "@travomad",
        },

        // Canonical URL
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_API_URL}/destinations`,
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

export default async function DestinationPage() {
    const allPosts = await getPublishedPosts(6)

    return (
        <div>
            <HeroSection
                title="Find Your Next Destination"
                description="Explore cities, coasts, and hidden gems..."
                imageUrl="https://images.pexels.com/photos/6965514/pexels-photo-6965514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            />

            <CardSection cardData={regions} title="Browse by Region" subtitle="Browse by Region" />
            <CardSection cardData={destinations} title="Popular Destinations" subtitle="Top travel spots our readers love" />
            <CTA
                title="Ready to Book?"
                subtitle="Find flights, hotels, and tours on Trip.com"
                buttonText="Get started"
                buttonUrl="https://trip.tp.st/yQI9sIWC"
            />

            <BlogSection posts={allPosts} title="Travel Experiences" subTitle="Travel Experiences" threeColumns={true} showAuthor={false} />
        </div>
    )
}