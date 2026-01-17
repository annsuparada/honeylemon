import { render, screen, fireEvent, within, waitForElementToBeRemoved } from '@testing-library/react'
import '@testing-library/jest-dom'
import { usePathname } from 'next/navigation'
import Sidebar from '@/app/dashboard/Sidebar'

// Mocks
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}))

jest.mock('next/image', () => (props: any) => {
    return <img {...props} alt={props.alt || 'Travamad Logo'} />
})

describe('Sidebar Component', () => {
    beforeEach(() => {
        (usePathname as jest.Mock).mockReturnValue('/dashboard')
    })

    it('renders logo and navigation links with correct hrefs on desktop', () => {
        render(<Sidebar />)

        // Logo link
        const logos = screen.getAllByAltText(/Travamad Logo/i)
        expect(logos.length).toBeGreaterThan(0)

        // Check if any logo is wrapped in an anchor tag
        const wrappedLogo = logos.find((img) => img.closest('a') !== null)
        expect(wrappedLogo?.closest('a')).toHaveAttribute('href', '/')


        // Navigation Links
        const dashboardLink = screen.getAllByText('Dashboard')[0].closest('a')
        const blogsLink = screen.getByText('Blogs').closest('a')
        const scheduledLink = screen.getByText('Scheduled Publishing').closest('a')
        const seoLink = screen.getByText('SEO Keywords').closest('a')
        const profileLink = screen.getByText('Your Profile').closest('a')

        expect(dashboardLink).toHaveAttribute('href', '/dashboard')
        expect(blogsLink).toHaveAttribute('href', '/dashboard/blogs')
        expect(scheduledLink).toHaveAttribute('href', '/dashboard/scheduled')
        expect(seoLink).toHaveAttribute('href', '/dashboard/seo')
        expect(profileLink).toHaveAttribute('href', '/dashboard/profile')
    })

    it('opens and closes the mobile sidebar', async () => {
        render(<Sidebar />)

        const openButton = screen.getByRole('button', { name: /open sidebar/i })
        fireEvent.click(openButton)

        const dialog = screen.getByRole('dialog')
        expect(dialog).toBeInTheDocument()

        const dialogScope = within(dialog)
        const closeButton = dialogScope.getByRole('button', { name: /close sidebar/i })
        fireEvent.click(closeButton)

        // Wait for sidebar to disappear due to transition
        await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
    })


    it('highlights the current navigation link based on pathname', () => {
        render(<Sidebar />)

        const activeLinks = screen.getAllByText('Dashboard')
        activeLinks.forEach(link => {
            // Active state uses bg-base-100 text-primary
            expect(link.closest('a')).toHaveClass('bg-base-100')
            expect(link.closest('a')).toHaveClass('text-primary')
        })
    })

    it('renders Exit Dashboard link with correct href', () => {
        render(<Sidebar />)
        const exitLink = screen.getAllByText('Exit Dashboard')[0].closest('a')
        expect(exitLink).toHaveAttribute('href', '/')
    })
})
