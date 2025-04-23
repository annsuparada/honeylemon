import { ArrowRightIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'
import { PaperAirplaneIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/solid'

export type Promotion = {
  title: string
  subtitle: string
  tag: string
  type: 'flight' | 'hotel' | 'activity'
  href: string
  phone: string
  price: string
}

interface PromotionSectionProps {
  items: Promotion[]
  heading?: string
  subheading?: string
}

const typeIconMap = {
  flight: <PaperAirplaneIcon className="h-5 w-5 text-blue-500" />, // flight icon
  hotel: <BuildingOfficeIcon className="h-5 w-5 text-emerald-500" />, // hotel icon
  activity: <MapPinIcon className="h-5 w-5 text-orange-500" /> // activity icon
}

export default function PromotionSection({
  items,
  heading = '🔥 Hot Deals',
  subheading = 'Handpicked travel promotions updated daily',
}: PromotionSectionProps) {
  return (
    <section className="py-12 bg-yellow-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{heading}</h2>
          <p className="mt-2 text-lg text-gray-600">{subheading}</p>
        </div>

        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((deal) => (
            <li
              key={deal.title}
              className="col-span-1 rounded-lg bg-white p-4 shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {typeIconMap[deal.type]}
                  <h3 className="text-base font-semibold text-gray-900">{deal.title}</h3>
                </div>
                <p className="text-sm text-gray-500">{deal.subtitle}</p>
                <p className="text-xs text-gray-400">{deal.tag}</p>
                <hr className="my-2" />

              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-rose-600 whitespace-nowrap">From {deal.price}</p>
                <Link
                  href={deal.href}
                  className="inline-flex items-center justify-center rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Book
                  <ArrowRightIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
