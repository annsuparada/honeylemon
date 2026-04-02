/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfileForm from '@/app/dashboard/profile/components/UserProfileForm';
import { Author } from '@/app/types';

const mockFormData: Partial<Author> = {
    username: 'janedoe',
    email: 'jane@example.com',
    name: 'Jane',
    lastName: 'Doe',
    bio: 'A short bio',
    profilePicture: 'https://example.com/avatar.jpg',
};

describe('UserProfileForm', () => {
    const handleChange = jest.fn();
    const handleSubmit = jest.fn((e) => e.preventDefault());
    const handleClearAlert = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all input fields with default values', () => {
        render(
            <UserProfileForm
                formData={mockFormData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                saving={false}
                alert={null}
                onClearAlert={handleClearAlert}
            />
        );

        expect(screen.getByLabelText(/username/i)).toHaveValue('janedoe');
        expect(screen.getByLabelText(/email/i)).toHaveValue('jane@example.com');
        expect(screen.getByLabelText(/first name/i)).toHaveValue('Jane');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
        expect(screen.getByLabelText(/bio/i)).toHaveValue('A short bio');
    });

    it('calls onChange when inputs are modified', () => {
        render(
            <UserProfileForm
                formData={mockFormData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                saving={false}
                alert={null}
                onClearAlert={handleClearAlert}
            />
        );

        fireEvent.change(screen.getByLabelText(/first name/i), {
            target: { value: 'Janet' },
        });
        expect(handleChange).toHaveBeenCalled();
    });

    it('disables email and username fields', () => {
        render(
            <UserProfileForm
                formData={mockFormData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                saving={false}
                alert={null}
                onClearAlert={handleClearAlert}
            />
        );

        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/username/i)).toBeDisabled();
    });

    it('renders alert when provided', () => {
        render(
            <UserProfileForm
                formData={mockFormData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                saving={false}
                alert={{ type: 'error', text: 'Something went wrong' }}
                onClearAlert={handleClearAlert}
            />
        );

        expect(screen.getAllByText('Something went wrong')[0]).toBeInTheDocument();
    });

    it('calls onSubmit when form is submitted', () => {
        render(
            <UserProfileForm
                formData={mockFormData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                saving={false}
                alert={null}
                onClearAlert={handleClearAlert}
            />
        );

        fireEvent.submit(screen.getByRole('button', { name: /save/i }));
        expect(handleSubmit).toHaveBeenCalled();
    });

    it('displays saving text when saving is true', () => {
        render(
            <UserProfileForm
                formData={mockFormData}
                onChange={handleChange}
                onSubmit={handleSubmit}
                saving={true}
                alert={null}
                onClearAlert={handleClearAlert}
            />
        );

        const saveButton = screen.getByRole('button', { name: /saving/i });
        expect(saveButton).toBeInTheDocument();
    });
});
