import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareButton from './ShareButton';
import '@testing-library/jest-dom';

const mockUrl = 'https://example.com/article';

Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

describe('ShareButton', () => {
    const title = 'Test Article';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all share platform icons', () => {
        render(<ShareButton title={title} url={mockUrl} />);
        expect(screen.getAllByRole('link')).toHaveLength(4); // 4 share links
        expect(screen.getByRole('button')).toBeInTheDocument(); // Copy button
    });

    it('copies the link to clipboard and shows confirmation', async () => {
        render(<ShareButton title={title} url={mockUrl} />);
        const copyButton = screen.getByRole('button');
        fireEvent.click(copyButton);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockUrl);

        await waitFor(() => {
            expect(copyButton).toHaveTextContent('✅');
        });
    });

    it('generates correct share links', () => {
        render(<ShareButton title={title} url={mockUrl} />);
        const links = screen.getAllByRole('link') as HTMLAnchorElement[];

        expect(links[0].href).toContain('facebook.com/sharer/sharer.php');
        expect(links[1].href).toContain('twitter.com/intent/tweet');
        expect(links[2].href).toContain('linkedin.com/shareArticle');
        expect(links[3].href).toContain('pinterest.com/pin/create/button');
    });
});

