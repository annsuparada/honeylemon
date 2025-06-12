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

    beforeEach(() => {
        render(
            <DashboardFilters
                selectedStatus="draft"
                selectedPageType="blog"
                sortOrder="desc"
                onStatusChange={mockOnStatusChange}
                onTypeChange={mockOnTypeChange}
                onSortChange={mockOnSortChange}
                statusOptions={mockStatusOptions}
                typeOptions={mockTypeOptions}
                sortOptions={mockSortOptions}
            />
        )
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

})
