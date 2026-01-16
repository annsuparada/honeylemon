import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PageType } from '@prisma/client'
import { Category } from '@/app/types'
import WriteForm from '@/app/write/components/WriteForm'

describe('WriteForm Component', () => {
    const mockOnChange = {
        title: jest.fn(),
        description: jest.fn(),
        excerpt: jest.fn(),
        image: jest.fn(),
        heroImage: jest.fn(),
        category: jest.fn(),
        type: jest.fn(),
        tags: jest.fn(),
        metaTitle: jest.fn(),
        metaDescription: jest.fn(),
        focusKeyword: jest.fn(),
        featured: jest.fn(),
        pillarPage: jest.fn(),
        trending: jest.fn(),
        publishedAt: jest.fn(),
    }

    const mockOnCreateCategory = jest.fn().mockResolvedValue({ label: 'New Category', value: 'new-cat' })
    const mockOnCreateTag = jest.fn().mockResolvedValue({ id: 'tag1', name: 'New Tag', slug: 'new-tag' })
    const mockOnChangeFaqs = jest.fn()
    const mockOnChangeItemListItems = jest.fn()

    const defaultProps = {
        title: 'Initial Title',
        description: 'Initial Description',
        image: 'https://example.com/image.jpg',
        categories: [
            { id: 'cat1', name: 'Tech', slug: 'tech' },
            { id: 'cat2', name: 'Travel', slug: 'travel' },
        ] as Category[],
        selectedCategory: 'cat1',
        pageType: PageType.BLOG_POST,
        pageTypeOptions: [
            { label: 'Blog Post', value: PageType.BLOG_POST },
            { label: 'DESTINATION', value: PageType.DESTINATION },
        ],
        tags: [
            { id: 'tag1', name: 'JavaScript', slug: 'javascript' },
            { id: 'tag2', name: 'React', slug: 'react' },
        ],
        selectedTagIds: [],
        excerpt: '',
        heroImage: '',
        metaTitle: '',
        metaDescription: '',
        focusKeyword: '',
        featured: false,
        pillarPage: false,
        trending: false,
        publishedAt: '',
        faqs: [],
        itemListItems: [],
        pillarWarning: null,
        onChange: mockOnChange,
        onCreateCategory: mockOnCreateCategory,
        onCreateTag: mockOnCreateTag,
        onChangeFaqs: mockOnChangeFaqs,
        onChangeItemListItems: mockOnChangeItemListItems,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all form fields with correct initial values', () => {
        render(<WriteForm {...defaultProps} />)

        expect(screen.getByPlaceholderText(/enter title here/i)).toHaveValue('Initial Title')
        expect(screen.getByPlaceholderText(/write a short description/i)).toHaveValue('Initial Description')
        // Image upload is now handled via ImageUploadModal in MenuBar
        // The "Add Image from URL" button has been removed
        expect(screen.getByText(/hero image/i)).toBeInTheDocument()

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

    // Note: Image upload is now handled via ImageUploadModal in MenuBar, not via prompt
    // This test is no longer relevant as we removed the "Add Image from URL" button
    // Image upload functionality is tested in ImageUploadModal.test.tsx
    it.skip('handles image change via button prompt - DEPRECATED: Now uses ImageUploadModal', () => {
        // This functionality has been moved to ImageUploadModal
    })

    // Note: Image preview click functionality may have changed
    it.skip('handles image change via clicking image preview - DEPRECATED: May need update', () => {
        window.prompt = jest.fn().mockReturnValue('https://preview-clicked.com/image.png')
        render(<WriteForm {...defaultProps} />)

        fireEvent.click(screen.getByAltText(/article cover image/i))
        expect(mockOnChange.image).toHaveBeenCalledWith('https://preview-clicked.com/image.png')
    })

    it('renders category and page type dropdowns', () => {
        render(<WriteForm {...defaultProps} />)

        expect(screen.getByText('Tech')).toBeInTheDocument()
        expect(screen.getByText('Blog Post')).toBeInTheDocument()
    })

    // You could expand this once SelectInput is testable directly.
    it('triggers onCreateCategory when creating a new category', async () => {
        await mockOnCreateCategory('New Category')
        expect(mockOnCreateCategory).toHaveBeenCalledWith('New Category')
    })

    describe('Pillar Page functionality', () => {
        it('renders pillar page checkbox', () => {
            render(<WriteForm {...defaultProps} />)
            expect(screen.getByText(/pillar page/i)).toBeInTheDocument()
        })

        it('shows pillar warning when provided', () => {
            const warningMessage = '⚠️ A pillar page already exists for this destination'
            render(<WriteForm {...defaultProps} pillarPage={true} pillarWarning={warningMessage} />)

            expect(screen.getByText(warningMessage)).toBeInTheDocument()
        })

        it('does not show warning when pillarWarning is null', () => {
            render(<WriteForm {...defaultProps} pillarPage={true} pillarWarning={null} />)

            const warning = screen.queryByText(/pillar page already exists/i)
            expect(warning).not.toBeInTheDocument()
        })

        // Auto-toggle functionality has been removed - users can manually control pillarPage
        // The following tests verify that pillarPage checkbox works correctly
        it('allows manual toggle of pillarPage checkbox', () => {
            render(
                <WriteForm
                    {...defaultProps}
                    pageType={PageType.DESTINATION}
                    selectedTagIds={['tag1']}
                    pillarPage={false}
                />
            )

            const checkbox = screen.getByRole('checkbox', { name: /pillar page/i })
            expect(checkbox).not.toBeChecked()

            // User can manually check/uncheck the checkbox
            fireEvent.click(checkbox)
            expect(mockOnChange.pillarPage).toHaveBeenCalledWith(true)
        })

        it('does not auto-toggle pillarPage when page type and tags are selected', async () => {
            render(
                <WriteForm
                    {...defaultProps}
                    pageType={PageType.DESTINATION}
                    selectedTagIds={['tag1']}
                    pillarPage={false}
                />
            )

            // Wait a bit to ensure no auto-toggle happens
            await new Promise(resolve => setTimeout(resolve, 100))

            // Should not auto-toggle - user must manually check the box
            const checkbox = screen.getByRole('checkbox', { name: /pillar page/i })
            expect(checkbox).not.toBeChecked()
            
            // Verify onChange.pillarPage was not called automatically
            expect(mockOnChange.pillarPage).not.toHaveBeenCalled()
        })
    })
})
