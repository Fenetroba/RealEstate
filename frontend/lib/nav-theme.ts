import type { ButtonProps } from '@/components/ui/Button';

type NavButtonVariant = NonNullable<ButtonProps['variant']>;

export interface NavbarThemeClasses {
  track: string;
  linkActive: string;
  linkIdle: string;
  brand: string;
  brandAccent: string;
  iconBtn: string;
  chip: string;
  userMenuBtn: string;
  userMenuChevron: string;
  dropdown: string;
  dropdownBorder: string;
  dropdownMuted: string;
  dropdownLink: string;
  mobilePanel: string;
  mobileOverlay: string;
  mobileLink: string;
  mobileLinkActive: string;
  mobileDivider: string;
  walletVariant: NavButtonVariant;
  signInVariant: NavButtonVariant;
}

export function getNavbarThemeClasses(
  isDark: boolean,
  isHeroSurface: boolean,
): NavbarThemeClasses {
  if (isDark) {
    return {
      track: 'bg-black border-white/10 text-white shadow-lg shadow-black/20',
      linkActive: 'text-white border-accent font-semibold',
      linkIdle: 'text-white/70 hover:text-white border-transparent',
      brand: 'text-white',
      brandAccent: 'text-accent',
      iconBtn:
        'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-accent',
      chip: 'border-white/10 bg-white/5 text-white/80',
      userMenuBtn: 'border-white/10 bg-white/5 hover:bg-white/10',
      userMenuChevron: 'text-white/60',
      dropdown: 'bg-card border-border text-card-foreground shadow-2xl backdrop-blur-md',
      dropdownBorder: 'border-border',
      dropdownMuted: 'text-muted',
      dropdownLink: 'text-muted hover:bg-surface hover:text-accent',
      mobilePanel: 'border-white/10 bg-black text-white',
      mobileOverlay: 'bg-black/55',
      mobileLink: 'text-white/80 hover:text-white border-transparent',
      mobileLinkActive: 'text-white border-accent font-semibold',
      mobileDivider: 'border-white/10',
      walletVariant: 'onDarkOutline',
      signInVariant: 'onDarkOutline',
    };
  }

  if (isHeroSurface) {
    return {
      track: 'bg-primary border-white/15 text-white shadow-lg shadow-primary/20',
      linkActive: 'text-white border-accent font-semibold',
      linkIdle: 'text-white/75 hover:text-white border-transparent',
      brand: 'text-white',
      brandAccent: 'text-accent',
      iconBtn:
        'border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-accent',
      chip: 'border-white/15 bg-white/10 text-white/90',
      userMenuBtn: 'border-white/15 bg-white/10 hover:bg-white/20',
      userMenuChevron: 'text-white/70',
      dropdown: 'bg-card border-border text-card-foreground shadow-2xl',
      dropdownBorder: 'border-border',
      dropdownMuted: 'text-muted',
      dropdownLink: 'text-muted hover:bg-surface hover:text-accent',
      mobilePanel: 'border-white/15 bg-primary text-white',
      mobileOverlay: 'bg-primary/50',
      mobileLink: 'text-white/80 hover:text-white border-transparent',
      mobileLinkActive: 'text-white border-accent font-semibold',
      mobileDivider: 'border-white/15',
      walletVariant: 'onDark',
      signInVariant: 'onDark',
    };
  }

  return {
    track: 'bg-white border-primary/10 text-primary shadow-sm shadow-primary/5',
    linkActive: 'text-primary border-accent font-semibold',
    linkIdle: 'text-primary/70 hover:text-primary border-transparent',
    brand: 'text-primary',
    brandAccent: 'text-accent',
    iconBtn:
      'border-primary/15 bg-primary/5 text-primary hover:bg-primary/10 hover:text-accent',
    chip: 'border-primary/15 bg-primary/5 text-primary',
    userMenuBtn: 'border-primary/15 bg-primary/5 hover:bg-primary/10',
    userMenuChevron: 'text-primary/50',
    dropdown: 'bg-card border-border text-card-foreground shadow-xl',
    dropdownBorder: 'border-border',
    dropdownMuted: 'text-muted',
    dropdownLink: 'text-muted hover:bg-surface hover:text-accent',
    mobilePanel: 'border-primary/10 bg-white text-primary',
    mobileOverlay: 'bg-primary/30',
    mobileLink: 'text-primary/80 hover:text-primary border-transparent',
    mobileLinkActive: 'text-primary border-accent font-semibold',
    mobileDivider: 'border-primary/10',
    walletVariant: 'outline',
    signInVariant: 'outline',
  };
}
