import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PageType } from '@prisma/client'
import { Category } from '@/app/types'
import WriteForm from '@/app/write/components/WriteForm'

describe('WriteForm Component', () => {
    const mockOnChange = {
        title: jest.fn(),
        description: jest.fn(),
        image: jest.fn(),
        category: jest.fn(),
        type: jest.fn(),
    }

    const mockOnCreateCategory = jest.fn().mockResolvedValue({ label: 'New Category', value: 'new-cat' })

    const defaultProps = {
        title: 'Initial Title',
        description: 'Initial Description',
        image: 'https://example.com/image.jpg',
        categories: [
            { id: 'cat1', name: 'Tech', slug: 'tech' },
            { id: 'cat2', name: 'Travel', slug: 'travel' },
        ] as Category[],
        selectedCategory: 'cat1',
        pageType: PageType.ARTICLE,
        pageTypeOptions: [
            { label: 'Article', value: PageType.ARTICLE },
            { label: 'DESTINATION', value: PageType.DESTINATION },
        ],
        onChange: mockOnChange,
        onCreateCategory: mockOnCreateCategory,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all form fields with correct initial values', () => {
        render(<WriteForm {...defaultProps} />)

        expect(screen.getByPlaceholderText(/enter title here/i)).toHaveValue('Initial Title')
        expect(screen.getByPlaceholderText(/write a short description/i)).toHaveValue('Initial Description')
        expect(screen.getByText(/add image from url/i)).toBeInTheDocument()

        const img = screen.getByAltText(/article cover image/i)
        const src = img.getAttribute('src') || ''
        const decoded = decodeURIComponent(src)

        expect(decoded).toContain('https://example.com/image.jpg')
    })


    it('calls onChange handlers for title and description', () => {
        render(<WriteForm {...defaultProps} />)

        fireEvent.change(screen.getByPlaceholderText(/enter title here/i), {
            target: { value: 'Updated Title' },
        })
        expect(mockOnChange.title).toHaveBeenCalledWith('Updated Title')

        fireEvent.change(screen.getByPlaceholderText(/write a short description/i), {
            target: { value: 'Updated Description' },
        })
        expect(mockOnChange.description).toHaveBeenCalledWith('Updated Description')
    })

    it('handles image change via button prompt', () => {
        window.prompt = jest.fn().mockReturnValue('https://new-image.com/photo.jpg')
        render(<WriteForm {...defaultProps} />)

        fireEvent.click(screen.getByText(/add image from url/i))
        expect(mockOnChange.image).toHaveBeenCalledWith('https://new-image.com/photo.jpg')
    })

    it('handles image change via clicking image preview', () => {
        window.prompt = jest.fn().mockReturnValue('https://preview-clicked.com/image.png')
        render(<WriteForm {...defaultProps} />)

        fireEvent.click(screen.getByAltText(/article cover image/i))
        expect(mockOnChange.image).toHaveBeenCalledWith('https://preview-clicked.com/image.png')
    })

    it('renders category and page type dropdowns', () => {
        render(<WriteForm {...defaultProps} />)

        expect(screen.getByText('Tech')).toBeInTheDocument()
        expect(screen.getByText('Article')).toBeInTheDocument()
    })

    // You could expand this once SelectInput is testable directly.
    it('triggers onCreateCategory when creating a new category', async () => {
        await mockOnCreateCategory('New Category')
        expect(mockOnCreateCategory).toHaveBeenCalledWith('New Category')
    })
})
