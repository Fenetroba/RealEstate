import { SITE_BRAND_NAME } from '@/lib/site-brand';

export type AboutLeadSegment = {
  text: string;
  highlight?: boolean;
};

export type AboutBenefitIcon =
  | 'compass'
  | 'file-plus'
  | 'shield-check'
  | 'building'
  | 'badge-check';

export type AboutBenefit = {
  number: number;
  title: string;
  description: string;
  imagePosition: 'left' | 'right';
  icon: AboutBenefitIcon;
  visualLabel: string;
  href: string;
  hrefLabel: string;
};

export const aboutCopy = {
  metaTitle: `About — ${SITE_BRAND_NAME}`,
  title: `About ${SITE_BRAND_NAME}`,
  leadSegments: [
    { text: "We're here to " },
    { text: 'answer your questions', highlight: true },
    { text: ' and help you use the registry. ' },
    { text: SITE_BRAND_NAME, highlight: true },
    { text: ' is a hybrid property platform built for ' },
    { text: 'buyers, owners, and government reviewers', highlight: true },
    { text: '. It connects ' },
    { text: 'real files in a secure database', highlight: true },
    { text: ' with ' },
    { text: 'on-chain fingerprints', highlight: true },
    { text: ' so listings stay ' },
    { text: 'checkable after they go live', highlight: true },
    { text: '—with public integrity audits and wallet-native registration.' },
  ] satisfies AboutLeadSegment[],
  benefitsTitle: 'Key benefits',
  benefits: [
    {
      number: 1,
      title: 'Browse verified listings',
      description:
        'Explore minted properties with on-chain sale and rent status, photos, documents, and detail pages wired to the live catalog API.',
      imagePosition: 'right',
      icon: 'compass',
      visualLabel: 'Public registry catalog',
      href: '/properties',
      hrefLabel: 'View listings',
    },
    {
      number: 2,
      title: 'Register with your wallet',
      description:
        'Owners upload images and PDFs, then sign a registration request. Hashes are stored in the database and submitted to the contract for review.',
      imagePosition: 'left',
      icon: 'file-plus',
      visualLabel: 'submitRequest on-chain',
      href: '/dashboard/listings/create',
      hrefLabel: 'Submit property',
    },
    {
      number: 3,
      title: 'Government review & mint',
      description:
        'Authorized reviewers approve or decline submissions. Approved properties mint as NFTs and link database records to a token id.',
      imagePosition: 'right',
      icon: 'shield-check',
      visualLabel: 'Admin mint workflow',
      href: '/dashboard/property-approvals',
      hrefLabel: 'Admin dashboard',
    },
    {
      number: 4,
      title: 'Own & update metadata',
      description:
        'NFT owners manage their properties, request metadata updates, and track version history after government approval.',
      imagePosition: 'left',
      icon: 'building',
      visualLabel: 'My properties dashboard',
      href: '/dashboard/my-properties',
      hrefLabel: 'My properties',
    },
    {
      number: 5,
      title: 'Public integrity audit',
      description:
        'Anyone can call the verify API to re-hash file bytes and compare database roots and metadata to the contract—no login required.',
      imagePosition: 'right',
      icon: 'badge-check',
      visualLabel: 'Tamper-proof check',
      href: '/properties/1/verify',
      hrefLabel: 'Run audit',
    },
  ] satisfies AboutBenefit[],
  cta: {
    title: 'Ready to explore the registry?',
    primary: { label: 'Browse listings', href: '/properties' },
    secondary: { label: 'Contact us', href: '/contact' },
  },
} as const;

export function aboutLeadPlainText(): string {
  return aboutCopy.leadSegments.map((s) => s.text).join('');
}
