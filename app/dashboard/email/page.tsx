import EmailList from './components/EmailList'

async function getNewsletterSubscriptions() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/newsletter`, {
            cache: 'no-store', // Ensure fresh data
        })

        if (!response.ok) {
            throw new Error('Failed to fetch newsletter subscriptions')
        }

        const data = await response.json()
        return data.subscriptions || []
    } catch (error) {
        console.error('Error fetching newsletter subscriptions:', error)
        return []
    }
}

export default async function DashboardEmailPage() {
    const subscriptions = await getNewsletterSubscriptions()

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Email Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage your newsletter subscribers and email campaigns</p>
            </div>

            <EmailList subscriptions={subscriptions} />
        </div>
    )
}
