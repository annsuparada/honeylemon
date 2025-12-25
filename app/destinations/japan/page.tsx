export const revalidate = 60;

import { Metadata } from 'next';
import SinglePostPage from '@/app/components/SinglePostPage';
import { BlogPost } from '@/app/types';

// Dummy data for Japan destination page
const dummyPost: BlogPost = {
    id: 'dummy-japan-1',
    title: 'Explore Japan: Tradition Meets Innovation',
    slug: 'explore-japan-tradition-innovation',
    content: '<h2>Welcome to Japan</h2><p>Japan is a fascinating country where ancient traditions blend seamlessly with cutting-edge technology. From the neon-lit streets of Tokyo to the serene temples of Kyoto, experience the best of Japanese culture.</p><h3>Must-Visit Cities</h3><p>Discover Tokyo, Kyoto, Osaka, and more. Each city offers unique experiences from traditional tea ceremonies to modern pop culture.</p>',
    description: 'Experience Japan\'s unique blend of ancient traditions and modern innovation. Your complete guide to the best destinations in Japan.',
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
        { id: 'tag-1', name: 'japan', slug: 'japan' },
        { id: 'tag-2', name: 'culture', slug: 'culture' },
        { id: 'tag-3', name: 'temples', slug: 'temples' },
    ],
    type: 'DESTINATION',
    faqs: [],
    itemListItems: [],
};

const dummyRelatedPosts: BlogPost[] = [];

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Japan Travel Guide | Destinations | Travomad",
        description: "Explore Japan's unique blend of ancient traditions and modern innovation. From Tokyo's neon lights to Kyoto's temples, discover the best of Japanese culture, food, and travel.",
        keywords: "Japan travel, Japan destinations, Tokyo, Kyoto, Japanese culture, travel guide",
        openGraph: {
            title: "Japan Travel Guide | Travomad",
            description: "Explore Japan's unique blend of ancient traditions and modern innovation.",
            url: `${process.env.NEXT_PUBLIC_API_URL}/destinations/japan`,
            siteName: "Travomad",
            locale: "en_US",
            type: "website",
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_API_URL}/destinations/japan`,
        },
    };
}

export default async function JapanDestinationPage() {
    return (
        <SinglePostPage
            post={dummyPost}
            relatedPosts={dummyRelatedPosts}
            routePrefix="/destinations"
            breadcrumbLabel="Destinations"
            blogSectionTitle="More Japan Destinations"
            blogSectionSubtitle="Discover more travel guides and tips for Japan"
            countryName="Japan"
            countrySlug="japan"
        />
    );
}

