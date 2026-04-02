/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import FormInput from './FormInput';

describe('FormInput', () => {
    it('renders label and input correctly', () => {
        render(
            <FormInput
                id="username"
                label="Username"
                value="john"
                onChange={() => { }}
            />
        );

        expect(screen.getByLabelText('Username')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john')).toBeInTheDocument();
    });

    it('renders textarea when type is textarea', () => {
        render(
            <FormInput
                id="bio"
                label="Bio"
                type="textarea"
                value="Hello world"
                onChange={() => { }}
            />
        );

        expect(screen.getByRole('textbox')).toHaveValue('Hello world');
    });

    it('disables input when disabled is true', () => {
        render(
            <FormInput
                id="email"
                label="Email"
                type="email"
                value="test@example.com"
                onChange={() => { }}
                disabled
            />
        );

        expect(screen.getByLabelText('Email')).toBeDisabled();
    });

    it('shows error message when error prop is passed', () => {
        render(
            <FormInput
                id="email"
                label="Email"
                type="email"
                value="bademail"
                onChange={() => { }}
                error="Invalid email"
            />
        );

        expect(screen.getByText('Invalid email')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows default email validation error when invalid email is typed', () => {
        const handleChange = jest.fn();
        render(
            <FormInput
                id="email"
                label="Email"
                type="email"
                value="notanemail"
                onChange={handleChange}
            />
        );

        expect(screen.getByText('Not a valid email address.')).toBeInTheDocument();
    });

    it('does not show error when email is valid', () => {
        render(
            <FormInput
                id="email"
                label="Email"
                type="email"
                value="test@example.com"
                onChange={() => { }}
            />
        );

        expect(screen.queryByText('Not a valid email address.')).not.toBeInTheDocument();
    });

    it('triggers onChange when input value changes', () => {
        const mockChange = jest.fn();
        render(
            <FormInput
                id="email"
                label="Email"
                value=""
                onChange={mockChange}
                type="text"
            />
        );

        const input = screen.getByLabelText('Email');
        fireEvent.change(input, { target: { value: 'new value' } });

        expect(mockChange).toHaveBeenCalledWith('new value');
    });
});

