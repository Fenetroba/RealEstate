'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

import type { MainNavLink, NavSegment } from '@/lib/constants/navigation';
import type { NavbarThemeClasses } from '@/lib/nav-theme';
import { cn } from '@/lib/utils';

interface NavbarMobileMenuTriggerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeClasses: NavbarThemeClasses;
}

export function NavbarMobileMenuTrigger({
  open,
  onOpenChange,
  themeClasses,
}: NavbarMobileMenuTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => onOpenChange(!open)}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-full border transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        themeClasses.iconBtn,
      )}
      aria-expanded={open}
      aria-label={open ? 'Close menu' : 'Open menu'}
    >
      {open ? <X className="size-4 shrink-0" /> : <Menu className="size-4 shrink-0" />}
    </button>
  );
}

interface NavbarMobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: MainNavLink[];
  activeSegment: NavSegment;
  themeClasses: NavbarThemeClasses;
  trackShellClassName: string;
  trackRef: React.RefObject<HTMLElement | null>;
  children?: React.ReactNode;
}

function useTrackOverlayTop(trackRef: React.RefObject<HTMLElement | null>, open: boolean) {
  const [topPx, setTopPx] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!open) return;

    const sync = () => {
      const el = trackRef.current;
      if (!el) return;
      setTopPx(el.getBoundingClientRect().bottom);
    };

    sync();
    const observer = new ResizeObserver(sync);
    if (trackRef.current) observer.observe(trackRef.current);
    window.addEventListener('resize', sync);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, [open, trackRef]);

  return topPx;
}

/** Panel below the navbar track; overlay portaled to body to avoid layout flicker. */
export function NavbarMobileMenuDrawer({
  open,
  onOpenChange,
  items,
  activeSegment,
  themeClasses,
  trackShellClassName,
  trackRef,
  children,
}: NavbarMobileMenuDrawerProps) {
  const [mounted, setMounted] = React.useState(false);
  const overlayTop = useTrackOverlayTop(trackRef, open);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const overlay = (
    <button
      type="button"
      className={cn('fixed inset-x-0 bottom-0 z-[45] md:hidden', themeClasses.mobileOverlay)}
      style={{ top: overlayTop }}
      aria-label="Close menu"
      onClick={() => onOpenChange(false)}
    />
  );

  return (
    <>
      {createPortal(overlay, document.body)}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={cn(
          'absolute left-0 right-0 top-full z-[60] mt-2 overflow-y-auto overscroll-contain md:hidden',
          'max-h-[min(28rem,calc(100dvh-6rem))]',
          trackShellClassName,
        )}
      >
        <div className="px-3 py-3">
          <nav className="space-y-0.5" aria-label="Mobile primary">
            {items.map((item) => {
              const active = activeSegment === item.segment;
              return (
                <Link
                  key={item.segment}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'block border-b-2 px-2 py-2.5 text-sm font-medium transition-colors',
                    active ? themeClasses.mobileLinkActive : themeClasses.mobileLink,
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {children ? (
            <div className={cn('mt-3 space-y-2 border-t pt-3', themeClasses.mobileDivider)}>
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
