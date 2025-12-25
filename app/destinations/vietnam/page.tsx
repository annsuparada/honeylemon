export const revalidate = 60;

import { Metadata } from 'next';
import SinglePostPage from '@/app/components/SinglePostPage';
import { BlogPost } from '@/app/types';

// Dummy data for Vietnam destination page
const dummyPost: BlogPost = {
    id: 'dummy-vietnam-1',
    title: 'Discover Vietnam: Landscapes & Culture',
    slug: 'discover-vietnam-landscapes-culture',
    content: '<h2>Welcome to Vietnam</h2><p>Vietnam is a country of breathtaking landscapes, rich history, and incredible cuisine. From the stunning Halong Bay to the bustling streets of Ho Chi Minh City, explore the best of Vietnamese travel and culture.</p><h3>Top Destinations</h3><p>Explore Hanoi, Ho Chi Minh City, Halong Bay, and more. Each destination offers unique experiences from historic sites to natural wonders.</p>',
    description: 'Discover Vietnam\'s breathtaking landscapes, rich history, and incredible cuisine. Your complete guide to the best destinations in Vietnam.',
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
        { id: 'tag-1', name: 'vietnam', slug: 'vietnam' },
        { id: 'tag-2', name: 'landscapes', slug: 'landscapes' },
        { id: 'tag-3', name: 'culture', slug: 'culture' },
    ],
    type: 'DESTINATION',
    faqs: [],
    itemListItems: [],
};

const dummyRelatedPosts: BlogPost[] = [];

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Vietnam Travel Guide | Destinations | Travomad",
        description: "Discover Vietnam's breathtaking landscapes, rich history, and incredible cuisine. From Halong Bay to Ho Chi Minh City, explore the best of Vietnamese travel and culture.",
        keywords: "Vietnam travel, Vietnam destinations, Hanoi, Ho Chi Minh City, Halong Bay, travel guide",
        openGraph: {
            title: "Vietnam Travel Guide | Travomad",
            description: "Discover Vietnam's breathtaking landscapes, rich history, and incredible cuisine.",
            url: `${process.env.NEXT_PUBLIC_API_URL}/destinations/vietnam`,
            siteName: "Travomad",
            locale: "en_US",
            type: "website",
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_API_URL}/destinations/vietnam`,
        },
    };
}

export default async function VietnamDestinationPage() {
    return (
        <SinglePostPage
            post={dummyPost}
            relatedPosts={dummyRelatedPosts}
            routePrefix="/destinations"
            breadcrumbLabel="Destinations"
            blogSectionTitle="More Vietnam Destinations"
            blogSectionSubtitle="Discover more travel guides and tips for Vietnam"
            countryName="Vietnam"
            countrySlug="vietnam"
        />
    );
}

