'use client'

import { useEffect, useState } from 'react'
import ProtectedPage from '@/app/components/ProtectedPage'
import { Author } from '@/app/types'
import { changePassword, fetchUser, updateUser } from '@/utils/userAction'
import UserProfileForm from './component/UserProfileForm'
import ChangePasswordForm from './component/ChangePasswordForm'

export default function ProfilePage() {
    const [user, setUser] = useState<Author | null>(null)
    const [formData, setFormData] = useState<Partial<Author>>({})
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordAlert, setPasswordAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);


    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) return

        const parsedUser = JSON.parse(storedUser)
        const userId = parsedUser?.id

        async function loadUser() {
            if (!userId) return
            const data = await fetchUser(userId)
            setUser(data)
            setFormData(data)
            setLoading(false)
        }

        loadUser()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        setSaving(true)
        try {
            const updated = await updateUser(user.id, formData)
            if (updated?.user) {
                setUser(updated.user)
                setFormData(updated.user)
                setAlert({ type: 'success', text: 'Profile updated successfully!' })
            } else {
                setAlert({ type: 'error', text: 'Failed to update profile.' })
            }
        } catch (error) {
            console.error('Update failed:', error)
            setAlert({ type: 'error', text: 'An error occurred while updating.' })
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingPassword(true);
        if (!user) return;
        const res = await changePassword(user.id, passwordData.oldPassword, passwordData.newPassword);
        console.log('res', res)
        if (res?.success) {
            setPasswordAlert({ type: 'success', text: 'Password updated successfully.' });
            setPasswordData({ oldPassword: '', newPassword: '' });
        } else {
            setPasswordAlert({ type: 'error', text: res?.message || 'Failed to update password.' });
        }
        setSavingPassword(false);
    };

    return (
        <ProtectedPage>
            <div className="max-w-screen-lg mx-auto px-4 py-12">
                {loading ? (
                    <p>Loading...</p>
                ) : user ? (
                    <>
                        <UserProfileForm
                            formData={formData}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            saving={saving}
                            alert={alert}
                            onClearAlert={() => setAlert(null)}
                        />
                        <ChangePasswordForm
                            oldPassword={passwordData.oldPassword}
                            newPassword={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            onSubmit={handlePasswordSubmit}
                            alert={passwordAlert}
                            onClearAlert={() => setPasswordAlert(null)}
                            saving={savingPassword}
                        />

                    </>

                ) : (
                    <p className="text-red-500">User not found.</p>
                )}
            </div>
        </ProtectedPage>
    )
}
