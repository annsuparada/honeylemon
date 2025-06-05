import { render, screen } from '@testing-library/react';
import SectionHeader from '@/app/components/SectionHeader';
import '@testing-library/jest-dom';

describe('SectionHeader', () => {
    const mockProps = {
        title: 'Explore',
        subtitle: 'Choose your adventure',
    };

    it('renders the title correctly', () => {
        render(<SectionHeader {...mockProps} />);
        expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    });

    it('renders the subtitle correctly', () => {
        render(<SectionHeader {...mockProps} />);
        expect(screen.getByText(mockProps.subtitle)).toBeInTheDocument();
    });

    it('applies correct classes to title and subtitle', () => {
        render(<SectionHeader {...mockProps} />);
        const titleElement = screen.getByText(mockProps.title);
        const subtitleElement = screen.getByText(mockProps.subtitle);

        expect(titleElement).toHaveClass('text-base/7', 'font-semibold', 'text-primary', 'text-xl');
        expect(subtitleElement).toHaveClass(
            'mt-2',
            'text-3xl',
            'font-semibold',
            'tracking-tight',
            'text-pretty',
            'text-secondary',
            'sm:text-5xl'
        );
    });
});
