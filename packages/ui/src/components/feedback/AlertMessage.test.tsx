import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from './AlertMessage';
import type { AlertProps } from './AlertMessage';

jest.useFakeTimers();

describe('Alert Component', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllTimers();
    });

    const message: NonNullable<AlertProps['message']> = {
        type: 'success',
        text: 'Operation successful',
    };

    it('renders nothing when message is null', () => {
        const { container } = render(<Alert message={null} onClose={jest.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders success message and closes on button click', () => {
        const handleClose = jest.fn();
        render(<Alert message={message} onClose={handleClose} />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Operation successful')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('automatically closes after default duration (5000ms)', () => {
        const handleClose = jest.fn();
        render(<Alert message={message} onClose={handleClose} />);

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('respects custom duration (2000ms)', () => {
        const handleClose = jest.fn();
        render(<Alert message={message} onClose={handleClose} duration={2000} />);

        act(() => {
            jest.advanceTimersByTime(1999);
        });
        expect(handleClose).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});

