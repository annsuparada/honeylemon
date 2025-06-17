import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from '@/app/dashboard/profile/page';
import * as userAction from '@/utils/userAction';
import '@testing-library/jest-dom';

jest.mock('@/utils/userAction', () => ({
    fetchUser: jest.fn(),
    updateUser: jest.fn(),
    changePassword: jest.fn(),
}));

jest.mock('next/image', () => (props: any) => {
    return <img {...props} alt={props.alt} />;
});

jest.mock('@/app/components/ProtectedPage', () => ({ children }: any) => (
    <div>{children}</div>
));

const mockUser = {
    id: '1',
    username: 'janedoe',
    email: 'jane@example.com',
    name: 'Jane',
    lastName: 'Doe',
    bio: 'A short bio',
    profilePicture: 'https://example.com/avatar.jpg',
};

describe('ProfilePage', () => {
    beforeEach(() => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        (userAction.fetchUser as jest.Mock).mockResolvedValue(mockUser);
    });

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it('renders loading state initially', async () => {
        render(<ProfilePage />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders profile form after loading', async () => {
        render(<ProfilePage />);
        await screen.findByDisplayValue(mockUser.name);
        expect(screen.getByDisplayValue(mockUser.username)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.lastName)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockUser.bio)).toBeInTheDocument();
        expect(screen.getByText('Change Password')).toBeInTheDocument();
    });

    it('updates profile info and shows success alert', async () => {
        (userAction.updateUser as jest.Mock).mockResolvedValue({ user: mockUser });

        render(<ProfilePage />);
        await screen.findByDisplayValue(mockUser.name);

        fireEvent.change(screen.getByLabelText('First Name'), {
            target: { value: 'Janey' },
        });
        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            const alerts = screen.getAllByText('Profile updated successfully!');
            expect(alerts.length).toBeGreaterThan(0);
        });

    });

    it('updates password and shows success alert', async () => {
        (userAction.changePassword as jest.Mock).mockResolvedValue({
            success: true,
        });

        render(<ProfilePage />);
        await screen.findByText('Change Password');

        fireEvent.change(screen.getByLabelText('Old Password'), {
            target: { value: 'old123' },
        });
        fireEvent.change(screen.getByLabelText('New Password'), {
            target: { value: 'new456' },
        });

        fireEvent.click(screen.getByText('Update Password'));

        await waitFor(() =>
            expect(
                screen.getByText('Password updated successfully.')
            ).toBeInTheDocument()
        );
    });

    it('shows error if password update fails', async () => {
        (userAction.changePassword as jest.Mock).mockResolvedValue({
            success: false,
            message: 'Wrong password',
        });

        render(<ProfilePage />);
        await screen.findByText('Change Password');

        fireEvent.change(screen.getByLabelText('Old Password'), {
            target: { value: 'wrong' },
        });
        fireEvent.change(screen.getByLabelText('New Password'), {
            target: { value: 'newpass' },
        });

        fireEvent.click(screen.getByText('Update Password'));

        await waitFor(() =>
            expect(screen.getByText('Wrong password')).toBeInTheDocument()
        );
    });

    it('renders user not found message when no user is returned', async () => {
        (userAction.fetchUser as jest.Mock).mockResolvedValue(null);
        render(<ProfilePage />);

        await waitFor(() =>
            expect(screen.getByText('User not found.')).toBeInTheDocument()
        );
    });
});
