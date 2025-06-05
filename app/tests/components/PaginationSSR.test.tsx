import { render, screen } from '@testing-library/react';
import PaginationSSR from '@/app/components/PaginationSSR';
import '@testing-library/jest-dom';

describe('Pagination Component', () => {
    const basePath = '/blog';

    it('renders current page and total pages', () => {
        render(<PaginationSSR currentPage={2} totalPages={5} basePath={basePath} />);
        expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
    });

    it('disables Previous button on first page', () => {
        render(<PaginationSSR currentPage={1} totalPages={5} basePath={basePath} />);
        const prevButton = screen.getByText(/previous/i);
        expect(prevButton.tagName).toBe('SPAN');
        expect(prevButton).toHaveAttribute('aria-disabled', 'true');
        expect(prevButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('disables Next button on last page', () => {
        render(<PaginationSSR currentPage={5} totalPages={5} basePath={basePath} />);
        const nextButton = screen.getByText(/next/i);
        expect(nextButton.tagName).toBe('SPAN');
        expect(nextButton).toHaveAttribute('aria-disabled', 'true');
        expect(nextButton).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('generates correct links for Previous and Next', () => {
        render(<PaginationSSR currentPage={3} totalPages={5} basePath={basePath} />);
        const prevButton = screen.getByRole('link', { name: /previous/i });
        const nextButton = screen.getByRole('link', { name: /next/i });

        expect(prevButton).toHaveAttribute('href', `${basePath}?page=2`);
        expect(nextButton).toHaveAttribute('href', `${basePath}?page=4`);
    });
});
