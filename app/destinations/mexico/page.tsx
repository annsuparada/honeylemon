export const revalidate = 60;

import { Metadata } from 'next';
import SinglePostPage from '@/app/components/SinglePostPage';
import { BlogPost } from '@/app/types';

// Dummy data for Mexico destination page
const dummyPost: BlogPost = {
    id: 'dummy-mexico-1',
    title: 'Discover Mexico: Beaches, Ruins & Culture',
    slug: 'discover-mexico-beaches-ruins-culture',
    content: '<h2>Welcome to Mexico</h2><p>Mexico is a vibrant country known for its beautiful beaches, ancient Mayan ruins, rich culture, and delicious cuisine. From the turquoise waters of Cancun to the historic streets of Mexico City, there\'s something for every traveler.</p><h3>Top Destinations</h3><p>Explore Cancun, Tulum, Playa del Carmen, and more. Each destination offers unique experiences from all-inclusive resorts to authentic local culture.</p>',
    description: 'Explore Mexico\'s stunning beaches, ancient ruins, and vibrant culture. Your complete guide to the best destinations in Mexico.',
    image: 'https://images.pexels.com/photos/6965514/pexels-photo-6965514.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: {
        name: 'Destinations',
        slug: 'destinations',
    },
    categoryId: 'dummy-category-1',
    author: {
        id: 'dummy-author-1',
        name: 'Travel',
        lastName: 'Expert',
        username: 'travelexpert',
        profilePicture: undefined,
    },
    tags: [
        { id: 'tag-1', name: 'mexico', slug: 'mexico' },
        { id: 'tag-2', name: 'beaches', slug: 'beaches' },
        { id: 'tag-3', name: 'culture', slug: 'culture' },
    ],
    type: 'DESTINATION',
    faqs: [],
    itemListItems: [],
};

const dummyRelatedPosts: BlogPost[] = [];

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Mexico Travel Guide | Destinations | Travomad",
        description: "Discover the best of Mexico - from pristine beaches to ancient ruins, vibrant culture, and delicious cuisine. Expert travel guides and tips for your Mexican adventure.",
        keywords: "Mexico travel, Mexico destinations, Mexican beaches, Cancun, Tulum, Mexico City, travel guide",
        openGraph: {
            title: "Mexico Travel Guide | Travomad",
            description: "Discover the best of Mexico - beaches, ruins, culture, and cuisine.",
            url: `${process.env.NEXT_PUBLIC_API_URL}/destinations/mexico`,
            siteName: "Travomad",
            locale: "en_US",
            type: "website",
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_API_URL}/destinations/mexico`,
        },
    };
}

export default async function MexicoDestinationPage() {
    return (
        <SinglePostPage
            post={dummyPost}
            relatedPosts={dummyRelatedPosts}
            routePrefix="/destinations"
            breadcrumbLabel="Destinations"
            blogSectionTitle="More Mexico Destinations"
            blogSectionSubtitle="Discover more travel guides and tips for Mexico"
            countryName="Mexico"
            countrySlug="mexico"
        />
    );
}

