import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '@/app/components/HeroSection';
import '@testing-library/jest-dom';

// Mock FormattedDate so we don't depend on time zone behavior
jest.mock('@/app/components/FormattedDate', () => ({ dateString }: { dateString: string }) => (
    <span>{String(dateString)}</span>
));

describe('HeroSection Component', () => {
    const baseProps = {
        title: 'Welcome to Our Site',
        description: 'Your success starts here.',
        imageUrl: 'https://example.com/hero.jpg',
    };

    it('renders homepage layout with title and description', () => {
        render(<HeroSection {...baseProps} isHomepage={true} />);

        expect(screen.getByText(baseProps.title)).toBeInTheDocument();
        expect(screen.getByText(baseProps.description)).toBeInTheDocument();
        expect(screen.getByRole('heading')).toHaveClass('text-3xl', 'lg:text-5xl');
    });

    it('renders non-homepage layout without hero min-h-screen class', () => {
        const { container } = render(<HeroSection {...baseProps} isHomepage={false} />);
        const root = container.querySelector('.hero');
        expect(root).toHaveClass('min-h-[50vh]');
    });

    it('renders CTA button and handles click', () => {
        const onCtaClick = jest.fn();
        render(<HeroSection {...baseProps} onCtaClick={onCtaClick} ctaText="Start Now" />);

        const button = screen.getByRole('button', { name: /start now/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(onCtaClick).toHaveBeenCalledTimes(1);
    });

    it('renders blog layout with author and date when isSingleBlogPage is true', () => {
        render(
            <HeroSection
                {...baseProps}
                isSingleBlogPage
                author="Jane Doe"
                date="2023-01-01"
            />
        );

        expect(screen.getByText(baseProps.title)).toBeInTheDocument();
        expect(screen.getByText(baseProps.description)).toBeInTheDocument();
        expect(screen.getByText(/jane doe/i)).toBeInTheDocument();
        expect(screen.getByText('2023-01-01')).toBeInTheDocument(); // mocked FormattedDate
    });
});
