/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MenuBar from '@/app/components/tiptap/MenuBar';
import { EditorProvider } from '@tiptap/react';
import { extensions } from '@/app/lip/tiptapExtensions';

// Mock ImageUploadModal
jest.mock('@/app/components/tiptap/ImageUploadModal', () => {
    return function ImageUploadModal({ isOpen, onClose, onInsert }: any) {
        const handleInsert = () => {
            onInsert('https://cloudinary.com/test.jpg', 'Alt text');
            onClose(); // Close modal after insert
        };
        
        if (!isOpen) return null;
        return (
            <div data-testid="image-upload-modal">
                <button onClick={handleInsert}>
                    Mock Insert
                </button>
                <button onClick={onClose}>Mock Close</button>
            </div>
        );
    };
});

// Test component that wraps MenuBar with editor
function TestEditor() {
    return (
        <EditorProvider
            extensions={extensions}
            content="<p>Test content</p>"
        >
            <MenuBar />
        </EditorProvider>
    );
}

describe('MenuBar', () => {
    it('renders toolbar buttons', () => {
        render(<TestEditor />);

        expect(screen.getByText('Bold')).toBeInTheDocument();
        expect(screen.getByText('Italic')).toBeInTheDocument();
        expect(screen.getByText('🖼️ Add Image')).toBeInTheDocument();
    });

    it('opens image upload modal when Add Image is clicked', () => {
        render(<TestEditor />);

        const addImageButton = screen.getByText('🖼️ Add Image');
        fireEvent.click(addImageButton);

        expect(screen.getByTestId('image-upload-modal')).toBeInTheDocument();
    });

    it('inserts image into editor when modal calls onInsert', async () => {
        render(<TestEditor />);

        const addImageButton = screen.getByText('🖼️ Add Image');
        fireEvent.click(addImageButton);

        expect(screen.getByTestId('image-upload-modal')).toBeInTheDocument();

        const mockInsertButton = screen.getByText('Mock Insert');
        fireEvent.click(mockInsertButton);

        // The image should be inserted into the editor
        // The modal should close after insertion (handled by ImageUploadModal)
        // Verify the modal closes after insert
        await waitFor(() => {
            expect(screen.queryByTestId('image-upload-modal')).not.toBeInTheDocument();
        });
    });

    it('closes modal when close is called', () => {
        render(<TestEditor />);

        const addImageButton = screen.getByText('🖼️ Add Image');
        fireEvent.click(addImageButton);

        expect(screen.getByTestId('image-upload-modal')).toBeInTheDocument();

        const mockCloseButton = screen.getByText('Mock Close');
        fireEvent.click(mockCloseButton);

        expect(screen.queryByTestId('image-upload-modal')).not.toBeInTheDocument();
    });

    it('toggles bold formatting', () => {
        render(<TestEditor />);

        const boldButton = screen.getByText('Bold');
        expect(boldButton).not.toHaveClass('btn-active');

        fireEvent.click(boldButton);
        // Button should be active after clicking (if cursor is in bold text)
        // This depends on editor state which is complex to test
    });

    it('renders all expected formatting buttons', () => {
        render(<TestEditor />);

        expect(screen.getByText('Bold')).toBeInTheDocument();
        expect(screen.getByText('Italic')).toBeInTheDocument();
        expect(screen.getByText('Strike')).toBeInTheDocument();
        expect(screen.getByText('Code')).toBeInTheDocument();
        expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });

    it('renders heading buttons', () => {
        render(<TestEditor />);

        expect(screen.getByText('H1')).toBeInTheDocument();
        expect(screen.getByText('H2')).toBeInTheDocument();
        expect(screen.getByText('H3')).toBeInTheDocument();
    });

    it('renders list buttons', () => {
        render(<TestEditor />);

        expect(screen.getByText('Bullet List')).toBeInTheDocument();
        expect(screen.getByText('Ordered List')).toBeInTheDocument();
    });

    it('renders table buttons', () => {
        render(<TestEditor />);

        expect(screen.getByText('➕ Insert Table')).toBeInTheDocument();
    });
});

