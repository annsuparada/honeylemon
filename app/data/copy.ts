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
    href: '/blog/boost-conversion',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 2,
    title: 'Italy',
    href: '/blog/travel-budget',
    imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 3,
    title: 'Thailand',
    href: '/blog/top-destinations',
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 4,
    title: 'Portugal',
    href: '/blog/top-destinations',
    imageUrl: 'https://images.unsplash.com/photo-1584902944277-e940bafc669d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 5,
    title: 'Vietnam',
    href: '/blog/top-destinations',
    imageUrl: 'https://images.unsplash.com/photo-1568824788192-544bb51ced34?q=80&w=2043&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 6,
    title: 'Mexico',
    href: '/blog/top-destinations',
    imageUrl: 'https://images.unsplash.com/photo-1564762332974-5bf63a654c9d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
]

export const regions: CardProps[] = [
  {
    id: 1,
    title: 'Japan',
    href: '/blog/boost-conversion',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 2,
    title: 'Italy',
    href: '/blog/travel-budget',
    imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 3,
    title: 'Thailand',
    href: '/blog/top-destinations',
    imageUrl: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 4,
    title: 'Portugal',
    href: '/blog/top-destinations',
    imageUrl: 'https://images.unsplash.com/photo-1584902944277-e940bafc669d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 5,
    title: 'Vietnam',
    href: '/blog/top-destinations',
    imageUrl: 'https://images.unsplash.com/photo-1568824788192-544bb51ced34?q=80&w=2043&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 6,
    title: 'Mexico',
    href: '/blog/top-destinations',
    imageUrl: 'https://images.unsplash.com/photo-1564762332974-5bf63a654c9d?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
]

export const budgetPosts: BlogPost[] = [
  {
    id: "budget-1",
    title: "Bangkok on a Budget: 5 Days Under $300",
    slug: "bangkok-5-days-under-300",
    content: "Explore Bangkok’s temples, street food, and culture without breaking the bank.",
    description: "A full Bangkok itinerary that’s cheap, fun, and unforgettable.",
    image: "https://images.pexels.com/photos/2797526/pexels-photo-2797526.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-01T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Budget Travel",
      slug: "budget-travel",
    },
    categoryId: "cat-budget",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "budget-2",
    title: "Lisbon for Less: $400 Getaway",
    slug: "lisbon-budget-travel",
    content: "Wander the hills of Lisbon, taste pastel de nata, and catch sunset views for under $400.",
    description: "A scenic European trip on a shoestring budget.",
    image: "https://images.pexels.com/photos/3763903/pexels-photo-3763903.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-02T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Budget Travel",
      slug: "budget-travel",
    },
    categoryId: "cat-budget",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: "ARTICLE"
  },
  {
    id: "budget-3",
    title: "Mexico City: Culture & Tacos Under $350",
    slug: "mexico-city-budget-guide",
    content: "Explore ancient ruins and vibrant neighborhoods while eating the best tacos of your life.",
    description: "Budget-friendly Mexico City guide with hidden gems.",
    image: "https://images.pexels.com/photos/763429/pexels-photo-763429.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-03T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Budget Travel",
      slug: "budget-travel",
    },
    categoryId: "cat-budget",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "budget-4",
    title: "Bali Backpacking: Temples, Beaches, and $20 Hostels",
    slug: "bali-budget-backpacking",
    content: "A laid-back Bali trip for backpackers on a shoestring budget.",
    description: "Your $400 guide to Bali’s best on a budget.",
    image: "https://images.pexels.com/photos/2474690/pexels-photo-2474690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-04T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Budget Travel",
      slug: "budget-travel",
    },
    categoryId: "cat-budget",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "budget-5",
    title: "Explore Vietnam with Just $450",
    slug: "vietnam-cheap-travel-guide",
    content: "From Hanoi to Ho Chi Minh — eat, explore, and relax affordably.",
    description: "Stretch your dollar with this Vietnam travel plan.",
    image: "https://images.pexels.com/photos/2602490/pexels-photo-2602490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-05T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Budget Travel",
      slug: "budget-travel",
    },
    categoryId: "cat-budget",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "budget-6",
    title: "Cambodia's Angkor Wat on $20/Day",
    slug: "angkorwat-budget-trip",
    content: "See the ancient wonders of Cambodia without overspending.",
    description: "A $300 temple adventure through Siem Reap.",
    image: "https://images.pexels.com/photos/2495575/pexels-photo-2495575.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-06T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Budget Travel",
      slug: "budget-travel",
    },
    categoryId: "cat-budget",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
];

export const midRangePosts: BlogPost[] = [
  {
    id: "mid-1",
    title: "7 Days in Greece: Island Hopping Made Easy",
    slug: "greece-island-hopping-guide",
    content: "Visit Santorini and Naxos with mid-range accommodations, ferry tips, and beach bars.",
    description: "Greek island life without the luxury bill.",
    image: "https://images.pexels.com/photos/164336/pexels-photo-164336.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-01T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Mid-Range Travel",
      slug: "mid-range-travel",
    },
    categoryId: "cat-mid",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "mid-2",
    title: "Japan for Foodies: Tokyo & Osaka Under $1,000",
    slug: "japan-food-trip-midrange",
    content: "Where to eat, stay, and explore in Japan on a mid-range budget.",
    description: "A food-first Japan trip under $1,000.",
    image: "https://images.pexels.com/photos/2070033/pexels-photo-2070033.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-02T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Mid-Range Travel",
      slug: "mid-range-travel",
    },
    categoryId: "cat-mid",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "mid-3",
    title: "Explore Morocco: Marrakech & Desert Tours",
    slug: "morocco-midrange-guide",
    content: "Shop souks, ride camels, and stay in a riad with this $950 plan.",
    description: "Vibrant culture with comfort and adventure.",
    image: "https://images.pexels.com/photos/31653067/pexels-photo-31653067/free-photo-of-camel-trekking-adventure-in-moroccan-desert.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-03T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Mid-Range Travel",
      slug: "mid-range-travel",
    },
    categoryId: "cat-mid",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "mid-4",
    title: "Argentina Wine Country for $800",
    slug: "argentina-wine-country-trip",
    content: "Fly to Mendoza and tour vineyards while enjoying 4-star stays.",
    description: "Wine and dine without going broke.",
    image: "https://images.pexels.com/photos/19046659/pexels-photo-19046659/free-photo-of-people-riding-horseback-around-a-vineyard.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-04T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Mid-Range Travel",
      slug: "mid-range-travel",
    },
    categoryId: "cat-mid",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "mid-5",
    title: "Thailand’s Islands: Comfort Without Crowds",
    slug: "thailand-islands-midrange",
    content: "Visit Koh Lanta and Koh Yao for serene beach stays with boutique hotels under $1,000.",
    description: "Quiet Thai islands, cozy budget.",
    image: "https://images.pexels.com/photos/5567082/pexels-photo-5567082.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-05T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Mid-Range Travel",
      slug: "mid-range-travel",
    },
    categoryId: "cat-mid",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "mid-6",
    title: "Costa Rica Nature Trip: Volcanoes, Waterfalls & Comfort",
    slug: "costa-rica-midrange-trip",
    content: "A $900 adventure through Arenal, Monteverde, and waterfalls with cozy ecolodges.",
    description: "Adventurous and relaxing — perfect balance.",
    image: "https://images.pexels.com/photos/2024534/pexels-photo-2024534.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-06T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Mid-Range Travel",
      slug: "mid-range-travel",
    },
    categoryId: "cat-mid",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
];

export const luxuryPosts: BlogPost[] = [
  {
    id: "luxury-1",
    title: "Bali Bliss: Private Villa & Pool for Less",
    slug: "bali-luxury-villa-escape",
    content: "Experience a private villa in Ubud with daily breakfast, massages, and jungle views.",
    description: "5-star retreat in Bali’s lush hills.",
    image: "https://images.unsplash.com/photo-1668957065532-5770d193d501?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "PUBLISHED",
    createdAt: "2025-04-01T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Luxury Travel",
      slug: "luxury-travel",
    },
    categoryId: "cat-luxury",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: 'ARTICLE'
  },
  {
    id: "luxury-2",
    title: "Santorini in Style: Cave Hotel & Caldera Views",
    slug: "santorini-luxury-getaway",
    content: "Aegean elegance with cliffside stays, wine tastings, and sunset yacht cruises.",
    description: "Greece’s dreamiest island in 4-star luxury.",
    image: "https://images.unsplash.com/photo-1556104577-09754a15dff2?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    status: "PUBLISHED",
    createdAt: "2025-04-02T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Luxury Travel",
      slug: "luxury-travel",
    },
    categoryId: "cat-luxury",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: "ARTICLE"
  },
  {
    id: "luxury-3",
    title: "Dubai Deluxe: 5-Star Hotel + Desert Safari",
    slug: "dubai-luxury-safari-stay",
    content: "Skyscrapers, fine dining, and a golden desert ride — all with VIP service.",
    description: "Modern luxury in the heart of Dubai.",
    image: "https://images.pexels.com/photos/1467300/pexels-photo-1467300.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-03T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Luxury Travel",
      slug: "luxury-travel",
    },
    categoryId: "cat-luxury",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: "ARTICLE"
  },
  {
    id: "luxury-4",
    title: "Paris in Spring: Eiffel Views & Michelin Meals",
    slug: "paris-luxury-weekend",
    content: "Elegant hotel stays, gourmet dinners, and art walks in the most romantic city on earth.",
    description: "A dreamy spring weekend in style.",
    image: "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-04T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Luxury Travel",
      slug: "luxury-travel",
    },
    categoryId: "cat-luxury",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: "ARTICLE"
  },
  {
    id: "luxury-5",
    title: "Maldives Magic: Overwater Bungalow Bliss",
    slug: "maldives-overwater-luxury",
    content: "Sleep above crystal waters, snorkel with sea turtles, and indulge in spa serenity.",
    description: "A once-in-a-lifetime tropical escape.",
    image: "https://images.pexels.com/photos/1287441/pexels-photo-1287441.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-05T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Luxury Travel",
      slug: "luxury-travel",
    },
    categoryId: "cat-luxury",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: "ARTICLE"
  },
  {
    id: "luxury-6",
    title: "South Africa Safari & Wine Country",
    slug: "south-africa-luxury-adventure",
    content: "From Big Five game drives to Stellenbosch wine tastings — adventure meets indulgence.",
    description: "5-star lodges & vineyard views await.",
    image: "https://images.pexels.com/photos/5213955/pexels-photo-5213955.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    status: "PUBLISHED",
    createdAt: "2025-04-06T08:00:00Z",
    updatedAt: "2025-04-01T08:00:00Z",
    category: {
      name: "Luxury Travel",
      slug: "luxury-travel",
    },
    categoryId: "cat-luxury",
    author: {
      id: "author-ann",
      name: "Ann",
      username: "anntravels",
    },
    type: "ARTICLE"
  },
];

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

