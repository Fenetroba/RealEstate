import { SITE_BRAND_NAME } from '@/lib/site-brand';

export type WhyEdenetBentoTone = 'image' | 'surface' | 'primary' | 'primary-media';

export type WhyEdenetBentoCard = {
  id: string;
  title: string;
  description: string;
  tone: WhyEdenetBentoTone;
  imageSrc?: string;
  imageAlt?: string;
  href?: string;
};

export const whyEdenetBentoContent = {
  eyebrow: 'Why EDENET',
  title: `What ${SITE_BRAND_NAME} gives you`,
  cards: [
    {
      id: 'listings',
      title: 'Verified listings',
      description:
        'Browse minted properties with live sale and rent status, photos, and documents tied to the registry.',
      tone: 'image',
      imageSrc: '/landing-bento-listings.jpg',
      imageAlt: 'Team reviewing property documents together',
      href: '/properties',
    },
    {
      id: 'review',
      title: 'Government review',
      description:
        'Owners submit with a wallet; authorized reviewers approve or decline before anything is minted on-chain.',
      tone: 'surface',
      href: '/dashboard/property-approvals',
    },
    {
      id: 'hybrid',
      title: 'Hybrid registry',
      description:
        'Deeds and media stay in a secure database. Hashes on the contract make tampering detectable after go-live.',
      tone: 'primary',
      href: '/about',
    },
    {
      id: 'verify',
      title: 'Public verification',
      description:
        'Anyone can re-hash stored files and compare metadata to the on-chain record—no account required.',
      tone: 'primary-media',
      imageSrc: '/landing-bento-verify.jpg',
      imageAlt: 'Professional reviewing a property listing',
      href: '/properties',
    },
  ] satisfies WhyEdenetBentoCard[],
} as const;
