import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Dashboard from '@/app/dashboard/blogs/page'
import '@testing-library/jest-dom'
import { BlogPost } from '@/app/types'
import { PageType } from '@prisma/client'

// Mock entire postActions module
jest.mock('@/utils/actions/postActions', () => ({
    fetchPosts: jest.fn(),
    deletePost: jest.fn(),
    updatePost: jest.fn(),
}))
import * as postActions from '@/utils/actions/postActions'

jest.mock('@honeylemon/ui', () => {
    const actual = jest.requireActual('@honeylemon/ui');
    return {
        ...actual,
        ProtectedPage: ({ children }: any) => <div>{children}</div>,
        AlertMessage: ({ message }: any) => <div>{message.text}</div>,
        PaginationClient: () => <div>Pagination</div>,
    };
})
jest.mock('@/app/dashboard/blogs/components/DashboardBlogList', () => (props: any) => (
    <div>
        {props.loading ? 'Loading...' : `Blog list with ${props.posts.length} posts`}
        <button onClick={() => props.handleArchive(mockPost)}>Archive</button>
        <button onClick={() => props.handleDelete(mockPost.id)}>Delete</button>
    </div>
))
jest.mock('@/app/dashboard/blogs/components/BlogFilter', () => (props: any) => (
    <div>
        <select onChange={(e) => props.onStatusChange(e.target.value)} data-testid="status-select" value={props.selectedStatus}>
            <option value="ALL">All</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
        </select>
        <select onChange={(e) => props.onTypeChange(e.target.value)} data-testid="type-select" value={props.selectedPageType}>
            <option value="ALL">All</option>
            <option value="BLOG_POST">Blog</option>
            <option value="DESTINATION">Destination</option>
        </select>
        <select onChange={(e) => props.onSortChange(e.target.value)} data-testid="sort-select" value={props.sortOrder}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
        </select>
        <input
            type="checkbox"
            checked={props.featuredOnly}
            onChange={(e) => props.onFeaturedChange(e.target.checked)}
            data-testid="featured-checkbox"
        />
        <input
            type="checkbox"
            checked={props.pillarPagesOnly}
            onChange={(e) => props.onPillarPagesChange(e.target.checked)}
            data-testid="pillar-checkbox"
        />
        <input
            type="checkbox"
            checked={props.trendingOnly}
            onChange={(e) => props.onTrendingChange(e.target.checked)}
            data-testid="trending-checkbox"
        />
    </div>
))

// Mock post data
const mockPost: BlogPost = {
    id: '1',
    slug: 'test-post',
    title: 'Test Title',
    description: 'Desc',
    content: 'Content',
    image: '',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-02',
    status: 'DRAFT',
    type: PageType.BLOG_POST,
    category: { name: 'Tech', slug: 'tech' },
    categoryId: 'cat1',
    author: {
        id: 'u1',
        name: 'Jane',
        lastName: 'Doe',
        profilePicture: '',
        username: 'jane_doe',
    },
    tags: [],
    featured: false,
    pillarPage: false,
    trending: false,
}

const mockFeaturedPost: BlogPost = {
    ...mockPost,
    id: '2',
    slug: 'featured-post',
    title: 'Featured Post',
    featured: true,
}

const mockPillarPost: BlogPost = {
    ...mockPost,
    id: '3',
    slug: 'pillar-post',
    title: 'Pillar Post',
    pillarPage: true,
}

const mockTrendingPost: BlogPost = {
    ...mockPost,
    id: '4',
    slug: 'trending-post',
    title: 'Trending Post',
    trending: true,
}

describe('Dashboard Page', () => {
    beforeEach(() => {
        ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([mockPost])
            ; (postActions.deletePost as jest.Mock).mockResolvedValue({ success: true })
            ; (postActions.updatePost as jest.Mock).mockResolvedValue({
                success: true,
                post: { ...mockPost, status: 'ARCHIVED' },
            })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders initial UI and fetched posts', async () => {
        render(<Dashboard />)

        expect(screen.getByText(/your stories/i)).toBeInTheDocument()
        expect(screen.getByText(/write/i)).toBeInTheDocument()

        await waitFor(() => {
            expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
        })
    })

    it('filters posts by status', async () => {
        render(<Dashboard />)
        await screen.findByText(/Blog list with 1 posts/i)

        fireEvent.change(screen.getByTestId('status-select'), { target: { value: 'DRAFT' } })

        await waitFor(() => {
            expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
        })
    })

    it('archives a post and shows success message', async () => {
        render(<Dashboard />)
        await screen.findByText(/Blog list with 1 posts/i)

        fireEvent.click(screen.getByText('Archive'))

        await waitFor(() => {
            expect(screen.getByText(/Post archived/i)).toBeInTheDocument()
        })
    })

    it('deletes a post and shows success message', async () => {
        jest.spyOn(window, 'confirm').mockReturnValue(true)

        render(<Dashboard />)
        await screen.findByText(/Blog list with 1 posts/i)

        fireEvent.click(screen.getByText('Delete'))

        await waitFor(() => {
            expect(screen.getByText(/Post deleted/i)).toBeInTheDocument()
        })
    })

    it('renders pagination when filtered posts exceed limit', async () => {
        ; (postActions.fetchPosts as jest.Mock).mockResolvedValue(Array(6).fill(mockPost))

        render(<Dashboard />)

        await screen.findByText(/Blog list with 5 posts/i) // page size is 5
        expect(screen.getByText('Pagination')).toBeInTheDocument()
    })

    it('shows error if archiving fails', async () => {
        ; (postActions.updatePost as jest.Mock).mockResolvedValue({ success: false })

        render(<Dashboard />)
        await screen.findByText(/Blog list with 1 posts/i)

        fireEvent.click(screen.getByText('Archive'))

        await waitFor(() => {
            expect(screen.getByText(/Failed to archive post/i)).toBeInTheDocument()
        })
    })

    it('does not show success if deletePost fails', async () => {
        ; (postActions.deletePost as jest.Mock).mockResolvedValue({ success: false, error: 'Failed to delete' })
        jest.spyOn(window, 'confirm').mockReturnValue(true)

        render(<Dashboard />)
        await screen.findByText(/Blog list with 1 posts/i)

        fireEvent.click(screen.getByText('Delete'))

        await waitFor(() => {
            expect(screen.queryByText(/Post deleted/i)).not.toBeInTheDocument()
        })
    })

    it('handles fetchPosts failure gracefully', async () => {
        ; (postActions.fetchPosts as jest.Mock).mockRejectedValue(new Error('fetch failed'))

        render(<Dashboard />)

        await waitFor(() => {
            expect(screen.queryByText(/Blog list with/i)).not.toBeInTheDocument()
        })
    })

    describe('Special Filters', () => {
        it('filters posts by featured flag', async () => {
            ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                mockPost,
                mockFeaturedPost,
            ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 2 posts/i)

            const featuredCheckbox = screen.getByTestId('featured-checkbox')
            fireEvent.click(featuredCheckbox)

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            })
        })

        it('filters posts by pillarPage flag', async () => {
            ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                mockPost,
                mockPillarPost,
            ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 2 posts/i)

            const pillarCheckbox = screen.getByTestId('pillar-checkbox')
            fireEvent.click(pillarCheckbox)

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            })
        })

        it('filters posts by trending flag', async () => {
            ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                mockPost,
                mockTrendingPost,
            ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 2 posts/i)

            const trendingCheckbox = screen.getByTestId('trending-checkbox')
            fireEvent.click(trendingCheckbox)

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            })
        })

        it('combines multiple special filters', async () => {
            const mockFeaturedPillarPost: BlogPost = {
                ...mockPost,
                id: '5',
                slug: 'featured-pillar-post',
                title: 'Featured Pillar Post',
                featured: true,
                pillarPage: true,
            }

                ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                    mockPost,
                    mockFeaturedPost,
                    mockPillarPost,
                    mockFeaturedPillarPost,
                ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 4 posts/i)

            // Enable both featured and pillar filters
            fireEvent.click(screen.getByTestId('featured-checkbox'))
            fireEvent.click(screen.getByTestId('pillar-checkbox'))

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            })
        })

        it('combines special filters with status filter', async () => {
            // Create a post that is both DRAFT and featured
            const mockDraftFeaturedPost: BlogPost = {
                ...mockFeaturedPost,
                id: '5',
                slug: 'draft-featured-post',
                status: 'DRAFT' as const,
            }

                ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                    mockPost, // DRAFT, not featured
                    mockDraftFeaturedPost, // DRAFT, featured
                ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 2 posts/i)

            // Filter by featured first
            fireEvent.click(screen.getByTestId('featured-checkbox'))

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            }, { timeout: 3000 })

            // The remaining post should be the featured one
            // Both posts are DRAFT, so status filter shouldn't change the count
            fireEvent.change(screen.getByTestId('status-select'), {
                target: { value: 'DRAFT' },
            })

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            }, { timeout: 3000 })
        })

        it('combines special filters with page type filter (Destination)', async () => {
            const mockDestinationFeaturedPost: BlogPost = {
                ...mockPost,
                id: '6',
                slug: 'destination-featured-post',
                type: PageType.DESTINATION,
                featured: true,
            }

            const mockBlogFeaturedPost: BlogPost = {
                ...mockPost,
                id: '7',
                slug: 'blog-featured-post',
                type: PageType.BLOG_POST,
                featured: true,
            }

                ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                    mockPost, // BLOG_POST, not featured
                    mockDestinationFeaturedPost, // DESTINATION, featured
                    mockBlogFeaturedPost, // BLOG_POST, featured
                ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 3 posts/i)

            // Filter by featured first
            fireEvent.click(screen.getByTestId('featured-checkbox'))

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 2 posts/i)).toBeInTheDocument()
            }, { timeout: 3000 })

            // Now filter by DESTINATION page type
            fireEvent.change(screen.getByTestId('type-select'), {
                target: { value: PageType.DESTINATION },
            })

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            }, { timeout: 3000 })
        })

        it('combines Featured + Published + Destination filters', async () => {
            const mockPublishedDestinationFeaturedPost: BlogPost = {
                ...mockPost,
                id: '8',
                slug: 'published-destination-featured',
                type: PageType.DESTINATION,
                status: 'PUBLISHED' as const,
                featured: true,
            }

            const mockDraftDestinationFeaturedPost: BlogPost = {
                ...mockPost,
                id: '9',
                slug: 'draft-destination-featured',
                type: PageType.DESTINATION,
                status: 'DRAFT' as const,
                featured: true,
            }

                ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                    mockPost, // BLOG_POST, DRAFT, not featured
                    mockPublishedDestinationFeaturedPost, // DESTINATION, PUBLISHED, featured
                    mockDraftDestinationFeaturedPost, // DESTINATION, DRAFT, featured
                ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 3 posts/i)

            // Apply all three filters
            fireEvent.click(screen.getByTestId('featured-checkbox'))
            fireEvent.change(screen.getByTestId('status-select'), {
                target: { value: 'PUBLISHED' },
            })
            fireEvent.change(screen.getByTestId('type-select'), {
                target: { value: PageType.DESTINATION },
            })

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            }, { timeout: 3000 })
        })
    })

    describe('Existing Filters Still Work', () => {
        it('status filter still works independently', async () => {
            const publishedPost = { ...mockPost, id: '10', slug: 'published', status: 'PUBLISHED' as const }
                ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                    mockPost, // DRAFT
                    publishedPost, // PUBLISHED
                ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 2 posts/i)

            fireEvent.change(screen.getByTestId('status-select'), {
                target: { value: 'PUBLISHED' },
            })

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            })
        })

        it('page type filter still works independently', async () => {
            const destinationPost = { ...mockPost, id: '11', slug: 'destination', type: PageType.DESTINATION }
                ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                    mockPost, // BLOG_POST
                    destinationPost, // DESTINATION
                ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 2 posts/i)

            fireEvent.change(screen.getByTestId('type-select'), {
                target: { value: PageType.DESTINATION },
            })

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            })
        })

        it('sort order still works independently', async () => {
            const oldPost = { ...mockPost, id: '12', slug: 'old', updatedAt: '2024-01-01' }
            const newPost = { ...mockPost, id: '13', slug: 'new', updatedAt: '2024-01-02' }
                ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([oldPost, newPost])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 2 posts/i)

            // Change to oldest first
            fireEvent.change(screen.getByTestId('sort-select'), {
                target: { value: 'oldest' },
            })

            // Sort order change should maintain the same count
            await waitFor(() => {
                expect(screen.getByText(/Blog list with 2 posts/i)).toBeInTheDocument()
            })
        })

        it('all filters work together correctly', async () => {
            const targetPost: BlogPost = {
                ...mockPost,
                id: '14',
                slug: 'target',
                status: 'PUBLISHED' as const,
                type: PageType.DESTINATION,
                featured: true,
            }

                ; (postActions.fetchPosts as jest.Mock).mockResolvedValue([
                    mockPost, // DRAFT, BLOG_POST, not featured
                    { ...mockPost, id: '15', status: 'PUBLISHED' as const }, // PUBLISHED, BLOG_POST, not featured
                    { ...mockPost, id: '16', type: PageType.DESTINATION }, // DRAFT, DESTINATION, not featured
                    { ...mockPost, id: '17', featured: true }, // DRAFT, BLOG_POST, featured
                    targetPost, // PUBLISHED, DESTINATION, featured
                ])

            render(<Dashboard />)
            await screen.findByText(/Blog list with 5 posts/i)

            // Apply all filters
            fireEvent.change(screen.getByTestId('status-select'), { target: { value: 'PUBLISHED' } })
            fireEvent.change(screen.getByTestId('type-select'), { target: { value: PageType.DESTINATION } })
            fireEvent.click(screen.getByTestId('featured-checkbox'))

            await waitFor(() => {
                expect(screen.getByText(/Blog list with 1 posts/i)).toBeInTheDocument()
            }, { timeout: 3000 })
        })
    })
})
