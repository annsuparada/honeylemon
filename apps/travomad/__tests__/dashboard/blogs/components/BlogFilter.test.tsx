import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import DashboardFilters from '@/app/dashboard/blogs/components/BlogFilter'

const mockStatusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
]

const mockTypeOptions = [
    { label: 'Blog', value: 'blog' },
    { label: 'Deal', value: 'deal' },
]

const mockSortOptions = [
    { label: 'Newest', value: 'desc' },
    { label: 'Oldest', value: 'asc' },
]

describe('DashboardFilters Component', () => {
    const mockOnStatusChange = jest.fn()
    const mockOnTypeChange = jest.fn()
    const mockOnSortChange = jest.fn()
    const mockOnFeaturedChange = jest.fn()
    const mockOnPillarPagesChange = jest.fn()
    const mockOnTrendingChange = jest.fn()

    const defaultProps = {
        selectedStatus: "draft",
        selectedPageType: "blog",
        sortOrder: "desc",
        onStatusChange: mockOnStatusChange,
        onTypeChange: mockOnTypeChange,
        onSortChange: mockOnSortChange,
        statusOptions: mockStatusOptions,
        typeOptions: mockTypeOptions,
        sortOptions: mockSortOptions,
        featuredOnly: false,
        pillarPagesOnly: false,
        trendingOnly: false,
        onFeaturedChange: mockOnFeaturedChange,
        onPillarPagesChange: mockOnPillarPagesChange,
        onTrendingChange: mockOnTrendingChange,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        render(<DashboardFilters {...defaultProps} />)
    })

    it('renders all SelectInput components with correct labels', () => {
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Page Type')).toBeInTheDocument()
        expect(screen.getByText('Sort by')).toBeInTheDocument()
    })

    it('shows the correct default selected values', () => {
        const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]

        const [statusSelect, typeSelect, sortSelect] = selects

        expect(statusSelect.value).toBe('draft')
        expect(typeSelect.value).toBe('blog')
        expect(sortSelect.value).toBe('desc')
    })


    it('calls onStatusChange when status changes', () => {
        const selects = screen.getAllByRole('combobox')
        const statusSelect = selects[0] // assumes first select is "Status"

        fireEvent.change(statusSelect, { target: { value: 'published' } })
        expect(mockOnStatusChange).toHaveBeenCalledWith('published')
    })


    it('calls onTypeChange when page type changes', () => {
        const selects = screen.getAllByRole('combobox')
        const typeSelect = selects[1] // Second select = Page Type

        fireEvent.change(typeSelect, { target: { value: 'deal' } })
        expect(mockOnTypeChange).toHaveBeenCalledWith('deal')
    })


    it('calls onSortChange when sort option changes', () => {
        const selects = screen.getAllByRole('combobox')
        const sortSelect = selects[2] // Third select is "Sort by"

        fireEvent.change(sortSelect, { target: { value: 'asc' } })
        expect(mockOnSortChange).toHaveBeenCalledWith('asc')
    })

    it('renders Special Filters section', () => {
        expect(screen.getByText('Special Filters')).toBeInTheDocument()
    })

    it('renders all three special filter checkboxes', () => {
        expect(screen.getByText('Featured Only')).toBeInTheDocument()
        expect(screen.getByText('Pillar Pages Only')).toBeInTheDocument()
        expect(screen.getByText('Trending Only')).toBeInTheDocument()
    })

    it('shows checkboxes as unchecked by default', () => {
        const featuredLabel = screen.getByText('Featured Only').closest('label')
        const pillarLabel = screen.getByText('Pillar Pages Only').closest('label')
        const trendingLabel = screen.getByText('Trending Only').closest('label')

        const featuredCheckbox = featuredLabel?.querySelector('input[type="checkbox"]')
        const pillarCheckbox = pillarLabel?.querySelector('input[type="checkbox"]')
        const trendingCheckbox = trendingLabel?.querySelector('input[type="checkbox"]')

        expect(featuredCheckbox).not.toBeChecked()
        expect(pillarCheckbox).not.toBeChecked()
        expect(trendingCheckbox).not.toBeChecked()
    })

    it('calls onFeaturedChange when Featured Only checkbox is clicked', () => {
        const featuredLabel = screen.getByText('Featured Only').closest('label')
        const featuredCheckbox = featuredLabel?.querySelector('input[type="checkbox"]') as HTMLInputElement

        expect(featuredCheckbox).toBeInTheDocument()
        fireEvent.click(featuredCheckbox!)
        expect(mockOnFeaturedChange).toHaveBeenCalledWith(true)
    })

    it('calls onPillarPagesChange when Pillar Pages Only checkbox is clicked', () => {
        const pillarLabel = screen.getByText('Pillar Pages Only').closest('label')
        const pillarCheckbox = pillarLabel?.querySelector('input[type="checkbox"]') as HTMLInputElement

        expect(pillarCheckbox).toBeInTheDocument()
        fireEvent.click(pillarCheckbox!)
        expect(mockOnPillarPagesChange).toHaveBeenCalledWith(true)
    })

    it('calls onTrendingChange when Trending Only checkbox is clicked', () => {
        const trendingLabel = screen.getByText('Trending Only').closest('label')
        const trendingCheckbox = trendingLabel?.querySelector('input[type="checkbox"]') as HTMLInputElement

        expect(trendingCheckbox).toBeInTheDocument()
        fireEvent.click(trendingCheckbox!)
        expect(mockOnTrendingChange).toHaveBeenCalledWith(true)
    })

    it('shows checkboxes as checked when props are true', () => {
        const { container } = render(
            <DashboardFilters
                {...defaultProps}
                featuredOnly={true}
                pillarPagesOnly={true}
                trendingOnly={true}
            />
        )

        // Use container to find checkboxes directly
        const checkboxes = container.querySelectorAll('input[type="checkbox"]')

        // The first three checkboxes should be the special filter checkboxes
        // (assuming no other checkboxes in SelectInput components)
        const featuredCheckbox = Array.from(checkboxes).find(cb => {
            const label = cb.closest('label')
            return label?.textContent?.includes('Featured Only')
        }) as HTMLInputElement

        const pillarCheckbox = Array.from(checkboxes).find(cb => {
            const label = cb.closest('label')
            return label?.textContent?.includes('Pillar Pages Only')
        }) as HTMLInputElement

        const trendingCheckbox = Array.from(checkboxes).find(cb => {
            const label = cb.closest('label')
            return label?.textContent?.includes('Trending Only')
        }) as HTMLInputElement

        expect(featuredCheckbox).toBeChecked()
        expect(pillarCheckbox).toBeChecked()
        expect(trendingCheckbox).toBeChecked()
    })

})
