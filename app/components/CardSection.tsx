import SectionHeader from "./SectionHeader"

export type CardProps = {
    id: number
    title: string
    href: string
    imageUrl: string
}

const Card = ({ card }: { card: CardProps }) => {
    return (
        <article
            key={card.id}
            className="relative isolate flex flex-col justify-end overflow-hidden rounded-md bg-gray-900 px-6 pt-40 pb-6 sm:pt-56 lg:pt-64"
        >
            <img
                alt={card.title}
                src={card.imageUrl}
                className="absolute inset-0 -z-10 size-full object-cover"
            />
            {/* Make the overlay lighter and smoother */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 -z-10 rounded-md ring-1 ring-white/10 ring-inset" />

            <h3 className="mt-3 text-xl font-semibold text-white drop-shadow-md">
                <a href={card.href} className="relative z-10">
                    <span className="absolute inset-0" />
                    {card.title}
                </a>
            </h3>
        </article>
    )
}


type CardSectionProps = {
    cardData: CardProps[]
    title: string
    subtitle: string
}

export default function CardSection({ cardData, title, subtitle }: CardSectionProps) {
    return (
        <section className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeader title={title} subtitle={subtitle} />
                <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {cardData.map((card) => (
                        <Card key={card.id} card={card} />
                    ))}
                </div>
            </div>
        </section>
    )
}
