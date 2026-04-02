import { render, screen } from '@testing-library/react';
import BentoFeatures from './BentoFeature';
import type { BlogPost } from '../types/blog';
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
        author: { id: 'auth1', name: 'John', username: 'john' } as any,
        tags: [],
        type: PageType.BLOG_POST,
    } as any,
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
        author: { id: 'auth2', name: 'Jane', username: 'jane' } as any,
        tags: [],
        type: PageType.BLOG_POST,
    } as any,
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
        author: { id: 'auth3', name: 'Bob', username: 'bob' } as any,
        tags: [],
        type: PageType.BLOG_POST,
    } as any,
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
        author: { id: 'auth4', name: 'Alice', username: 'alice' } as any,
        tags: [],
        type: PageType.BLOG_POST,
    } as any,
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
        author: { id: 'auth5', name: 'Charlie', username: 'charlie' } as any,
        tags: [],
        type: PageType.BLOG_POST,
    } as any,
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
            expect(screen.getByText((post as any).category.name)).toBeInTheDocument();
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

    it('does not render when posts is null', () => {
        const { container } = render(
            <BentoFeatures
                sectionTitle="Layout Test"
                sectionSubTitle="Grid check"
                posts={null as any}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('does not render when posts is not an array', () => {
        const { container } = render(
            <BentoFeatures
                sectionTitle="Layout Test"
                sectionSubTitle="Grid check"
                posts={{ length: 5 } as any}
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('uses default image when post image is missing', () => {
        const postsWithoutImages = mockPosts.map(post => ({
            ...post,
            image: undefined,
        }));

        render(
            <BentoFeatures
                sectionTitle="Test"
                sectionSubTitle="Test"
                posts={postsWithoutImages as any}
            />
        );

        const images = screen.getAllByRole('img');
        images.forEach(img => {
            expect(img).toHaveAttribute('src', 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp');
        });
    });

    it('uses "Uncategorized" when category is missing', () => {
        const postsWithoutCategory = mockPosts.map(post => ({
            ...post,
            category: undefined as any,
        }));

        render(
            <BentoFeatures
                sectionTitle="Test"
                sectionSubTitle="Test"
                posts={postsWithoutCategory as any}
            />
        );

        const uncategorizedTexts = screen.getAllByText('Uncategorized');
        expect(uncategorizedTexts.length).toBeGreaterThan(0);
    });

    it('handles missing description gracefully', () => {
        const postsWithoutDescription = mockPosts.map(post => ({
            ...post,
            description: undefined,
        }));

        render(
            <BentoFeatures
                sectionTitle="Test"
                sectionSubTitle="Test"
                posts={postsWithoutDescription as any}
            />
        );

        expect(screen.getByText('Fast Performance')).toBeInTheDocument();
    });

    it('generates correct link for BLOG_POST type', () => {
        render(
            <BentoFeatures
                sectionTitle="Test"
                sectionSubTitle="Test"
                posts={mockPosts}
            />
        );

        const links = screen.getAllByRole('link');
        expect(links[0]).toHaveAttribute('href', '/blog/fast-performance');
    });

    it('generates correct link for DESTINATION type with tag slug', () => {
        const destinationPosts: BlogPost[] = [
            {
                id: '1',
                title: 'Japan Travel Guide',
                slug: 'japan-travel-guide',
                content: 'Content',
                description: 'Explore Japan',
                status: PostStatus.PUBLISHED,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                category: { name: 'Destinations', slug: 'destinations' },
                categoryId: 'cat1',
                author: { id: 'auth1', name: 'John', username: 'john' } as any,
                tags: [{ id: 'tag1', name: 'Japan', slug: 'japan' }],
                type: PageType.DESTINATION,
            } as any,
            ...mockPosts.slice(1),
        ];

        render(
            <BentoFeatures
                sectionTitle="Test"
                sectionSubTitle="Test"
                posts={destinationPosts}
            />
        );

        const links = screen.getAllByRole('link');
        expect(links[0]).toHaveAttribute('href', '/destinations/japan');
    });

    it('generates correct link for DESTINATION type without tags', () => {
        const destinationPostsWithoutTags: BlogPost[] = [
            {
                id: '1',
                title: 'Japan Travel Guide',
                slug: 'japan-travel-guide',
                content: 'Content',
                description: 'Explore Japan',
                status: PostStatus.PUBLISHED,
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
                category: { name: 'Destinations', slug: 'destinations' },
                categoryId: 'cat1',
                author: { id: 'auth1', name: 'John', username: 'john' } as any,
                tags: [],
                type: PageType.DESTINATION,
            } as any,
            ...mockPosts.slice(1),
        ];

        render(
            <BentoFeatures
                sectionTitle="Test"
                sectionSubTitle="Test"
                posts={destinationPostsWithoutTags}
            />
        );

        const links = screen.getAllByRole('link');
        expect(links[0]).toHaveAttribute('href', '/destinations/japan-travel-guide');
    });

    it('applies all grid layout classes correctly for all indices', () => {
        const { container } = render(
            <BentoFeatures
                sectionTitle="Layout Test"
                sectionSubTitle="Grid check"
                posts={mockPosts}
            />
        );

        expect(container.innerHTML).toContain('lg:col-span-3 lg:rounded-tl-[2rem]');
        expect(container.innerHTML).toContain('lg:col-span-3 lg:rounded-tr-[2rem]');
        expect(container.innerHTML).toContain('lg:col-span-2 lg:rounded-bl-[2rem]');
        expect(container.innerHTML).toContain('lg:col-span-2');
        expect(container.innerHTML).toContain('lg:col-span-2 lg:rounded-br-[2rem]');
    });

    it('renders exactly 5 cards when 5 posts are provided', () => {
        render(
            <BentoFeatures
                sectionTitle="Test"
                sectionSubTitle="Test"
                posts={mockPosts}
            />
        );

        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(5);
    });

    it('does not render when posts array has more than 5 items', () => {
        const sixPosts = [...mockPosts, { ...mockPosts[0], id: '6', slug: 'sixth-post' }];
        const { container } = render(
            <BentoFeatures
                sectionTitle="Layout Test"
                sectionSubTitle="Grid check"
                posts={sixPosts as any}
            />
        );

        expect(container.firstChild).toBeNull();
    });
});

