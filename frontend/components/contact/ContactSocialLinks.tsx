'use client';

import { AtSign, Camera, Code, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { contactSocialLinks } from '@/lib/constants/contact';
import type { FooterSocialIcon } from '@/lib/constants/footer';
import { cn } from '@/lib/utils';

const iconMap: Record<FooterSocialIcon, LucideIcon> = {
  users: Users,
  'at-sign': AtSign,
  code: Code,
  camera: Camera,
};

interface ContactSocialLinksProps {
  className?: string;
}

export function ContactSocialLinks({ className }: ContactSocialLinksProps) {
  return (
    <div className={cn('flex flex-wrap gap-4 xl:gap-6 2xl:gap-8', className)}>
      {contactSocialLinks.map((link) => {
        const Icon = iconMap[link.icon];
        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={cn(
              'inline-flex size-11 items-center justify-center rounded-full border border-border bg-card',
              'text-muted transition-colors hover:border-accent/40 hover:text-accent',
              'xl:size-12 2xl:size-14',
            )}
          >
            <Icon className="size-5 xl:size-5 2xl:size-6" aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
