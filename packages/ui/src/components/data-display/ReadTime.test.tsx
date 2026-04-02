import { render, screen } from '@testing-library/react';
import ReadTime from './ReadTime';

describe('ReadTime Component', () => {
    it('displays read time when readTime is provided', () => {
        render(<ReadTime readTime={5} />);
        expect(screen.getByText(/📖 5 min read/i)).toBeInTheDocument();
    });

    it('displays different read times correctly', () => {
        render(<ReadTime readTime={15} />);
        expect(screen.getByText(/📖 15 min read/i)).toBeInTheDocument();
    });

    it('does not render when readTime is undefined', () => {
        const { container } = render(<ReadTime readTime={undefined} />);
        expect(container.firstChild).toBeNull();
    });

    it('does not render when readTime is null', () => {
        const { container } = render(<ReadTime readTime={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('applies custom className when provided', () => {
        render(<ReadTime readTime={8} className="text-xs text-gray-500" />);
        const element = screen.getByText(/📖 8 min read/i);
        expect(element).toHaveClass('text-xs', 'text-gray-500');
    });

    it('uses default className when not provided', () => {
        render(<ReadTime readTime={10} />);
        const element = screen.getByText(/📖 10 min read/i);
        expect(element).toHaveClass('text-sm', 'text-gray-600');
    });

    it('displays minimum read time of 1 minute', () => {
        render(<ReadTime readTime={1} />);
        expect(screen.getByText(/📖 1 min read/i)).toBeInTheDocument();
    });
});

