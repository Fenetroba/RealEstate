'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export type NavSurface = 'dark' | 'light';

function getNavHeaderHeight(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--site-nav-header-height');
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 72;
}

export function useNavSurfaceScroll(): NavSurface {
  const pathname = usePathname();
  const [surface, setSurface] = useState<NavSurface>('dark');

  useEffect(() => {
    const update = () => {
      const darkSurface = document.querySelector('[data-nav-surface="dark"]');

      if (darkSurface) {
        const rect = darkSurface.getBoundingClientRect();
        if (rect.bottom > getNavHeaderHeight() + 12) {
          setSurface('dark');
          return;
        }
      }

      setSurface('light');
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  return surface;
}
