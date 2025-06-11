import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BlogPost } from '@/app/types'
import DashboardBlogList from '@/app/dashboard/blogs/coponents/DashboardBlogList'

// Mock dynamic components
jest.mock('next/image', () => (props: any) => <img {...props} alt={props.alt || 'mock-image'} />)
jest.mock('@/app/components/FormattedDate', () => ({ dateString }: { dateString: string }) => (
    <span>{dateString}</span>
))

const mockPost: BlogPost = {
    id: '123',
    slug: 'test-post',
    title: 'Test Blog Title',
    description: 'This is a test blog post description',
    content: 'Full content here',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    image: 'https://example.com/image.jpg',
    category: { name: 'Tech', slug: 'tech' },
    categoryId: 'cat1',
    author: {
        id: 'author1',
        name: 'John',
        lastName: 'Doe',
        profilePicture: '',
        role: 'ADMIN',
        username: 'johndoe'
    },
    status: 'DRAFT',
    type: 'ARTICLE'
}

describe('DashboardBlogList', () => {
    it('shows loading state when loading is true', () => {
        render(
            <DashboardBlogList
                posts={[]}
                loading={true}
                handleArchive={jest.fn()}
                handleDelete={jest.fn()}
            />
        )
        expect(screen.getByText(/loading/i)).toBeInTheDocument()
        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders blog post data correctly', () => {
        render(
            <DashboardBlogList
                posts={[mockPost]}
                loading={false}
                handleArchive={jest.fn()}
                handleDelete={jest.fn()}
            />
        )

        expect(screen.getByText('Test Blog Title')).toBeInTheDocument()
        expect(screen.getByText('This is a test blog post description')).toBeInTheDocument()
        expect(screen.getByText('2024-01-01')).toBeInTheDocument()

        expect(
            screen.getByText((_, node) => {
                if (!node) return false
                const text = node.textContent || ''
                const hasText = text.includes('Tech')
                const childrenDontHaveIt = Array.from(node.children).every(
                    child => !child.textContent?.includes('Tech')
                )
                return hasText && childrenDontHaveIt
            })
        ).toBeInTheDocument()

        expect(screen.getByText('DRAFT')).toBeInTheDocument()
        expect(screen.getByAltText('Test Blog Title')).toHaveAttribute('src', mockPost.image)
        expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute('href', '/write?slug=test-post')
        expect(screen.getByRole('link', { name: /view/i })).toHaveAttribute('href', '/blog/test-post')
    })


    it('calls handleArchive and handleDelete on menu actions', () => {
        const mockArchive = jest.fn()
        const mockDelete = jest.fn()

        render(
            <DashboardBlogList
                posts={[mockPost]}
                loading={false}
                handleArchive={mockArchive}
                handleDelete={mockDelete}
            />
        )

        const menuButton = screen.getByRole('button')
        fireEvent.click(menuButton)

        fireEvent.click(screen.getByText('Archive'))
        expect(mockArchive).toHaveBeenCalledWith(mockPost)

        fireEvent.click(screen.getByText('Delete'))
        expect(mockDelete).toHaveBeenCalledWith(mockPost.id)
    })
})
