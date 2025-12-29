import { render, screen } from '@testing-library/react';
import BentoFeatures from '@/app/components/BentoFeature';
import type { BlogPost } from '@/app/types';
import { PostStatus, PageType } from '@prisma/client';
import '@testing-library/jest-dom';

const mockPosts: BlogPost[] = [
    {
        id: '1',
        title: 'Fast Performance',
        slug: 'fast-performance',
        content: 'Content here',
        description: 'Our app runs blazingly fast, even under heavy load.',
        image: 'https://example.com/image1.jpg',
        status: PostStatus.PUBLISHED,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        category: { name: 'Technology', slug: 'technology' },
        categoryId: 'cat1',
        author: { id: 'auth1', name: 'John', username: 'john' },
        tags: [],
        type: PageType.BLOG_POST,
    },
    {
        id: '2',
        title: 'Secure by Design',
        slug: 'secure-by-design',
        content: 'Content here',
        description: 'We use top-tier security practices to keep your data safe.',
        image: 'https://example.com/image2.jpg',
        status: PostStatus.PUBLISHED,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        category: { name: 'Security', slug: 'security' },
        categoryId: 'cat2',
        author: { id: 'auth2', name: 'Jane', username: 'jane' },
        tags: [],
        type: PageType.BLOG_POST,
    },
    {
        id: '3',
        title: 'User Friendly',
        slug: 'user-friendly',
        content: 'Content here',
        description: 'Our UI is designed for ease of use and accessibility.',
        image: 'https://example.com/image3.jpg',
        status: PostStatus.PUBLISHED,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
        category: { name: 'UX', slug: 'ux' },
        categoryId: 'cat3',
        author: { id: 'auth3', name: 'Bob', username: 'bob' },
        tags: [],
        type: PageType.BLOG_POST,
    },
    {
        id: '4',
        title: 'Cloud Integrated',
        slug: 'cloud-integrated',
        content: 'Content here',
        description: 'Built-in cloud integrations streamline your workflow.',
        image: 'https://example.com/image4.jpg',
        status: PostStatus.PUBLISHED,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
        category: { name: 'Cloud', slug: 'cloud' },
        categoryId: 'cat4',
        author: { id: 'auth4', name: 'Alice', username: 'alice' },
        tags: [],
        type: PageType.BLOG_POST,
    },
    {
        id: '5',
        title: 'Scalable Architecture',
        slug: 'scalable-architecture',
        content: 'Content here',
        description: 'We scale with your business — from one user to millions.',
        image: 'https://example.com/image5.jpg',
        status: PostStatus.PUBLISHED,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z',
        category: { name: 'Architecture', slug: 'architecture' },
        categoryId: 'cat5',
        author: { id: 'auth5', name: 'Charlie', username: 'charlie' },
        tags: [],
        type: PageType.BLOG_POST,
    },
];

describe('BentoFeatures Component', () => {
    it('renders section title and subtitle', () => {
        render(
            <BentoFeatures
                sectionTitle="Why Choose Us"
                sectionSubTitle="Features that make us unique"
                posts={mockPosts}
            />
        );

        expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
        expect(screen.getByText('Features that make us unique')).toBeInTheDocument();
    });

    it('renders all feature cards', () => {
        render(
            <BentoFeatures
                sectionTitle="Why Choose Us"
                sectionSubTitle="Features that make us unique"
                posts={mockPosts}
            />
        );

        mockPosts.forEach((post) => {
            expect(screen.getByText(post.title)).toBeInTheDocument();
            expect(screen.getByText(post.category.name)).toBeInTheDocument();
            expect(screen.getByText(post.description!)).toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(mockPosts.length);
    });

    it('applies correct layout classes based on index', () => {
        const { container } = render(
            <BentoFeatures
                sectionTitle="Layout Test"
                sectionSubTitle="Grid check"
                posts={mockPosts}
            />
        );

        // Check some key classes from your layout logic
        expect(container.innerHTML).toContain('lg:col-span-3 lg:rounded-tl-[2rem]');
        expect(container.innerHTML).toContain('lg:col-span-2 lg:rounded-bl-[2rem]');
    });

    it('does not render when posts array is not exactly 5', () => {
        const { container } = render(
            <BentoFeatures
                sectionTitle="Layout Test"
                sectionSubTitle="Grid check"
                posts={mockPosts.slice(0, 4)}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('does not render when posts is undefined', () => {
        const { container } = render(
            <BentoFeatures
                sectionTitle="Layout Test"
                sectionSubTitle="Grid check"
                posts={undefined as any}
            />
        );

        expect(container.firstChild).toBeNull();
    });
});
