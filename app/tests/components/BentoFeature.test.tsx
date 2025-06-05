import { render, screen } from '@testing-library/react';
import BentoFeatures from '@/app/components/BentoFeature';
import type { FeatureItem } from '@/app/components/BentoFeature';
import '@testing-library/jest-dom';

const mockFeatures: FeatureItem[] = [
    {
        title: 'Fast Performance',
        subtitle: 'Speed like never before',
        description: 'Our app runs blazingly fast, even under heavy load.',
        imageUrl: 'https://example.com/image1.jpg',
    },
    {
        title: 'Secure by Design',
        subtitle: 'Your data, protected',
        description: 'We use top-tier security practices to keep your data safe.',
        imageUrl: 'https://example.com/image2.jpg',
    },
    {
        title: 'User Friendly',
        subtitle: 'Intuitive experience',
        description: 'Our UI is designed for ease of use and accessibility.',
        imageUrl: 'https://example.com/image3.jpg',
    },
    {
        title: 'Cloud Integrated',
        subtitle: 'Connect seamlessly',
        description: 'Built-in cloud integrations streamline your workflow.',
        imageUrl: 'https://example.com/image4.jpg',
    },
    {
        title: 'Scalable Architecture',
        subtitle: 'Grow without limits',
        description: 'We scale with your business — from one user to millions.',
        imageUrl: 'https://example.com/image5.jpg',
    },
];

describe('BentoFeatures Component', () => {
    it('renders section title and subtitle', () => {
        render(
            <BentoFeatures
                sectionTitle="Why Choose Us"
                sectionSubTitle="Features that make us unique"
                features={mockFeatures}
            />
        );

        expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
        expect(screen.getByText('Features that make us unique')).toBeInTheDocument();
    });

    it('renders all feature cards', () => {
        render(
            <BentoFeatures
                sectionTitle="Why Choose Us"
                sectionSubTitle="Features that make us unique"
                features={mockFeatures}
            />
        );

        mockFeatures.forEach((feature) => {
            expect(screen.getByText(feature.title)).toBeInTheDocument();
            expect(screen.getByText(feature.subtitle)).toBeInTheDocument();
            expect(screen.getByText(feature.description)).toBeInTheDocument();
        });

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(mockFeatures.length);
    });

    it('applies correct layout classes based on index', () => {
        const { container } = render(
            <BentoFeatures
                sectionTitle="Layout Test"
                sectionSubTitle="Grid check"
                features={mockFeatures}
            />
        );

        // Check some key classes from your layout logic
        expect(container.innerHTML).toContain('lg:col-span-3 lg:rounded-tl-[2rem]');
        expect(container.innerHTML).toContain('lg:col-span-2 lg:rounded-bl-[2rem]');
    });
});
