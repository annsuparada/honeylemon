export const revalidate = 60;

import { Metadata } from 'next';
import SinglePostPage from '@/app/components/SinglePostPage';
import { BlogPost } from '@/app/types';

// Dummy data for Portugal destination page
const dummyPost: BlogPost = {
    id: 'dummy-portugal-1',
    title: 'Explore Portugal: Cities & Coastlines',
    slug: 'explore-portugal-cities-coastlines',
    content: '<h2>Welcome to Portugal</h2><p>Portugal is a charming country known for its beautiful cities, stunning coastlines, and rich history. From the colorful streets of Lisbon to the wine cellars of Porto, discover the best of Portuguese travel.</p><h3>Must-Visit Cities</h3><p>Explore Lisbon, Porto, the Algarve, and more. Each destination offers unique experiences from historic architecture to beautiful beaches.</p>',
    description: 'Explore Portugal\'s charming cities, stunning coastlines, and rich history. Your complete guide to the best destinations in Portugal.',
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
        { id: 'tag-1', name: 'portugal', slug: 'portugal' },
        { id: 'tag-2', name: 'cities', slug: 'cities' },
        { id: 'tag-3', name: 'coastlines', slug: 'coastlines' },
    ],
    type: 'DESTINATION',
    faqs: [],
    itemListItems: [],
};

const dummyRelatedPosts: BlogPost[] = [];

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Portugal Travel Guide | Destinations | Travomad",
        description: "Explore Portugal's charming cities, stunning coastlines, and rich history. From Lisbon's colorful streets to Porto's wine cellars, discover the best of Portuguese travel.",
        keywords: "Portugal travel, Portugal destinations, Lisbon, Porto, Algarve, travel guide",
        openGraph: {
            title: "Portugal Travel Guide | Travomad",
            description: "Explore Portugal's charming cities, stunning coastlines, and rich history.",
            url: `${process.env.NEXT_PUBLIC_API_URL}/destinations/portugal`,
            siteName: "Travomad",
            locale: "en_US",
            type: "website",
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_API_URL}/destinations/portugal`,
        },
    };
}

export default async function PortugalDestinationPage() {
    return (
        <SinglePostPage
            post={dummyPost}
            relatedPosts={dummyRelatedPosts}
            routePrefix="/destinations"
            breadcrumbLabel="Destinations"
            blogSectionTitle="More Portugal Destinations"
            blogSectionSubtitle="Discover more travel guides and tips for Portugal"
            countryName="Portugal"
            countrySlug="portugal"
        />
    );
}

