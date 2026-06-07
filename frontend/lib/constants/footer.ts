import { mainNavLinks } from '@/lib/constants/navigation';
import { SITE_BRAND_NAME } from '@/lib/site-brand';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkSection {
  title: string;
  links: FooterLink[];
}

export type FooterContactIcon = 'mail' | 'phone';

export interface FooterContactItem {
  icon: FooterContactIcon;
  label: string;
  href?: string;
}

/** Lucide icon keys — brand icons are not exported in current lucide-react. */
export type FooterSocialIcon = 'users' | 'at-sign' | 'code' | 'camera';

export interface FooterSocialLink {
  label: string;
  href: string;
  icon: FooterSocialIcon;
}

export const footerTagline =
  'Verified listings and secure transactions for your next property move.';

export const footerContactItems: FooterContactItem[] = [
  { icon: 'mail', label: 'hello@edenet.io', href: 'mailto:hello@edenet.io' },
  { icon: 'phone', label: '+1 (888) 555-0100', href: 'tel:+18885550100' },
];

export const footerSocialLinks: FooterSocialLink[] = [
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'users' },
  { label: 'X (Twitter)', href: 'https://twitter.com', icon: 'at-sign' },
  { label: 'GitHub', href: 'https://github.com', icon: 'code' },
  { label: 'Instagram', href: 'https://instagram.com', icon: 'camera' },
];

export const footerLinkSections: FooterLinkSection[] = [
  {
    title: 'Explore',
    links: [
      ...mainNavLinks.map(({ href, label }) => ({ href, label })),
      { label: 'Market', href: '/market' },
    ],
  },
  {
    title: 'Company',
    links: mainNavLinks
      .filter((link) => link.segment === 'about' || link.segment === 'contact')
      .map(({ href, label }) => ({ href, label })),
  },
];

export const footerLegalLinks: FooterLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];

export const footerCopyrightHolder = SITE_BRAND_NAME;
