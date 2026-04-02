import { render, screen, fireEvent } from '@testing-library/react';
import PaginationClient from './PaginationClient';
import '@testing-library/jest-dom';

describe('PaginationClient', () => {
    const items = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);

    it('calls onPageChange with first page items initially', () => {
        const mockOnPageChange = jest.fn();
        render(<PaginationClient items={items} itemsPerPage={3} onPageChange={mockOnPageChange} />);

        expect(mockOnPageChange).toHaveBeenCalledWith(['Item 1', 'Item 2', 'Item 3']);
        expect(screen.getByText('Page 1 of 4')).toBeInTheDocument();
    });

    it('disables Previous button on first page', () => {
        const mockOnPageChange = jest.fn();
        render(<PaginationClient items={items} itemsPerPage={3} onPageChange={mockOnPageChange} />);

        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton).toBeDisabled();
    });

    it('navigates to next page and updates items', () => {
        const mockOnPageChange = jest.fn();
        render(<PaginationClient items={items} itemsPerPage={3} onPageChange={mockOnPageChange} />);

        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        expect(mockOnPageChange).toHaveBeenLastCalledWith(['Item 4', 'Item 5', 'Item 6']);
        expect(screen.getByText('Page 2 of 4')).toBeInTheDocument();
    });

    it('navigates to last page and disables Next button', () => {
        const mockOnPageChange = jest.fn();
        render(<PaginationClient items={items} itemsPerPage={5} onPageChange={mockOnPageChange} />);

        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        expect(mockOnPageChange).toHaveBeenLastCalledWith(['Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10']);
        expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
        expect(nextButton).toBeDisabled();
    });

    it('goes back to previous page', () => {
        const mockOnPageChange = jest.fn();
        render(<PaginationClient items={items} itemsPerPage={5} onPageChange={mockOnPageChange} />);

        fireEvent.click(screen.getByRole('button', { name: /next/i }));
        fireEvent.click(screen.getByRole('button', { name: /previous/i }));

        expect(mockOnPageChange).toHaveBeenLastCalledWith(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
        expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    });
});

