'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
  Wallet,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SiteBrandLogo } from '@/components/layout/SiteBrandLogo';
import { NavbarMobileMenuDrawer, NavbarMobileMenuTrigger } from '@/components/navbar-mobile-menu';
import { useNavSurfaceScroll } from '@/hooks/use-nav-surface-scroll';
import {
  accountNavLinks,
  mainNavLinks,
  type NavSegment,
} from '@/lib/constants/navigation';
import {
  landingPageContentMaxClass,
  landingPageGutterClass,
  landingPageGutterTailwindClass,
} from '@/lib/landing-page-layout';
import { getNavbarThemeClasses } from '@/lib/nav-theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { setTheme } from '@/store/slices/uiSlice';
import { WalletConnectControl } from '@/components/web3/WalletConnectControl';
import { addToast } from '@/store/slices/uiSlice';
import { useWeb3 } from '@/contexts/Web3Context';
import { cn, getInitials, truncateAddress } from '@/lib/utils';

const NAV_ITEMS = mainNavLinks;

function useActiveSegment(): NavSegment {
  const pathname = usePathname();

  if (pathname.startsWith('/properties')) return 'listings';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/contact')) return 'contact';
  if (pathname.startsWith('/market')) return 'market';
  if (pathname.startsWith('/profile') || pathname.startsWith('/dashboard/profile')) return 'profile';
  if (pathname === '/') return 'home';

  return 'home';
}

function NavLink({
  href,
  label,
  active,
  activeClass,
  idleClass,
}: {
  href: string;
  label: string;
  active: boolean;
  activeClass: string;
  idleClass: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap border-b-2 px-2 py-1 text-sm font-medium transition-colors motion-reduce:transition-none',
        active ? activeClass : idleClass,
      )}
    >
      {label}
    </Link>
  );
}

// ── Wallet button shown in navbar ────────────────────────────────────────────

function NavWalletButton({ className }: { className?: string }) {
  const dispatch  = useAppDispatch();
  const { connect, disconnect } = useWeb3();
  const { address, isConnected, isConnecting } = useAppSelector((s) => s.wallet);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  const handleClick = () => {
    if (!isAuthenticated) {
      dispatch(addToast({
        type: 'warning',
        title: 'Login required',
        message: 'Please log in first to connect your wallet.',
        duration: 4000,
      }));
      return;
    }
    void connect();
  };

  // SSR placeholder — always renders as disconnected
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Connect wallet"
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-full border transition-colors',
          className,
        )}
      >
        <Wallet className="size-4" />
      </button>
    );
  }

  // Connected — show green dot + truncated address chip
  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={disconnect}
        title={`Disconnect ${address}`}
        aria-label="Disconnect wallet"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-1 font-mono text-xs text-green-600 transition-colors hover:bg-green-500/20 dark:text-green-400',
          className,
        )}
      >
        {/* Animated pulse dot */}
        <span className="relative flex size-2 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-green-500" />
        </span>
        {truncateAddress(address)}
      </button>
    );
  }

  // Disconnected — wallet icon button
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isConnecting}
      aria-label="Connect wallet"
      title="Connect wallet"
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-full border transition-colors',
        className,
      )}
    >
      {isConnecting
        ? <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        : <Wallet className="size-4" />
      }
    </button>
  );
}

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { unreadCount } = useAppSelector((s) => s.notification);
  const theme = useAppSelector((s) => s.ui.theme);
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const pathname = usePathname();
  const active = useActiveSegment();
  const scrollSurface = useNavSurfaceScroll();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [heroSurfaceLocked, setHeroSurfaceLocked] = React.useState<boolean | null>(null);

  // Prevent SSR/client mismatch — auth state is only known after hydration
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  // Use mounted guard for auth-dependent rendering
  const showAuth = mounted && isAuthenticated && !!user;

  const isHome = pathname === '/';
  const isNavOverlay =
    isHome ||
    pathname.startsWith('/properties') ||
    pathname === '/about' ||
    pathname === '/contact';
  const isDark = theme === 'dark';
  const isHeroSurface = !isDark && scrollSurface === 'dark';

  const isHeroSurfaceRef = React.useRef(isHeroSurface);
  isHeroSurfaceRef.current = isHeroSurface;

  React.useEffect(() => {
    if (!mobileNavOpen) {
      setHeroSurfaceLocked(null);
      return;
    }
    setHeroSurfaceLocked(isHeroSurfaceRef.current);
  }, [mobileNavOpen]);

  const navTheme = getNavbarThemeClasses(isDark, heroSurfaceLocked ?? isHeroSurface);

  React.useEffect(() => {
    setMobileNavOpen(false);
    setUserMenuOpen(false);
    document.body.style.overflow = '';
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  React.useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        '--site-nav-header-height',
        `${el.getBoundingClientRect().height}px`,
      );
    };

    syncHeaderHeight();
    const observer = new ResizeObserver(syncHeaderHeight);
    observer.observe(el);
    window.addEventListener('resize', syncHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncHeaderHeight);
    };
  }, []);

  const effectiveHeroSurface = heroSurfaceLocked ?? isHeroSurface;

  const logoClass = cn(
    'inline-flex shrink-0 items-center gap-2 rounded-full px-2 py-1.5 sm:px-2.5',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  );

  /** Solid bar only while the drawer is open; closed mobile matches md+ track styling. */
  const mobileTrackSolidClass = mobileNavOpen
    ? isDark
      ? 'max-md:!bg-black max-md:backdrop-blur-none'
      : effectiveHeroSurface
        ? 'max-md:!bg-primary max-md:backdrop-blur-none'
        : 'max-md:!bg-white max-md:backdrop-blur-none'
    : '';

  const navbarTrackShellClass = cn(
    'rounded-xl border md:rounded-2xl',
    mobileTrackSolidClass,
    navTheme.track,
  );

  const navbarTrackClassName = cn(navbarTrackShellClass, 'relative');

  return (
    <>
    <header
      ref={headerRef}
      className={cn(
        'z-50 mx-auto flex w-full justify-center font-body',
        isNavOverlay ? 'fixed top-0 left-0 right-0' : 'sticky top-0',
        'pt-1 pb-0.5 md:pt-1.5 md:pb-1',
      )}
    >
      <div
        className={cn(
          'relative mx-auto w-full min-w-0',
          landingPageContentMaxClass,
          landingPageGutterClass,
          landingPageGutterTailwindClass,
        )}
      >
        <div ref={trackRef} data-site-navbar-track className={navbarTrackClassName}>
          <div className="flex items-center justify-between gap-3 px-3 py-2 md:grid md:grid-cols-[1fr_auto_1fr]">
            <SiteBrandLogo
              className={cn(logoClass, 'relative z-10 md:justify-self-start')}
              showText="sm"
              textClassName={navTheme.brand}
              accentClassName={navTheme.brandAccent}
              priority
            />

            <nav
              className="hidden items-center gap-6 md:flex md:justify-self-center"
              aria-label="Primary"
            >
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.segment}
                  href={item.href}
                  label={item.label}
                  active={active === item.segment}
                  activeClass={navTheme.linkActive}
                  idleClass={navTheme.linkIdle}
                />
              ))}
            </nav>

            <div className="hidden items-center gap-2 md:flex md:justify-self-end">
              <button
                type="button"
                onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
                className={cn('inline-flex size-9 items-center justify-center rounded-full border transition-colors', navTheme.iconBtn)}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="size-4 text-accent" />
                ) : (
                  <Moon className="size-4" />
                )}
              </button>

              {/* Wallet connect — icon style on desktop */}
              <WalletConnectControl walletVariant={navTheme.walletVariant} />

              {showAuth ? (
                <>
                  <Link
                    href="/dashboard/notifications"
                    className={cn('relative inline-flex size-9 items-center justify-center rounded-full border transition-colors', navTheme.iconBtn)}
                    aria-label="Notifications"
                  >
                    <Bell className="size-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 transition-colors',
                        navTheme.userMenuBtn,
                      )}
                    >
                      <div className="flex size-8 items-center justify-center rounded-full gradient-gold text-xs font-bold text-white">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                      <span className={cn('max-w-20 truncate text-sm font-medium', navTheme.brand)}>
                        {user.first_name}
                      </span>
                      <ChevronDown
                        className={cn('size-4 transition-transform', navTheme.userMenuChevron, userMenuOpen && 'rotate-180')}
                      />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          className={cn(
                            'absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border',
                            navTheme.dropdown,
                          )}
                        >
                          <div className={cn('border-b p-3', navTheme.dropdownBorder)}>
                            <p className="text-sm font-semibold">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className={cn('text-xs', navTheme.dropdownMuted)}>{user.email}</p>
                            <Badge variant="gold" size="sm" className="mt-1">
                              {user.role}
                            </Badge>
                          </div>
                          <div className="p-1">
                            {[
                              { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                              { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
                              { href: '/dashboard/profile', icon: User, label: 'Profile' },
                            ].map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className={cn(
                                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                  navTheme.dropdownLink,
                                )}
                              >
                                <item.icon className="size-4 text-accent" />
                                {item.label}
                              </Link>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                dispatch(logoutUser());
                                setUserMenuOpen(false);
                              }}
                              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                            >
                              <LogOut className="size-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  {/* Sign In / Get Started hidden — wallet-only auth */}
                  <Button href="/auth/login" variant={navTheme.signInVariant} size="sm">
                    Sign In
                  </Button>
                  <Button href="/auth/register" variant="primary" size="sm">
                    Get Started
                  </Button>
                </>
              )}
            </div>

            <div className="relative z-10 flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => dispatch(setTheme(isDark ? 'light' : 'dark'))}
                className={cn('inline-flex size-9 items-center justify-center rounded-full border transition-colors', navTheme.iconBtn)}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="size-4 text-accent" /> : <Moon className="size-4" />}
              </button>
              <NavbarMobileMenuTrigger
                open={mobileNavOpen}
                onOpenChange={setMobileNavOpen}
                themeClasses={navTheme}
              />
            </div>
          </div>

          <NavbarMobileMenuDrawer
            open={mobileNavOpen}
            onOpenChange={setMobileNavOpen}
            items={NAV_ITEMS}
            activeSegment={active}
            themeClasses={navTheme}
            trackShellClassName={navbarTrackShellClass}
            trackRef={trackRef}
          >
      {showAuth &&
        accountNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileNavOpen(false)}
            className={cn(
              'block rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors',
              navTheme.mobileLink,
            )}
          >
            {link.label}
          </Link>
        ))}

      {showAuth && unreadCount > 0 && (
        <Link
          href="/dashboard/notifications"
          onClick={() => setMobileNavOpen(false)}
          className={cn(
            'block rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors',
            navTheme.mobileLink,
          )}
        >
          Notifications ({unreadCount > 9 ? '9+' : unreadCount})
        </Link>
      )}

      {showAuth ? (
        <>
          {/* Wallet in mobile drawer */}
          <WalletConnectControl fullWidth chipClassName={cn('border', navTheme.chip)} walletVariant={navTheme.walletVariant} />
          <Button
            variant={navTheme.signInVariant}
            size="md"
            className="w-full"
            onClick={() => {
              dispatch(logoutUser());
              setMobileNavOpen(false);
            }}
          >
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <Button href="/auth/login" variant={navTheme.signInVariant} size="md" className="w-full">
            Sign In
          </Button>
          <Button href="/auth/register" variant="primary" size="md" className="w-full">
            Get Started
          </Button>
        </>
      )}
          </NavbarMobileMenuDrawer>
        </div>
      </div>
    </header>
    </>
  );
}
