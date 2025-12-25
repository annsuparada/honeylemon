export const revalidate = 60;

import { Metadata } from 'next';
import SinglePostPage from '@/app/components/SinglePostPage';
import { BlogPost } from '@/app/types';

// Dummy data for Thailand destination page
const dummyPost: BlogPost = {
    id: 'dummy-thailand-1',
    title: 'Discover Thailand: Tropical Paradise',
    slug: 'discover-thailand-tropical-paradise',
    content: '<h2>Welcome to Thailand</h2><p>Thailand is a tropical paradise known for its pristine beaches, ancient temples, vibrant street food, and rich culture. From the bustling streets of Bangkok to the serene islands of Phuket, experience the Land of Smiles.</p><h3>Top Destinations</h3><p>Explore Bangkok, Phuket, Chiang Mai, and more. Each destination offers unique experiences from temple visits to beach relaxation.</p>',
    description: 'Discover Thailand\'s tropical paradise - pristine beaches, ancient temples, and vibrant culture. Your complete guide to exploring the Land of Smiles.',
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
        { id: 'tag-1', name: 'thailand', slug: 'thailand' },
        { id: 'tag-2', name: 'beaches', slug: 'beaches' },
        { id: 'tag-3', name: 'temples', slug: 'temples' },
    ],
    type: 'DESTINATION',
    faqs: [],
    itemListItems: [],
};

const dummyRelatedPosts: BlogPost[] = [];

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Thailand Travel Guide | Destinations | Travomad",
        description: "Discover Thailand's tropical paradise - pristine beaches, ancient temples, vibrant street food, and rich culture. Your complete guide to exploring the Land of Smiles.",
        keywords: "Thailand travel, Thailand destinations, Bangkok, Phuket, Thai islands, travel guide",
        openGraph: {
            title: "Thailand Travel Guide | Travomad",
            description: "Discover Thailand's tropical paradise - beaches, temples, and vibrant culture.",
            url: `${process.env.NEXT_PUBLIC_API_URL}/destinations/thailand`,
            siteName: "Travomad",
            locale: "en_US",
            type: "website",
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_API_URL}/destinations/thailand`,
        },
    };
}

export default async function ThailandDestinationPage() {
    return (
        <SinglePostPage
            post={dummyPost}
            relatedPosts={dummyRelatedPosts}
            routePrefix="/destinations"
            breadcrumbLabel="Destinations"
            blogSectionTitle="More Thailand Destinations"
            blogSectionSubtitle="Discover more travel guides and tips for Thailand"
            countryName="Thailand"
            countrySlug="thailand"
        />
    );
}

