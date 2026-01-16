/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InternalLinkModal from '@/app/components/tiptap/InternalLinkModal';
import { BlogPost } from '@/app/types';
import { PageType, PostStatus } from '@prisma/client';
import { getPostRoute } from '@/utils/helpers/routeHelpers';

// Mock getPostRoute
jest.mock('@/utils/helpers/routeHelpers', () => ({
    getPostRoute: jest.fn((type, slug, tagSlug) => {
        if (type === PageType.DESTINATION && tagSlug) {
            return `/destinations/${tagSlug}`;
        }
        return `/blog/${slug}`;
    }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('InternalLinkModal', () => {
    const mockOnInsert = jest.fn();
    const mockOnClose = jest.fn();

    const mockPosts: BlogPost[] = [
        {
            id: '1',
            title: 'Test Blog Post',
            slug: 'test-blog-post',
            content: 'Test content',
            status: PostStatus.PUBLISHED,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
            category: {
                name: 'Travel',
                slug: 'travel',
            },
            categoryId: 'cat1',
            author: {
                id: 'author1',
                name: 'John',
                username: 'john',
            },
            tags: [],
            type: PageType.BLOG_POST,
        },
        {
            id: '2',
            title: 'Another Post',
            slug: 'another-post',
            content: 'Another content',
            status: PostStatus.PUBLISHED,
            createdAt: '2024-01-02T00:00:00Z',
            updatedAt: '2024-01-02T00:00:00Z',
            category: {
                name: 'Food',
                slug: 'food',
            },
            categoryId: 'cat2',
            author: {
                id: 'author2',
                name: 'Jane',
                username: 'jane',
            },
            tags: [],
            type: PageType.BLOG_POST,
        },
        {
            id: '3',
            title: 'Thailand Destination Guide',
            slug: 'thailand-guide',
            content: 'Thailand content',
            status: PostStatus.PUBLISHED,
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-03T00:00:00Z',
            category: {
                name: 'Destinations',
                slug: 'destinations',
            },
            categoryId: 'cat3',
            author: {
                id: 'author3',
                name: 'Bob',
                username: 'bob',
            },
            tags: [
                {
                    id: 'tag1',
                    name: 'Thailand',
                    slug: 'thailand',
                },
            ],
            type: PageType.DESTINATION,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (fetch as jest.Mock).mockClear();
        global.fetch = jest.fn() as jest.Mock;
    });

    it('does not render when isOpen is false', () => {
        render(
            <InternalLinkModal
                isOpen={false}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        expect(screen.queryByText('Add Internal Link')).not.toBeInTheDocument();
    });

    it('renders modal when isOpen is true', () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: [],
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        expect(screen.getByText('Add Internal Link')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search posts by title...')).toBeInTheDocument();
    });

    it('fetches published posts when modal opens', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: mockPosts,
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith('/api/post?status=PUBLISHED', {
                method: 'GET',
                cache: 'no-store',
            });
        });
    });

    it('displays loading state while fetching posts', async () => {
        (fetch as jest.Mock).mockImplementationOnce(() =>
            new Promise((resolve) =>
                setTimeout(
                    () =>
                        resolve({
                            ok: true,
                            json: async () => ({
                                success: true,
                                posts: mockPosts,
                            }),
                        }),
                    100
                )
            )
        );

        const { container } = render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        // Check for loading spinner
        const loadingSpinner = container.querySelector('.loading');
        expect(loadingSpinner).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
        });
    });

    it('displays posts after successful fetch', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: mockPosts,
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
            expect(screen.getByText('Another Post')).toBeInTheDocument();
            expect(screen.getByText('Thailand Destination Guide')).toBeInTheDocument();
        });
    });

    it('displays post category and type', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: [mockPosts[0]],
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Travel')).toBeInTheDocument();
            expect(screen.getByText('BLOG POST')).toBeInTheDocument();
        });
    });

    it('filters posts by search query', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: mockPosts,
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search posts by title...');
        fireEvent.change(searchInput, { target: { value: 'Another' } });

        await waitFor(() => {
            expect(screen.getByText('Another Post')).toBeInTheDocument();
            expect(screen.queryByText('Test Blog Post')).not.toBeInTheDocument();
            expect(screen.queryByText('Thailand Destination Guide')).not.toBeInTheDocument();
        });
    });

    it('search is case-insensitive', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: mockPosts,
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search posts by title...');
        fireEvent.change(searchInput, { target: { value: 'TEST' } });

        await waitFor(() => {
            expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
        });
    });

    it('shows empty state when no posts match search', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: mockPosts,
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search posts by title...');
        fireEvent.change(searchInput, { target: { value: 'Nonexistent Post' } });

        await waitFor(() => {
            expect(
                screen.getByText('No published posts found matching "Nonexistent Post"')
            ).toBeInTheDocument();
        });
    });

    it('shows empty state when no posts are available', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: [],
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('No published posts available')).toBeInTheDocument();
        });
    });

    it('calls onInsert with correct URL when post is selected', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: [mockPosts[0]],
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
        });

        const postButton = screen.getByText('Test Blog Post').closest('button');
        if (postButton) {
            fireEvent.click(postButton);
        }

        await waitFor(() => {
            expect(getPostRoute).toHaveBeenCalledWith(PageType.BLOG_POST, 'test-blog-post', undefined);
            expect(mockOnInsert).toHaveBeenCalledWith('/blog/test-blog-post');
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('handles DESTINATION posts with tag slug correctly', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: [mockPosts[2]], // Thailand destination post
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Thailand Destination Guide')).toBeInTheDocument();
        });

        const postButton = screen.getByText('Thailand Destination Guide').closest('button');
        if (postButton) {
            fireEvent.click(postButton);
        }

        await waitFor(() => {
            expect(getPostRoute).toHaveBeenCalledWith(
                PageType.DESTINATION,
                'thailand-guide',
                'thailand'
            );
            expect(mockOnInsert).toHaveBeenCalledWith('/destinations/thailand');
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('displays error message when fetch fails', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: false,
                error: 'Failed to fetch posts',
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch posts')).toBeInTheDocument();
        });
    });

    it('displays error message when network request fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    it('closes modal when close button is clicked', () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: [],
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('closes modal when cancel button is clicked', () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: [],
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets search query when modal closes', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                posts: mockPosts,
            }),
        });

        const { rerender } = render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Test Blog Post')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Search posts by title...') as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: 'Test' } });

        expect(searchInput.value).toBe('Test');

        // Close modal
        rerender(
            <InternalLinkModal
                isOpen={false}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        // Reopen modal
        rerender(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            const newSearchInput = screen.getByPlaceholderText('Search posts by title...') as HTMLInputElement;
            expect(newSearchInput.value).toBe('');
        });
    });

    it('handles posts without category gracefully', async () => {
        const postWithoutCategory: BlogPost = {
            ...mockPosts[0],
            category: {
                name: 'Uncategorized',
                slug: 'uncategorized',
            },
        };

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                success: true,
                posts: [postWithoutCategory],
            }),
        });

        render(
            <InternalLinkModal
                isOpen={true}
                onClose={mockOnClose}
                onInsert={mockOnInsert}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Uncategorized')).toBeInTheDocument();
        });
    });
});

