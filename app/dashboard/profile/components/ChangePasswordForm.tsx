import React from 'react';
import FormInput from '@/app/components/FormInput';
import Alert from '@/app/components/AlertMessage';

interface Props {
    oldPassword: string;
    newPassword: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    alert?: { type: 'success' | 'error'; text: string } | null;
    onClearAlert?: () => void;
    saving: boolean;
}

export default function ChangePasswordForm({
    oldPassword,
    newPassword,
    onChange,
    onSubmit,
    alert,
    onClearAlert,
    saving,
}: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6 mt-10 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700">Change Password</h2>

            {alert && <Alert message={alert} onClose={onClearAlert || (() => { })} />}

            <FormInput
                id="oldPassword"
                label="Old Password"
                type="password"
                value={oldPassword}
                onChange={(value) =>
                    onChange({
                        target: { name: 'oldPassword', value },
                    } as React.ChangeEvent<HTMLInputElement>)
                }
            />

            <FormInput
                id="newPassword"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(value) =>
                    onChange({
                        target: { name: 'newPassword', value },
                    } as React.ChangeEvent<HTMLInputElement>)
                }
            />

            <button
                type="submit"
                disabled={saving}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-500"
            >
                {saving ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
}
