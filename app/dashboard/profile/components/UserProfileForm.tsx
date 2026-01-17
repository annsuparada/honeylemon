import Alert from '@/app/components/AlertMessage';
import FormInput from '@/app/components/FormInput';
import { Author } from '@/app/types';
import Image from 'next/image';

interface Props {
    formData: Partial<Author>;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    saving: boolean;
    alert?: { type: 'success' | 'error'; text: string } | null;
    onClearAlert?: () => void;
}

export default function UserProfileForm({ formData, onChange, onSubmit, saving, onClearAlert, alert }: Props) {
    const handleChange = (field: keyof Author) => (value: string) => {
        const syntheticEvent = {
            target: {
                name: field,
                value,
            },
        } as unknown as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
        onChange(syntheticEvent);
    };

    return (
        <>
            {alert && <Alert message={alert} onClose={onClearAlert || (() => { })} />}


            <form onSubmit={onSubmit} className="space-y-6">
                <div className="col-span-full">
                    <label htmlFor="photo" className="block text-lg font-semibold text-base-content mb-2">
                        Photo
                    </label>
                    <div className="mt-2 flex items-center gap-x-3">
                        <div className="avatar">
                            <div className="w-24 rounded-full">
                                <Image
                                    src={formData.profilePicture || ""}
                                    alt={formData.username || "User Profile"}
                                    height={100}
                                    width={100}
                                    priority
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => {
                                const url = window.prompt('Enter Image URL', formData.profilePicture || '');
                                if (url) handleChange('profilePicture')(url);
                            }}
                        >
                            Change
                        </button>
                    </div>
                </div>
                <FormInput
                    id="username"
                    label="Username"
                    value={formData.username || ''}
                    onChange={handleChange('username')}
                    disabled={true}
                />

                <FormInput
                    id="email"
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange('email')}
                    disabled={true}
                />

                <FormInput
                    id="name"
                    label="First Name"
                    value={formData.name || ''}
                    onChange={handleChange('name')}
                />

                <FormInput
                    id="lastName"
                    label="Last Name"
                    value={formData.lastName || ''}
                    onChange={handleChange('lastName')}
                />

                <FormInput
                    id="bio"
                    label="Bio"
                    value={formData.bio || ''}
                    onChange={handleChange('bio')}
                    type="textarea"
                    rows={3}
                />

                {alert && <Alert message={alert} onClose={onClearAlert || (() => { })} />}
                <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </form>
        </>
    );
}
