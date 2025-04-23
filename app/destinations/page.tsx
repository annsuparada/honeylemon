import { fetchPosts } from "@/utils/postActions"
import BlogSection from "@/app/components/BlogSection"
import HeroSection from "@/app/components/HeroSection"
import CardSection from "@/app/components/CardSection"
import CTA from "@/app/components/CTA"
import { destinations, regions } from "@/app/data/copy"

export default async function DestinationPage() {
    const allPosts = await fetchPosts("PUBLISHED", 6)

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
