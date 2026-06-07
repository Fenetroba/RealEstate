export type LandingServiceItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
};

export const landingServicesContent = {
  eyebrow: 'Platform services',
  title: 'Explore how EDENET supports every step of property ownership',
  imageSrc: '/landing-services.jpg',
  imageAlt: 'Modern home with pool representing premium property on EDENET',
  items: [
    {
      id: 'listings',
      title: 'Verified listings',
      description:
        'Browse minted properties with live sale and rent status, photos, and documents linked to the on-chain registry—so you know what you are viewing before you inquire.',
      href: '/properties',
    },
    {
      id: 'register',
      title: 'Owner registration',
      description:
        'Property owners submit deeds and media through a guided flow. Authorized government reviewers approve or decline before anything is recorded on-chain.',
      href: '/dashboard/listings/create',
    },
    {
      id: 'review',
      title: 'Government review',
      description:
        'Designated reviewers inspect submissions in a dedicated queue, with clear approve and decline paths so only vetted properties reach the public catalog.',
      href: '/dashboard/property-approvals',
    },
    {
      id: 'verify',
      title: 'Public verification',
      description:
        'Anyone can re-hash stored files and compare metadata to the on-chain record—no wallet or account required—to confirm a listing has not been tampered with.',
      href: '/properties',
    },
    {
      id: 'registry',
      title: 'Hybrid registry guidance',
      description:
        'Deeds and media stay in a secure database while hashes on the contract make changes detectable. We help teams understand what lives off-chain versus on-chain.',
      href: '/about',
    },
  ] satisfies LandingServiceItem[],
} as const;
