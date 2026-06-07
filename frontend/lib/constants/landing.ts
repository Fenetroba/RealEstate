/** Property cards shown in the landing featured row */
export const LANDING_FEATURED_CARD_COUNT = 12;

export const heroContent = {
  headlineLine1: 'Where Dreams',
  headlineLine2: 'Find a Home',
  subtitle:
    'Browse verified listings, compare neighborhoods, and take your next step with Edenet Real Estate.',
  imageSrc: '/hero-v2.jpg',
  imageAlt:
    'Modern home at dusk with the building on the right and open space on the left',
} as const;

export const platformStats = [
  { value: '12,847+', label: 'Verified properties listed' },
  { value: '$2.8B+', label: 'Total transaction volume' },
  { value: '48K+', label: 'Registered users' },
  { value: '99.9%', label: 'Listings verified on chain' },
] as const;

export const ctaContent = {
  title: 'Ready to Transform Your',
  titleAccent: 'Real Estate Journey?',
  subtitle:
    'Join property owners and buyers who trust Edenet for secure, transparent on-chain real estate.',
  primaryCta: { label: 'Create Free Account', href: '/auth/register' },
  secondaryCta: { label: 'Browse listings', href: '/properties' },
} as const;
