export type NavSegment =
  | 'home'
  | 'listings'
  | 'about'
  | 'contact'
  | 'market'
  | 'dashboard'
  | 'profile';

export interface MainNavLink {
  href: string;
  label: string;
  segment: NavSegment;
}

export interface AccountNavLink {
  href: string;
  label: string;
}

export const mainNavLinks: MainNavLink[] = [
  { href: '/properties', label: 'Listings', segment: 'listings' },
  { href: '/about', label: 'About', segment: 'about' },
  { href: '/contact', label: 'Contact', segment: 'contact' },
 
];

export const accountNavLinks: AccountNavLink[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/verification', label: 'KYC' },
];
