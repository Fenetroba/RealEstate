'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  Building2,
  Compass,
  FilePlus,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import type { AboutBenefitIcon } from '@/lib/constants/about';
import {
  aboutVisualIconWrapClass,
  aboutVisualLabelClass,
  aboutVisualPanelClass,
} from '@/lib/constants/about-page-styles';
import { cn } from '@/lib/utils';

const iconMap: Record<AboutBenefitIcon, LucideIcon> = {
  compass: Compass,
  'file-plus': FilePlus,
  'shield-check': ShieldCheck,
  building: Building2,
  'badge-check': BadgeCheck,
};

interface AboutBenefitVisualProps {
  icon: AboutBenefitIcon;
  label: string;
  href: string;
  hrefLabel: string;
}

export function AboutBenefitVisual({ icon, label, href, hrefLabel }: AboutBenefitVisualProps) {
  const Icon = iconMap[icon];

  return (
    <div className={aboutVisualPanelClass}>
      <div className={aboutVisualIconWrapClass}>
        <Icon className="size-8 sm:size-9 xl:size-10" aria-hidden />
      </div>
      <p className={aboutVisualLabelClass}>{label}</p>
      <Link
        href={href}
        className={cn(
          'text-sm font-semibold text-accent transition-colors hover:underline',
          'xl:text-base',
        )}
      >
        {hrefLabel}
      </Link>
    </div>
  );
}
