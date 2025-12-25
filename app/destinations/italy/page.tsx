export const revalidate = 60;

import { Metadata } from 'next';
import SinglePostPage from '@/app/components/SinglePostPage';
import { BlogPost } from '@/app/types';

// Dummy data for Italy destination page
const dummyPost: BlogPost = {
    id: 'dummy-italy-1',
    title: 'Experience Italy: History, Food & Art',
    slug: 'experience-italy-history-food-art',
    content: '<h2>Welcome to Italy</h2><p>Italy is a country rich in history, art, and world-renowned cuisine. From the ancient ruins of Rome to the rolling hills of Tuscany, discover the best of Italian culture and travel.</p><h3>Iconic Destinations</h3><p>Explore Rome, Florence, Venice, and more. Each city offers unique experiences from Renaissance art to authentic Italian cuisine.</p>',
    description: 'Experience Italy\'s rich history, world-renowned cuisine, and stunning landscapes. Your complete guide to the best destinations in Italy.',
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
        { id: 'tag-1', name: 'italy', slug: 'italy' },
        { id: 'tag-2', name: 'food', slug: 'food' },
        { id: 'tag-3', name: 'history', slug: 'history' },
    ],
    type: 'DESTINATION',
    faqs: [],
    itemListItems: [],
};

const dummyRelatedPosts: BlogPost[] = [];

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Italy Travel Guide | Destinations | Travomad",
        description: "Experience Italy's rich history, world-renowned cuisine, and stunning landscapes. From Rome's ancient ruins to Tuscany's rolling hills, discover the best of Italian travel.",
        keywords: "Italy travel, Italy destinations, Rome, Florence, Tuscany, Italian food, travel guide",
        openGraph: {
            title: "Italy Travel Guide | Travomad",
            description: "Experience Italy's rich history, world-renowned cuisine, and stunning landscapes.",
            url: `${process.env.NEXT_PUBLIC_API_URL}/destinations/italy`,
            siteName: "Travomad",
            locale: "en_US",
            type: "website",
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_API_URL}/destinations/italy`,
        },
    };
}

export default async function ItalyDestinationPage() {
    return (
        <SinglePostPage
            post={dummyPost}
            relatedPosts={dummyRelatedPosts}
            routePrefix="/destinations"
            breadcrumbLabel="Destinations"
            blogSectionTitle="More Italy Destinations"
            blogSectionSubtitle="Discover more travel guides and tips for Italy"
            countryName="Italy"
            countrySlug="italy"
        />
    );
}

