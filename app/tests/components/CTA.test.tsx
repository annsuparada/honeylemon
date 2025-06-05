import { render, screen } from '@testing-library/react';
import CTA from '@/app/components/CTA';
import '@testing-library/jest-dom';

describe('CTA Component', () => {
    const baseProps = {
        title: 'Join our newsletter',
        subtitle: 'Stay updated with the latest news',
        buttonText: 'Subscribe',
        buttonUrl: '/subscribe',
    };

    it('renders title and subtitle', () => {
        render(<CTA {...baseProps} />);
        expect(screen.getByText(baseProps.title)).toBeInTheDocument();
        expect(screen.getByText(baseProps.subtitle)).toBeInTheDocument();
    });

    it('renders button with correct text and link', () => {
        render(<CTA {...baseProps} />);
        const button = screen.getByRole('link', { name: /subscribe/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('href', baseProps.buttonUrl);
    });

    it('applies custom gradient background', () => {
        const gradient = 'from-pink-500 via-red-500 to-yellow-500';
        const { container } = render(<CTA {...baseProps} gradientBg={gradient} />);
        expect(container.firstChild).toHaveClass(`bg-gradient-to-r`, ...gradient.split(' '));
    });

    it('applies default gradient background if none provided', () => {
        const { container } = render(<CTA {...baseProps} />);
        expect(container.firstChild).toHaveClass('from-blue-600', 'via-sky-500', 'to-cyan-400');
    });
});
