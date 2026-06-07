'use client';

import Image from 'next/image';

import { HeroCtaPanel } from '@/components/home/HeroCtaPanel';
import { HeroPlatformStats } from '@/components/home/PlatformStatsBand';
import { heroContent } from '@/lib/constants/landing';
import {
  landingHeroPadBottomClass,
  landingPageGutterClass,
  landingPageGutterTailwindClass,
  landingSectionInnerClass,
} from '@/lib/landing-page-layout';
import { appPanelRadiusClass, appProseMaxClass, typeDisplay, typeLead } from '@/lib/responsive';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  const hero = heroContent;

  return (
    <section
      className={cn(
        'bg-background',
        landingPageGutterClass,
        landingPageGutterTailwindClass,
        landingHeroPadBottomClass,
        'pt-[calc(var(--site-nav-header-height,4.5rem)+0.5rem)] sm:pt-[calc(var(--site-nav-header-height,5rem)+0.75rem)]',
      )}
    >
      <div className={landingSectionInnerClass}>
        <div
          className={cn(
            'relative overflow-hidden',
            appPanelRadiusClass,
            'min-h-[min(680px,calc(100svh-var(--site-nav-header-height)-2rem))]',
            'lg:min-h-[min(760px,calc(100svh-var(--site-nav-header-height)-2.5rem))]',
            'border border-border/60 dark:border-white/10',
          )}
          data-nav-surface="dark"
        >
          <Image
            src={hero.imageSrc}
            alt={hero.imageAlt}
            fill
            priority
            unoptimized
            className="object-cover object-[78%_center]"
            sizes="100vw"
          />

          <div
            className={cn(
              'absolute inset-0 bg-linear-to-t',
              'from-primary/85 via-primary/25 to-primary/5',
              'dark:from-black/85 dark:via-black/35 dark:to-black/10',
            )}
            aria-hidden
          />
          <div
            className={cn(
              'absolute inset-0 bg-linear-to-r',
              'from-primary/80 via-primary/35 to-transparent',
              'sm:from-primary/75 sm:via-primary/25',
              'dark:from-black/75 dark:via-black/30',
            )}
            aria-hidden
          />

          <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-4 sm:p-5 md:p-6 lg:px-6 lg:py-8 xl:px-7 xl:py-9 2xl:px-7 2xl:py-10 3xl:px-8 4xl:px-8">
            <div className={appProseMaxClass}>
              <h1 className={cn(typeDisplay, 'text-white')}>
                <span className="block">{hero.headlineLine1}</span>
                <span className="block text-gradient-gold">{hero.headlineLine2}</span>
              </h1>
              <p className={cn(typeLead, 'mt-3 text-white/70 sm:mt-4 md:mt-5')}>
                {hero.subtitle}
              </p>
              <HeroCtaPanel className="mt-6 sm:mt-8" />
            </div>
          </div>
        </div>

        <HeroPlatformStats />
      </div>
    </section>
  );
}
