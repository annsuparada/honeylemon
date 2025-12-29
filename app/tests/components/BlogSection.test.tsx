import { render, screen } from '@testing-library/react';
import BlogSection from '@/app/components/BlogSection';
import '@testing-library/jest-dom';
import type { BlogPost } from '@/app/types';

// Mock FormattedDate component to simplify test
jest.mock('@/app/components/FormattedDate', () => ({ dateString }: { dateString: string }) => (
    <span>{dateString}</span>
));

jest.mock('@/app/components/ReadTime', () => ({
    __esModule: true,
    default: function ReadTime({ readTime }: { readTime?: number | null; className?: string }) {
        return readTime ? <span data-testid="read-time">{readTime} min read</span> : null;
    },
}));

const mockPosts: BlogPost[] = [
    {
        slug: 'test-post',
        title: 'Test Post Title',
        description: '<p>This is a <strong>test</strong> description.</p>',
        createdAt: '2024-01-01',
        image: 'https://example.com/image.jpg',
        author: {
            name: 'Jane',
            lastName: 'Doe',
            profilePicture: 'https://example.com/author.jpg',
            role: 'ADMIN',
            username: 'test_user',
            id: 'user123'
        },
        category: {
            name: 'Tech',
            slug: 'tech'
        },
        categoryId: 'cat1',
        updatedAt: '2024-01-01',
        id: '123',
        content: 'Short content',
        status: 'DRAFT',
        type: 'DEAL',
        tags: []
    },
];

describe('BlogSection Component', () => {
    it('renders title and subtitle', () => {
        render(
            <BlogSection
                title="Latest Blog Posts"
                subTitle="Stay updated with our news"
                posts={mockPosts}
            />
        );

        expect(screen.getByText('Latest Blog Posts')).toBeInTheDocument();
        expect(screen.getByText('Stay updated with our news')).toBeInTheDocument();
    });

    it('renders loading spinner if loading is true', () => {
        render(
            <BlogSection
                title="Loading..."
                subTitle=""
                posts={[]}
                loading={true}
            />
        );
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders post data correctly', () => {
        render(
            <BlogSection
                title="Test"
                subTitle="Sub"
                posts={mockPosts}
                showAuthor={true}
            />
        );

        expect(screen.getByText('Test Post Title')).toBeInTheDocument();
        expect(screen.getByText('Tech')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    });

    it('hides description when showDescription is false', () => {
        render(
            <BlogSection
                title="No Desc"
                subTitle=""
                posts={mockPosts}
                showDescription={false}
            />
        );

        expect(screen.queryByText(/This is a/)).not.toBeInTheDocument();
    });

    it('hides author when showAuthor is false', () => {
        render(
            <BlogSection
                title="No Author"
                subTitle=""
                posts={mockPosts}
                showAuthor={false}
            />
        );

        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('renders in three column layout when threeColumns is true', () => {
        const { container } = render(
            <BlogSection
                title="Three Columns"
                subTitle=""
                posts={mockPosts}
                threeColumns={true}
            />
        );

        expect(container.querySelector('.grid.grid-cols-1')).toBeInTheDocument();
    });
});
