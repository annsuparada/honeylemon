import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Dashboard from '@/app/dashboard/blogs/page'
import '@testing-library/jest-dom'
import { BlogPost } from '@/app/types'
import { PageType } from '@prisma/client'

// Mock entire postActions module
jest.mock('@/utils/postActions', () => ({
    fetchPosts: jest.fn(),
    deletePost: jest.fn(),
    updatePost: jest.fn(),
}))
import * as postActions from '@/utils/postActions'

// Mock child components
jest.mock('@/app/components/ProtectedPage', () => ({ children }: any) => <div>{children}</div>)
jest.mock('@/app/components/AlertMessage', () => ({ message }: any) => <div>{message.text}</div>)
jest.mock('@/app/components/PaginationClient', () => () => <div>Pagination</div>)
jest.mock('@/app/dashboard/blogs/components/DashboardBlogList', () => (props: any) => (
    <div>
        {props.loading ? 'Loading...' : `Blog list with ${props.posts.length} posts`}
        <button onClick={() => props.handleArchive(mockPost)}>Archive</button>
        <button onClick={() => props.handleDelete(mockPost.id)}>Delete</button>
    </div>
))
jest.mock('@/app/dashboard/blogs/components/BlogFilter', () => (props: any) => (
    <div>
        <select onChange={(e) => props.onStatusChange(e.target.value)} data-testid="status-select">
            <option value="ALL">All</option>
            <option value="DRAFT">Draft</option>
        </select>
        <select onChange={(e) => props.onTypeChange(e.target.value)} data-testid="type-select">
            <option value="ALL">All</option>
            <option value="BLOG">Blog</option>
        </select>
        <select onChange={(e) => props.onSortChange(e.target.value)} data-testid="sort-select">
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
            ; (postActions.deletePost as jest.Mock).mockResolvedValue(true)
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
        ; (postActions.deletePost as jest.Mock).mockResolvedValue(false)
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
    })
})
