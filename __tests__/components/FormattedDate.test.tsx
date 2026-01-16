import { render, screen } from '@testing-library/react';
import FormattedDate from '@/app/components/FormattedDate';
import '@testing-library/jest-dom';

const formatLocal = (input: string | number | Date) =>
    new Date(input).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

describe('FormattedDate Component', () => {
    it('formats a valid date string', () => {
        const dateStr = '2024-12-25';
        render(<FormattedDate dateString={dateStr} />);
        expect(screen.getByText(formatLocal(dateStr))).toBeInTheDocument();
    });

    it('formats a valid timestamp', () => {
        const timestamp = new Date('2024-07-04').getTime();
        render(<FormattedDate dateString={timestamp} />);
        expect(screen.getByText(formatLocal(timestamp))).toBeInTheDocument();
    });

    it('formats a valid Date object', () => {
        const dateObj = new Date('2023-01-01');
        render(<FormattedDate dateString={dateObj} />);
        expect(screen.getByText(formatLocal(dateObj))).toBeInTheDocument();
    });

    it('renders fallback for invalid date string', () => {
        render(<FormattedDate dateString="not-a-date" />);
        expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });

    it('renders fallback for invalid number', () => {
        render(<FormattedDate dateString={NaN} />);
        expect(screen.getByText('Invalid Date')).toBeInTheDocument();
    });
});
