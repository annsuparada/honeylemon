import SectionHeader from "../components/typography/SectionHeader"

export type CardProps = {
    id: number
    title: string
    href: string
    imageUrl: string
}

const Card = ({ card }: { card: CardProps }) => {
    return (
        <a href={card.href} className="group block rounded-lg overflow-hidden shadow transition hover:scale-[1.01]">
            <div className="relative h-64 w-full">
                <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg" />
                <div className="absolute bottom-4 left-4 z-10">
                    <h3 className="text-white text-lg font-semibold drop-shadow-md">{card.title}</h3>
                </div>
            </div>
        </a>
    );
};



type CardSectionProps = {
    cardData: CardProps[]
    title: string
    subtitle: string
}

export default function CardSection({ cardData, title, subtitle }: CardSectionProps) {
    return (
        <section className="bg-base-100 py-24 sm:py-32">
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

