'use client'

import { useState } from 'react'
import FormInput from '@/app/components/FormInput'

interface NewsletterSubscription {
    id: string
    email: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface EmailCampaignProps {
    subscriptions: NewsletterSubscription[]
}

interface CampaignForm {
    subject: string
    content: string
    recipientType: 'all' | 'active' | 'inactive'
    previewEmail: string
}

export default function EmailCampaign({ subscriptions }: EmailCampaignProps) {
    const [form, setForm] = useState<CampaignForm>({
        subject: '',
        content: '',
        recipientType: 'active',
        previewEmail: ''
    })
    const [isSending, setIsSending] = useState(false)
    const [sendStatus, setSendStatus] = useState<{
        type: 'success' | 'error' | null
        message: string
    }>({ type: null, message: '' })
    const [showPreview, setShowPreview] = useState(false)

    // Calculate recipient count
    const getRecipientCount = () => {
        switch (form.recipientType) {
            case 'all':
                return subscriptions.length
            case 'active':
                return subscriptions.filter(sub => sub.isActive).length
            case 'inactive':
                return subscriptions.filter(sub => !sub.isActive).length
            default:
                return 0
        }
    }

    // Get recipient emails
    const getRecipientEmails = () => {
        switch (form.recipientType) {
            case 'all':
                return subscriptions.map(sub => sub.email)
            case 'active':
                return subscriptions.filter(sub => sub.isActive).map(sub => sub.email)
            case 'inactive':
                return subscriptions.filter(sub => !sub.isActive).map(sub => sub.email)
            default:
                return []
        }
    }

    // Handle form input changes
    const handleInputChange = (field: keyof CampaignForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }))
        setSendStatus({ type: null, message: '' })
    }

    // Handle preview
    const handlePreview = async () => {
        if (!form.previewEmail || !form.subject || !form.content) {
            setSendStatus({ type: 'error', message: 'Please fill in all fields and provide a preview email address.' })
            return
        }

        if (!form.previewEmail.includes('@')) {
            setSendStatus({ type: 'error', message: 'Please enter a valid preview email address.' })
            return
        }

        setIsSending(true)
        setSendStatus({ type: null, message: '' })

        try {
            const response = await fetch('/api/campaign/preview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: form.previewEmail,
                    subject: form.subject,
                    content: form.content,
                }),
            })

            const result = await response.json()

            if (response.ok && result.success) {
                setSendStatus({ type: 'success', message: 'Preview email sent successfully!' })
                setShowPreview(true)
            } else {
                setSendStatus({ type: 'error', message: result.error || 'Failed to send preview email. Please check your email configuration.' })
            }
        } catch (error) {
            console.error('Error sending preview email:', error)
            setSendStatus({ type: 'error', message: 'Failed to send preview email. Please try again.' })
        } finally {
            setIsSending(false)
        }
    }

    // Handle campaign send
    const handleSendCampaign = async () => {
        if (!form.subject || !form.content) {
            setSendStatus({ type: 'error', message: 'Please fill in all required fields.' })
            return
        }

        const recipientCount = getRecipientCount()
        if (recipientCount === 0) {
            setSendStatus({ type: 'error', message: 'No recipients found for the selected criteria.' })
            return
        }

        if (!confirm(`Are you sure you want to send this email to ${recipientCount} recipients? This action cannot be undone.`)) {
            return
        }

        setIsSending(true)
        setSendStatus({ type: null, message: '' })

        try {
            const response = await fetch('/api/campaign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject: form.subject,
                    content: form.content,
                    recipientType: form.recipientType
                }),
            })

            const result = await response.json()

            if (response.ok) {
                setSendStatus({
                    type: 'success',
                    message: `Campaign sent successfully! ${result.sentCount} emails delivered.`
                })
                // Reset form
                setForm({
                    subject: '',
                    content: '',
                    recipientType: 'active',
                    previewEmail: ''
                })
            } else {
                setSendStatus({ type: 'error', message: result.error || 'Failed to send campaign.' })
            }
        } catch (error) {
            console.error('Error sending campaign:', error)
            setSendStatus({ type: 'error', message: 'Failed to send campaign. Please try again.' })
        } finally {
            setIsSending(false)
        }
    }


    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Email Campaign</h2>
                <p className="text-gray-600">Send emails to your newsletter subscribers</p>
            </div>

            {/* Status Message */}
            {sendStatus.type && (
                <div className={`mb-6 p-4 rounded-md ${sendStatus.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    {sendStatus.message}
                </div>
            )}

            <div className="space-y-6">
                {/* Recipient Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Send to:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                value="active"
                                checked={form.recipientType === 'active'}
                                onChange={(e) => handleInputChange('recipientType', e.target.value)}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium">Active Subscribers</div>
                                <div className="text-sm text-gray-500">
                                    {subscriptions.filter(sub => sub.isActive).length} recipients
                                </div>
                            </div>
                        </label>
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                value="inactive"
                                checked={form.recipientType === 'inactive'}
                                onChange={(e) => handleInputChange('recipientType', e.target.value)}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium">Inactive Subscribers</div>
                                <div className="text-sm text-gray-500">
                                    {subscriptions.filter(sub => !sub.isActive).length} recipients
                                </div>
                            </div>
                        </label>
                        <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                value="all"
                                checked={form.recipientType === 'all'}
                                onChange={(e) => handleInputChange('recipientType', e.target.value)}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium">All Subscribers</div>
                                <div className="text-sm text-gray-500">
                                    {subscriptions.length} recipients
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Subject */}
                <FormInput
                    id="subject"
                    label="Subject Line *"
                    placeholder="Enter email subject..."
                    value={form.subject}
                    onChange={(value) => handleInputChange('subject', value)}
                    type="text"
                />

                {/* Content */}
                <FormInput
                    id="content"
                    label="Email Content *"
                    placeholder="Write your email content here..."
                    value={form.content}
                    onChange={(value) => handleInputChange('content', value)}
                    type="textarea"
                    rows={8}
                />
                <p className="mt-1 text-sm text-gray-500">
                    You can use line breaks for formatting. HTML is not supported for security reasons.
                </p>

                {/* Preview Email */}
                <div>
                    <FormInput
                        id="previewEmail"
                        label="Preview Email Address"
                        placeholder="your-email@example.com"
                        value={form.previewEmail}
                        onChange={(value) => handleInputChange('previewEmail', value)}
                        type="email"
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            type="button"
                            onClick={handlePreview}
                            disabled={isSending || !form.subject || !form.content || !form.previewEmail}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send Preview
                        </button>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Send a preview to test your email before sending to all subscribers.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={handleSendCampaign}
                        disabled={isSending || !form.subject || !form.content || getRecipientCount() === 0}
                        className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isSending ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending Campaign...
                            </>
                        ) : (
                            `Send to ${getRecipientCount()} Recipients`
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
