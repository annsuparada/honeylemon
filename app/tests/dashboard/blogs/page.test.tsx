import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Dashboard from '@/app/dashboard/blogs/page'
import '@testing-library/jest-dom'
import { BlogPost } from '@/app/types'

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
    type: 'ARTICLE',
    category: { name: 'Tech', slug: 'tech' },
    categoryId: 'cat1',
    author: {
        id: 'u1',
        name: 'Jane',
        lastName: 'Doe',
        role: 'ADMIN',
        profilePicture: '',
        username: 'jane_doe',
    },
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
})
