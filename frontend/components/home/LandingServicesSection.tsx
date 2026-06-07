'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import { useId, useState } from 'react';

import {
  landingServicesContent,
  type LandingServiceItem,
} from '@/lib/constants/landing-services';
import {
  landingServicesItemBodyClass,
  landingServicesItemPanelClass,
  landingServicesItemTitleClass,
  landingServicesItemTriggerClass,
  landingServicesToggleIconClass,
} from '@/lib/constants/landing-services-styles';
import { LandingSectionHeader } from '@/components/home/LandingSectionHeader';
import {
  landingMainInnerClass,
  landingSectionClass,
} from '@/lib/landing-page-layout';
import { appPanelRadiusClass } from '@/lib/responsive';
import { cn } from '@/lib/utils';

export default function LandingServicesSection() {
  const copy = landingServicesContent;
  const [openId, setOpenId] = useState<string>(copy.items[0]?.id ?? '');
  const handleToggle = (id: string) => {
    setOpenId((current) => (current === id ? '' : id));
  };

  return (
    <section className={landingSectionClass}>
      <div className={landingMainInnerClass}>
        <LandingSectionHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          className="max-w-2xl"
        />

        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
          <ul className="flex flex-col gap-3 sm:gap-4">
            {copy.items.map((item) => (
              <ServiceAccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </ul>

          <div
            className={cn(
              'min-h-[16rem] overflow-hidden sm:min-h-[20rem] lg:min-h-[28rem] lg:sticky lg:top-24',
              appPanelRadiusClass,
            )}
          >
            {/* Inner wrapper must be relative for Next.js Image fill */}
            <div className="relative size-full min-h-[16rem] sm:min-h-[20rem] lg:min-h-[28rem]">
              <Image
                src={copy.imageSrc}
                alt={copy.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: LandingServiceItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const triggerId = useId();

  return (
    <li
      className={cn(
        appPanelRadiusClass,
        'list-none border border-border bg-surface',
      )}
    >
      <button
        type="button"
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={landingServicesItemTriggerClass}
      >
        <span className={landingServicesItemTitleClass}>{item.title}</span>
        <span className={landingServicesToggleIconClass} aria-hidden>
          {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
        </span>
      </button>

      {isOpen ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className={landingServicesItemPanelClass}
        >
          <p className={cn(landingServicesItemBodyClass, 'pt-3')}>{item.description}</p>
          {item.href ? (
            <Link
              href={item.href}
              className="mt-4 inline-block text-sm font-semibold text-accent transition-opacity hover:opacity-80"
            >
              Learn more
            </Link>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
