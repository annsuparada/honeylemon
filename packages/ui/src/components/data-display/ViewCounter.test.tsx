import { render, waitFor } from '@testing-library/react';
import ViewCounter from './ViewCounter';

// Mock fetch
global.fetch = jest.fn();

describe('ViewCounter Component', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('calls the API endpoint when component mounts', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, views: 1 }),
        });

        render(<ViewCounter slug="test-post-slug" />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/post/test-post-slug/views',
                { method: 'POST' }
            );
        });
    });

    it('does not break the page if API call fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const { container } = render(<ViewCounter slug="test-post-slug" />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        // Component should still render (returns null, doesn't break)
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing (returns null)', () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        const { container } = render(<ViewCounter slug="test-post" />);
        expect(container.firstChild).toBeNull();
    });

    it('calls API with correct slug', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<ViewCounter slug="my-blog-post" />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/post/my-blog-post/views',
                { method: 'POST' }
            );
        });
    });
});

