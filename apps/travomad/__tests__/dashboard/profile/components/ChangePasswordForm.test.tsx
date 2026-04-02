import { render, screen, fireEvent } from '@testing-library/react';
import ChangePasswordForm from '@/app/dashboard/profile/components/ChangePasswordForm';

describe('ChangePasswordForm', () => {
    const mockProps = {
        oldPassword: '',
        newPassword: '',
        saving: false,
        onChange: jest.fn(),
        onSubmit: jest.fn((e) => e.preventDefault()),
        alert: null,
        onClearAlert: jest.fn(),
    };

    it('renders form fields and button', () => {
        render(<ChangePasswordForm {...mockProps} />);

        expect(screen.getByLabelText(/old password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
    });

    it('shows alert when provided', () => {
        render(
            <ChangePasswordForm
                {...mockProps}
                alert={{ type: 'error', text: 'Invalid password' }}
            />
        );

        expect(screen.getByRole('alert')).toHaveTextContent('Invalid password');
    });

    it('calls onChange when typing in fields', () => {
        render(<ChangePasswordForm {...mockProps} />);

        const oldInput = screen.getByLabelText(/old password/i);
        fireEvent.change(oldInput, { target: { value: 'oldpass' } });

        expect(mockProps.onChange).toHaveBeenCalled();
    });

    it('calls onSubmit when form is submitted', () => {
        const handleSubmit = jest.fn((e) => e.preventDefault());
        render(<ChangePasswordForm {...mockProps} onSubmit={handleSubmit} />);

        const form = screen.getByText(/update password/i).closest('form');
        fireEvent.submit(form!);

        expect(handleSubmit).toHaveBeenCalled();
    });


    it('disables submit button when saving is true', () => {
        render(<ChangePasswordForm {...mockProps} saving={true} />);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent(/updating/i);
    });
});
