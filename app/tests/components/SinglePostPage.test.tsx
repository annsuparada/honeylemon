/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SinglePostPage from '@/app/components/SinglePostPage';
import { BlogPost } from '@/app/types';

// Mock dynamic imports
jest.mock('@/app/components/ShareButton', () => {
    return function ShareButton({ title }: { title: string }) {
        return <div data-testid="share-button">{title}</div>;
    };
});

jest.mock('@/app/components/EditPostButton', () => {
    return function EditPostButton({ slug }: { slug: string; authorId: string }) {
        return <div data-testid="edit-post-button">{slug}</div>;
    };
});

jest.mock('@/app/components/CTA', () => {
    return function CTA({ title }: { title: string; subtitle: string; buttonText: string; buttonUrl: string }) {
        return <div data-testid="cta">{title}</div>;
    };
});

jest.mock('@/app/components/BlogSection', () => {
    return function BlogSection({ title, posts }: { title: string; subTitle: string; posts: BlogPost[]; threeColumns: boolean }) {
        return <div data-testid="blog-section">{title} - {posts.length} posts</div>;
    };
});

jest.mock('@/app/components/FAQSection', () => {
    return function FAQSection({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
        return <div data-testid="faq-section">{faqs.length} FAQs</div>;
    };
});

jest.mock('@/app/components/HeroSection', () => {
    return function HeroSection({ title, description }: { title: string; description?: string;[key: string]: any }) {
        return <div data-testid="hero-section">{title} - {description}</div>;
    };
});

jest.mock('@/app/components/Breadcrumb', () => {
    return function Breadcrumb({ items }: { items: Array<{ name: string; href: string; current: boolean }> }) {
        return <nav data-testid="breadcrumb">{items.map(item => item.name).join(' > ')}</nav>;
    };
});

jest.mock('@/app/components/TableOfContents', () => {
    return function TableOfContents({ headings }: { headings: Array<{ id: string; text: string; level: number }> }) {
        return headings.length > 0 ? <div data-testid="table-of-contents">{headings.length} headings</div> : null;
    };
});

jest.mock('next/image', () => ({
    __esModule: true,
    default: function Image({ alt, src }: { alt: string; src: string }) {
        return <img alt={alt} src={src} data-testid="post-image" />;
    },
}));

jest.mock('sanitize-html', () => {
    const mockSanitizeHtml = jest.fn((html: string, options?: any) => html);
    (mockSanitizeHtml as any).defaults = {
        allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'blockquote'],
        allowedAttributes: {},
    };
    return {
        __esModule: true,
        default: mockSanitizeHtml,
    };
});

jest.mock('@/app/lip/toc-helpers', () => ({
    extractHeadings: jest.fn(() => []),
    addIdsToHeadings: jest.fn((html: string) => html),
}));

jest.mock('@/app/components/ReadTime', () => ({
    __esModule: true,
    default: function ReadTime({ readTime }: { readTime?: number | null }) {
        return readTime ? <span data-testid="read-time">{readTime} min read</span> : null;
    },
}));

jest.mock('@/app/components/ViewCounter', () => ({
    __esModule: true,
    default: function ViewCounter() {
        return null;
    },
}));

jest.mock('@/app/lip/structured-data-helpers', () => ({
    generateArticleStructuredData: jest.fn(() => ({ '@context': 'https://schema.org' })),
    generateFAQStructuredData: jest.fn(() => null),
    generateBreadcrumbListStructuredData: jest.fn(() => ({ '@context': 'https://schema.org' })),
    generateItemListStructuredData: jest.fn(() => null),
    formatAuthorName: jest.fn((author: { name: string; lastName?: string }) =>
        author.lastName ? `${author.name} ${author.lastName}` : author.name
    ),
}));

const mockPost: BlogPost = {
    id: 'post123',
    title: 'Test Post Title',
    slug: 'test-post',
    content: '<h2>Introduction</h2><p>This is test content with <strong>formatting</strong>.</p>',
    description: 'Test description for the post',
    image: 'https://example.com/image.jpg',
    status: 'PUBLISHED',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    category: {
        name: 'Technology',
        slug: 'technology',
    },
    categoryId: 'cat123',
    author: {
        id: 'user123',
        name: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        profilePicture: 'https://example.com/avatar.jpg',
    },
    tags: [
        { id: 'tag1', name: 'react', slug: 'react' },
        { id: 'tag2', name: 'nextjs', slug: 'nextjs' },
    ],
    type: 'ARTICLE',
    faqs: [
        {
            id: 'faq1',
            question: 'What is this about?',
            answer: 'This is a test answer.',
            order: 1,
        },
    ],
    itemListItems: [],
};

const mockRelatedPosts: BlogPost[] = [
    { ...mockPost, id: 'post2', slug: 'related-post-1', title: 'Related Post 1' },
    { ...mockPost, id: 'post3', slug: 'related-post-2', title: 'Related Post 2' },
];

describe('SinglePostPage Component', () => {
    const defaultProps = {
        post: mockPost,
        relatedPosts: mockRelatedPosts,
        routePrefix: '/blog',
        breadcrumbLabel: 'Blog',
        blogSectionTitle: 'Latest Posts',
        blogSectionSubtitle: 'Check out these posts',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders post not found when post is null', () => {
        render(
            <SinglePostPage
                {...defaultProps}
                post={null}
            />
        );

        expect(screen.getByText('Post Not Found')).toBeInTheDocument();
    });

    it('renders hero section with post title and description', () => {
        render(<SinglePostPage {...defaultProps} />);

        const hero = screen.getByTestId('hero-section');
        expect(hero).toHaveTextContent('Test Post Title');
        expect(hero).toHaveTextContent('Test description for the post');
    });

    it('renders breadcrumb with correct items', () => {
        render(<SinglePostPage {...defaultProps} />);

        const breadcrumb = screen.getByTestId('breadcrumb');
        expect(breadcrumb).toHaveTextContent('Blog > Test Post Title');
    });

    it('renders category badge', () => {
        render(<SinglePostPage {...defaultProps} />);

        expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('renders edit post button and share button', () => {
        render(<SinglePostPage {...defaultProps} />);

        expect(screen.getByTestId('edit-post-button')).toHaveTextContent('test-post');
        expect(screen.getByTestId('share-button')).toHaveTextContent('Test Post Title');
    });

    it('renders featured image', () => {
        render(<SinglePostPage {...defaultProps} />);

        const image = screen.getByTestId('post-image');
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
        expect(image).toHaveAttribute('alt', 'Test Post Title');
    });

    it('renders post content', () => {
        render(<SinglePostPage {...defaultProps} />);

        expect(screen.getByText(/This is test content/)).toBeInTheDocument();
    });

    it('renders FAQ section when FAQs are present', () => {
        render(<SinglePostPage {...defaultProps} />);

        const faqSection = screen.getByTestId('faq-section');
        expect(faqSection).toHaveTextContent('1 FAQs');
    });

    it('does not render FAQ section when FAQs are empty', () => {
        const postWithoutFaqs = { ...mockPost, faqs: [] };
        render(<SinglePostPage {...defaultProps} post={postWithoutFaqs} />);

        expect(screen.queryByTestId('faq-section')).not.toBeInTheDocument();
    });

    it('renders tags with formatted names', () => {
        render(<SinglePostPage {...defaultProps} />);

        expect(screen.getByText('Tags')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Nextjs')).toBeInTheDocument();
    });

    it('formats tag names correctly (capitalizes and replaces dashes)', () => {
        const postWithDashedTags = {
            ...mockPost,
            tags: [
                { id: 'tag1', name: 'react-hooks', slug: 'react-hooks' },
                { id: 'tag2', name: 'next-js-app', slug: 'next-js-app' },
            ],
        };
        render(<SinglePostPage {...defaultProps} post={postWithDashedTags} />);

        expect(screen.getByText('React Hooks')).toBeInTheDocument();
        expect(screen.getByText('Next Js App')).toBeInTheDocument();
    });

    it('does not render tags section when tags are empty', () => {
        const postWithoutTags = { ...mockPost, tags: [] };
        render(<SinglePostPage {...defaultProps} post={postWithoutTags} />);

        expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });

    it('renders CTA section', () => {
        render(<SinglePostPage {...defaultProps} />);

        const cta = screen.getByTestId('cta');
        expect(cta).toHaveTextContent('Ready to Book?');
    });

    it('renders blog section with related posts', () => {
        render(<SinglePostPage {...defaultProps} />);

        const blogSection = screen.getByTestId('blog-section');
        expect(blogSection).toHaveTextContent('Latest Posts');
        expect(blogSection).toHaveTextContent('2 posts');
    });

    it('uses correct route prefix in breadcrumb', () => {
        render(<SinglePostPage {...defaultProps} routePrefix="/destinations" breadcrumbLabel="Destinations" />);

        const breadcrumb = screen.getByTestId('breadcrumb');
        expect(breadcrumb).toHaveTextContent('Destinations > Test Post Title');
    });

    it('renders structured data scripts', () => {
        const { container } = render(<SinglePostPage {...defaultProps} />);

        const scripts = container.querySelectorAll('script[type="application/ld+json"]');
        expect(scripts.length).toBeGreaterThan(0);
    });

    it('renders default image when post image is missing', () => {
        const postWithoutImage = { ...mockPost, image: undefined };
        render(<SinglePostPage {...defaultProps} post={postWithoutImage} />);

        const image = screen.getByTestId('post-image');
        expect(image).toHaveAttribute('src', 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp');
    });

    it('does not render table of contents when there are no headings', () => {
        render(<SinglePostPage {...defaultProps} />);

        expect(screen.queryByTestId('table-of-contents')).not.toBeInTheDocument();
    });
});

