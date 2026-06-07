import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AtSign,
  Camera,
  Code,
  Mail,
  Phone,
  Users,
  type LucideIcon,
} from 'lucide-react';

import {
  footerContactItems,
  footerCopyrightHolder,
  footerLegalLinks,
  footerLinkSections,
  footerSocialLinks,
  footerTagline,
  type FooterContactIcon,
  type FooterLink,
  type FooterLinkSection,
  type FooterSocialIcon,
} from '@/lib/constants/footer';
import {
  landingPageCardShellClass,
  landingPageContentMaxClass,
  landingPageInsetDividerClass,
  landingPageInsetHeadingClass,
  landingPageInsetInteractiveBorderClass,
  landingPageInsetMutedClass,
  landingPageInsetSubtleClass,
  landingPageInsetTitleClass,
  landingPageInsetWrapClass,
} from '@/lib/landing-page-layout';
import { SITE_BRAND_NAME, SITE_NAV_LOGO_SRC } from '@/lib/site-brand';
import { typeH3 } from '@/lib/site-typography';
import { cn } from '@/lib/utils';

const contactIconMap: Record<FooterContactIcon, LucideIcon> = {
  mail: Mail,
  phone: Phone,
};

const socialIconMap: Record<FooterSocialIcon, LucideIcon> = {
  users: Users,
  'at-sign': AtSign,
  code: Code,
  camera: Camera,
};

const footerLinkClass = cn(
  'font-body text-sm transition-colors hover:text-accent',
  landingPageInsetSubtleClass,
);

const footerHeadingClass = cn('font-body text-sm font-semibold', landingPageInsetHeadingClass);

function BrandMark() {
  const [brandLead, brandAccent] = SITE_BRAND_NAME.split(' Real ');

  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <Image
        src={SITE_NAV_LOGO_SRC}
        alt={SITE_BRAND_NAME}
        width={40}
        height={40}
        className="size-10 rounded-full object-cover"
      />
      <span className={cn(typeH3, 'font-bold', landingPageInsetTitleClass)}>
        {brandLead}
        {brandAccent ? (
          <>
            {' Real '}
            <span className="text-accent">{brandAccent}</span>
          </>
        ) : null}
      </span>
    </Link>
  );
}

function FooterContactList() {
  return (
    <ul className="mt-5 space-y-2.5">
      {footerContactItems.map((item) => {
        const Icon = contactIconMap[item.icon];
        const content = (
          <>
            <Icon className="size-4 shrink-0 text-accent" aria-hidden />
            <span>{item.label}</span>
          </>
        );

        return (
          <li key={item.label}>
            {item.href ? (
              <a href={item.href} className={cn('inline-flex items-center gap-2.5', footerLinkClass)}>
                {content}
              </a>
            ) : (
              <span className={cn('inline-flex items-center gap-2.5', footerLinkClass)}>{content}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function FooterSocialLinks() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {footerSocialLinks.map((social) => {
        const Icon = socialIconMap[social.icon];

        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-full border transition-colors hover:border-accent/50 hover:text-accent',
              landingPageInsetInteractiveBorderClass,
              landingPageInsetSubtleClass,
            )}
          >
            <Icon className="size-4" aria-hidden />
          </a>
        );
      })}
    </div>
  );
}

function FooterLinkColumn({ title, links }: FooterLinkSection) {
  return (
    <div>
      <h3 className={footerHeadingClass}>{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link: FooterLink) => (
          <li key={link.label}>
            <Link href={link.href} className={footerLinkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={cn(landingPageInsetWrapClass, 'pb-6 md:pb-8')}>
      <div className={cn(landingPageContentMaxClass, landingPageCardShellClass)}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] lg:gap-16">
          <div className="max-w-sm">
            <BrandMark />
            <p className={cn('mt-4 font-body text-sm leading-relaxed', landingPageInsetMutedClass)}>{footerTagline}</p>
            <FooterContactList />
            <FooterSocialLinks />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 sm:gap-6">
            {footerLinkSections.map((section) => (
              <FooterLinkColumn key={section.title} {...section} />
            ))}
          </div>
        </div>

        <div className={cn('mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between', landingPageInsetDividerClass)}>
          <p className={cn('font-body text-xs', landingPageInsetSubtleClass)}>
            © {year} {footerCopyrightHolder}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-5">
            {footerLegalLinks.map((link) => (
              <Link key={link.label} href={link.href} className={cn('font-body text-xs transition-colors hover:text-accent', landingPageInsetSubtleClass)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
