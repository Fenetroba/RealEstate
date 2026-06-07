'use client';

import Image from 'next/image';
import Link from 'next/link';

import { whyEdenetBentoContent, type WhyEdenetBentoCard } from '@/lib/constants/landing-why-edenet';
import {
  landingBentoAccentBgClass,
  landingBentoImageOverlayClass,
  landingBentoSplitImageOverlayClass,
  landingMainInnerClass,
  landingPageInsetMutedClass,
  landingPageInsetTitleClass,
  landingSectionClass,
  landingSectionGridGapClass,
} from '@/lib/landing-page-layout';
import { appPanelRadiusClass } from '@/lib/responsive';
import { LandingSectionHeader } from '@/components/home/LandingSectionHeader';
import { typeH3 } from '@/lib/site-typography';
import { cn } from '@/lib/utils';

const bentoCardRadius = cn(appPanelRadiusClass, 'overflow-hidden');

export default function WhyEdenetSection() {
  const copy = whyEdenetBentoContent;
  const [listings, review, hybrid, verify] = copy.cards;

  return (
    <section className={landingSectionClass}>
      <div className={landingMainInnerClass}>
        <LandingSectionHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          className="max-w-2xl"
        />

        <div
          className={cn(
            'grid w-full min-w-0',
            landingSectionGridGapClass,
            'md:grid-cols-12 md:auto-rows-[minmax(13rem,auto)]',
          )}
        >
          <BentoCard
            card={listings}
            className="md:col-span-7 md:min-h-[18rem] lg:min-h-[20rem]"
          />
          <BentoCard
            card={review}
            className="md:col-span-5 md:min-h-[18rem] lg:min-h-[20rem]"
          />
          <BentoCard
            card={hybrid}
            className="md:col-span-5 md:min-h-[16rem] lg:min-h-[18rem]"
          />
          <BentoCard
            card={verify}
            className="md:col-span-7 md:min-h-[16rem] lg:min-h-[18rem]"
          />
        </div>
      </div>
    </section>
  );
}

function BentoCard({ card, className }: { card: WhyEdenetBentoCard; className?: string }) {
  const inner = (() => {
    switch (card.tone) {
      case 'image':
        return <BentoImageCard card={card} />;
      case 'surface':
        return <BentoSolidCard card={card} variant="surface" />;
      case 'primary':
        return <BentoSolidCard card={card} variant="primary" />;
      case 'primary-media':
        return <BentoSplitCard card={card} />;
      default:
        return null;
    }
  })();

  const shell = cn(bentoCardRadius, 'flex h-full min-h-[14rem] flex-col', className);

  if (card.href) {
    return (
      <Link href={card.href} className={cn(shell, 'transition-opacity hover:opacity-95')}>
        {inner}
      </Link>
    );
  }

  return <article className={shell}>{inner}</article>;
}

function BentoCardCopy({
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
}: {
  title: string;
  description: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <div className={cn('mt-auto', className)}>
      <h3
        className={cn(typeH3, titleClassName)}
      >
        {title}
      </h3>
      <p className={cn('mt-2 max-w-md font-body text-[0.9375rem] leading-relaxed sm:text-[1rem]', descriptionClassName)}>
        {description}
      </p>
    </div>
  );
}

function BentoImageCard({ card }: { card: WhyEdenetBentoCard }) {
  if (!card.imageSrc) return null;

  return (
    <div className="relative flex min-h-[inherit] flex-1 flex-col">
      <Image
        src={card.imageSrc}
        alt={card.imageAlt ?? ''}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 55vw"
      />
      <div className={cn('absolute inset-0', landingBentoImageOverlayClass)} aria-hidden />
      <div className="relative flex min-h-[inherit] flex-1 flex-col justify-end p-6 sm:p-7 lg:p-8">
        <BentoCardCopy
          title={card.title}
          description={card.description}
          titleClassName={landingPageInsetTitleClass}
          descriptionClassName={landingPageInsetMutedClass}
        />
      </div>
    </div>
  );
}

function BentoSolidCard({
  card,
  variant,
}: {
  card: WhyEdenetBentoCard;
  variant: 'surface' | 'primary';
}) {
  const isPrimary = variant === 'primary';

  return (
    <div
      className={cn(
        'flex min-h-[inherit] flex-1 flex-col p-6 sm:p-7 lg:p-8',
        isPrimary
          ? landingBentoAccentBgClass
          : 'border border-border bg-surface shadow-sm dark:bg-card dark:shadow-none',
      )}
    >
      <BentoCardCopy
        title={card.title}
        description={card.description}
        titleClassName={isPrimary ? landingPageInsetTitleClass : 'text-foreground'}
        descriptionClassName={isPrimary ? landingPageInsetMutedClass : 'text-muted'}
      />
    </div>
  );
}

function BentoSplitCard({ card }: { card: WhyEdenetBentoCard }) {
  if (!card.imageSrc) return null;

  return (
    <div
      className={cn(
        'grid min-h-[inherit] flex-1 grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,42%)]',
        landingBentoAccentBgClass,
      )}
    >
      <div className="flex flex-col justify-end p-6 sm:p-7 lg:p-8">
        <BentoCardCopy
          title={card.title}
          description={card.description}
          titleClassName={landingPageInsetTitleClass}
          descriptionClassName={landingPageInsetMutedClass}
        />
      </div>
      <div className="relative min-h-[12rem] sm:min-h-0">
        <Image
          src={card.imageSrc}
          alt={card.imageAlt ?? ''}
          fill
          className="object-cover object-[center_20%]"
          sizes="(max-width: 640px) 100vw, 28vw"
        />
        <div className={cn('absolute inset-0', landingBentoSplitImageOverlayClass)} aria-hidden />
      </div>
    </div>
  );
}
