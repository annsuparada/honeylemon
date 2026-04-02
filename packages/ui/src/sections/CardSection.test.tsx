import { render, screen } from '@testing-library/react';
import CardSection from './CardSection';
import '@testing-library/jest-dom';

const mockCards = [
    {
        id: 1,
        title: 'Explore Mountains',
        href: '/mountains',
        imageUrl: 'https://example.com/mountains.jpg',
    },
    {
        id: 2,
        title: 'Visit Oceans',
        href: '/oceans',
        imageUrl: 'https://example.com/oceans.jpg',
    },
];

describe('CardSection Component', () => {
    it('renders section title and subtitle', () => {
        render(
            <CardSection
                cardData={mockCards}
                title="Destinations"
                subtitle="Where would you like to go?"
            />
        );

        expect(screen.getByText('Destinations')).toBeInTheDocument();
        expect(screen.getByText('Where would you like to go?')).toBeInTheDocument();
    });

    it('renders correct number of cards', () => {
        render(
            <CardSection
                cardData={mockCards}
                title="Explore"
                subtitle="Choose your adventure"
            />
        );

        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(mockCards.length);
    });

    it('renders each card with correct title and link', () => {
        render(
            <CardSection
                cardData={mockCards}
                title="Explore"
                subtitle="Choose your adventure"
            />
        );

        mockCards.forEach((card) => {
            const link = screen.getByRole('link', { name: new RegExp(card.title, 'i') });
            expect(link).toHaveAttribute('href', card.href);
        });
    });

});

