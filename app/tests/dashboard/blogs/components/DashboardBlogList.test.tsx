import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BlogPost } from '@/app/types'
import { PageType } from '@prisma/client'
import DashboardBlogList from '@/app/dashboard/blogs/components/DashboardBlogList'

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
        username: 'johndoe'
    },
    status: 'DRAFT',
    type: PageType.BLOG_POST,
    tags: [],
    featured: false,
    pillarPage: false,
    trending: false
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
        expect(screen.getByRole('link', { name: /view/i })).toHaveAttribute('href', '/blog/draft/test-post')
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

    it('navigates to the edit page on Edit link click', () => {
        render(
            <DashboardBlogList
                posts={[mockPost]}
                loading={false}
                handleArchive={jest.fn()}
                handleDelete={jest.fn()}
            />
        )

        const editLink = screen.getByRole('link', { name: /edit/i })
        expect(editLink).toHaveAttribute('href', `/write?slug=${mockPost.slug}`)
    })

    it('navigates to the draft preview page on View link click for draft posts', () => {
        render(
            <DashboardBlogList
                posts={[mockPost]}
                loading={false}
                handleArchive={jest.fn()}
                handleDelete={jest.fn()}
            />
        )

        const viewLink = screen.getByRole('link', { name: /view/i })
        expect(viewLink).toHaveAttribute('href', `/blog/draft/${mockPost.slug}`)
    })

    it('navigates to the published blog page on View link click for published posts', () => {
        const publishedPost = { ...mockPost, status: 'PUBLISHED' as const }
        render(
            <DashboardBlogList
                posts={[publishedPost]}
                loading={false}
                handleArchive={jest.fn()}
                handleDelete={jest.fn()}
            />
        )

        const viewLink = screen.getByRole('link', { name: /view/i })
        expect(viewLink).toHaveAttribute('href', `/blog/${publishedPost.slug}`)
    })

    describe('Badge Display', () => {
        it('displays Featured badge when post is featured', () => {
            const featuredPost = { ...mockPost, featured: true }
            render(
                <DashboardBlogList
                    posts={[featuredPost]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/⭐ Featured/i)).toBeInTheDocument()
        })

        it('displays Pillar badge when post is a pillar page', () => {
            const pillarPost = { ...mockPost, pillarPage: true }
            render(
                <DashboardBlogList
                    posts={[pillarPost]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/📚 Pillar/i)).toBeInTheDocument()
        })

        it('displays Trending badge when post is trending', () => {
            const trendingPost = { ...mockPost, trending: true }
            render(
                <DashboardBlogList
                    posts={[trendingPost]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/🔥 Trending/i)).toBeInTheDocument()
        })

        it('displays multiple badges when post has multiple flags', () => {
            const multiBadgePost = { ...mockPost, featured: true, pillarPage: true, trending: true }
            render(
                <DashboardBlogList
                    posts={[multiBadgePost]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/⭐ Featured/i)).toBeInTheDocument()
            expect(screen.getByText(/📚 Pillar/i)).toBeInTheDocument()
            expect(screen.getByText(/🔥 Trending/i)).toBeInTheDocument()
        })

        it('does not display badge row when no flags are set', () => {
            render(
                <DashboardBlogList
                    posts={[mockPost]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.queryByText(/⭐ Featured/i)).not.toBeInTheDocument()
            expect(screen.queryByText(/📚 Pillar/i)).not.toBeInTheDocument()
            expect(screen.queryByText(/🔥 Trending/i)).not.toBeInTheDocument()
        })
    })

    describe('View Counter', () => {
        it('displays view count when views is defined', () => {
            const postWithViews = { ...mockPost, views: 1234 }
            render(
                <DashboardBlogList
                    posts={[postWithViews]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/👁️ 1,234 views/i)).toBeInTheDocument()
        })

        it('formats large view counts with commas', () => {
            const postWithManyViews = { ...mockPost, views: 1234567 }
            render(
                <DashboardBlogList
                    posts={[postWithManyViews]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/👁️ 1,234,567 views/i)).toBeInTheDocument()
        })

        it('displays zero views correctly', () => {
            const postWithZeroViews = { ...mockPost, views: 0 }
            render(
                <DashboardBlogList
                    posts={[postWithZeroViews]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/👁️ 0 views/i)).toBeInTheDocument()
        })

        it('does not display view counter when views is undefined', () => {
            render(
                <DashboardBlogList
                    posts={[mockPost]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.queryByText(/👁️/i)).not.toBeInTheDocument()
        })
    })

    describe('Read Time', () => {
        it('displays read time when readTime is defined', () => {
            const postWithReadTime = { ...mockPost, readTime: 8 }
            render(
                <DashboardBlogList
                    posts={[postWithReadTime]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/📖 8 min read/i)).toBeInTheDocument()
        })

        it('displays different read times correctly', () => {
            const postWithReadTime = { ...mockPost, readTime: 15 }
            render(
                <DashboardBlogList
                    posts={[postWithReadTime]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/📖 15 min read/i)).toBeInTheDocument()
        })

        it('does not display read time when readTime is undefined', () => {
            render(
                <DashboardBlogList
                    posts={[mockPost]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.queryByText(/📖/i)).not.toBeInTheDocument()
        })

        it('does not display read time when readTime is null', () => {
            const postWithNullReadTime = { ...mockPost, readTime: undefined }
            render(
                <DashboardBlogList
                    posts={[postWithNullReadTime]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.queryByText(/📖/i)).not.toBeInTheDocument()
        })

        it('displays both view count and read time together', () => {
            const postWithBoth = { ...mockPost, views: 5000, readTime: 10 }
            render(
                <DashboardBlogList
                    posts={[postWithBoth]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            expect(screen.getByText(/👁️ 5,000 views/i)).toBeInTheDocument()
            expect(screen.getByText(/📖 10 min read/i)).toBeInTheDocument()
        })
    })

    describe('Mobile Responsiveness', () => {
        it('applies responsive classes for mobile layout', () => {
            const { container } = render(
                <DashboardBlogList
                    posts={[mockPost]}
                    loading={false}
                    handleArchive={jest.fn()}
                    handleDelete={jest.fn()}
                />
            )

            // Check for responsive flex classes
            const cardContainer = container.querySelector('.flex.flex-col.md\\:flex-row')
            expect(cardContainer).toBeInTheDocument()

            // Check for responsive width classes
            const imageContainer = container.querySelector('.md\\:w-1\\/3.w-full')
            expect(imageContainer).toBeInTheDocument()

            const contentContainer = container.querySelector('.md\\:w-2\\/3.w-full')
            expect(contentContainer).toBeInTheDocument()
        })
    })
})
