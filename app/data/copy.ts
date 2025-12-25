import { FeatureItem } from "../components/BentoFeature";
import { CardProps } from "../components/CardSection";
import { Promotion } from "../components/PromotionSection";
import { BlogPost } from "../types";

export const features: FeatureItem[] = [
  {
    title: "Bali Escape Under $600",
    subtitle: "Flights + 4 Nights Resort",
    description:
      "Unplug in paradise without the price tag. This Bali deal includes roundtrip airfare and four nights at a beachfront resort — perfect for digital detox, nature lovers, or a relaxing reset. Limited spots available for spring and early summer travel.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1712029680514-dafc085deffd?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Tokyo Cherry Blossom Sale",
    subtitle: "Flights from $450 Roundtrip",
    description:
      "Spring in Tokyo is magic. Book now to see the sakura in full bloom, stroll historic gardens, and enjoy world-class ramen. Roundtrip flights from select cities are going fast for March and April departures.",
    imageUrl: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Lisbon City Break",
    subtitle: "5 Days Under $400",
    description:
      "Discover Portugal’s capital with this budget-friendly city break. Hotel stays start under $80/night, leaving room for local eats, wine bars, and iconic trams. Ideal for couples or solo travelers craving culture on a budget.",
    imageUrl: "https://images.unsplash.com/photo-1578859651203-c7126a106b59?q=80&w=2972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Thailand Island Hopper",
    subtitle: "Phuket → Krabi → Koh Samui",
    description:
      "Chase the sun across Thailand’s most beautiful islands. This route is perfect for first-timers or returning adventurers. Book flexible ferries, boutique hotels, and beachfront stays — all in one easy plan.",
    imageUrl: "https://images.unsplash.com/photo-1575641754416-ebad8bb38531?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Rome Flights from $399",
    subtitle: "Spring & Fall Departures",
    description:
      "Fly roundtrip to Rome for less than a designer handbag. Wander ancient ruins, sip espresso at street cafés, and enjoy shoulder-season prices with this limited-time deal from major U.S. cities.",
    imageUrl: "https://plus.unsplash.com/premium_photo-1661962723801-1015e61ec340?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];


export const destinations: CardProps[] = [
  {
    id: 1,
    title: 'Japan',
    href: '/destinations/japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 2,
    title: 'Italy',
    href: '/destinations/italy',
    imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 3,
    title: 'Thailand',
    href: '/destinations/thailand',
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 4,
    title: 'Portugal',
    href: '/destinations/portugal',
    imageUrl: 'https://images.unsplash.com/photo-1584902944277-e940bafc669d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 5,
    title: 'Vietnam',
    href: '/destinations/vietnam',
    imageUrl: 'https://images.unsplash.com/photo-1568824788192-544bb51ced34?q=80&w=2043&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 6,
    title: 'Mexico',
    href: '/destinations/mexico',
    imageUrl: 'https://images.unsplash.com/photo-1564762332974-5bf63a654c9d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
]

export const regions: CardProps[] = [
  {
    id: 1,
    title: 'Japan',
    href: '/destinations/japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 2,
    title: 'Italy',
    href: '/destinations/italy',
    imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 3,
    title: 'Thailand',
    href: '/destinations/thailand',
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 4,
    title: 'Portugal',
    href: '/destinations/portugal',
    imageUrl: 'https://images.unsplash.com/photo-1584902944277-e940bafc669d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 5,
    title: 'Vietnam',
    href: '/destinations/vietnam',
    imageUrl: 'https://images.unsplash.com/photo-1568824788192-544bb51ced34?q=80&w=2043&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 6,
    title: 'Mexico',
    href: '/destinations/mexico',
    imageUrl: 'https://images.unsplash.com/photo-1564762332974-5bf63a654c9d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
]

export const promotions: Promotion[] = [
  {
    title: 'Bali Beachfront Escape',
    subtitle: '5 Nights + Flights | From $599',
    tag: '🔥 Limited Time',
    type: 'flight',
    price: "USD$ 200",
    href: 'https://trip.com/deal/bali',
    phone: 'tel:+18005551234',

  },
  {
    title: 'Tokyo City Adventure',
    subtitle: '4-Star Hotel + Flights | $850 Total',
    tag: 'Top Pick',
    type: 'activity',
    price: "USD$ 200",
    href: 'https://trip.com/deal/tokyo',
    phone: 'tel:+18005559876',
  },
  {
    title: 'Paris in Spring',
    subtitle: 'Romantic Views + Airfare | From $780',
    tag: '✨ Trending',
    type: 'hotel',
    price: "USD$ 200",
    href: 'https://trip.com/deal/paris',
    phone: 'tel:+18005557890',
  },
  {
    title: 'Greek Island Hopping',
    subtitle: 'Santorini + Naxos | $950 Getaway',
    tag: '🌊 Bestseller',
    type: 'flight',
    price: "USD$ 200",
    href: 'https://trip.com/deal/greece',
    phone: 'tel:+18005553421',
  },
  {
    title: 'Costa Rica Eco Adventure',
    subtitle: 'Rainforest Lodges + Flights | $999',
    tag: '🌿 Eco Friendly',
    type: 'flight',
    price: "USD$ 200",
    href: 'https://trip.com/deal/costa-rica',
    phone: 'tel:+18005550999',
  },
  {
    title: 'Dubai Luxury Weekend',
    subtitle: '5-Star Hotel + Desert Safari | $1,200',
    tag: '💎 VIP',
    type: 'flight',
    price: "USD$ 200",
    href: 'https://trip.com/deal/dubai',
    phone: 'tel:+18005550123',
  },
]

