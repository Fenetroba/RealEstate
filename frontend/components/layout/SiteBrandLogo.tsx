import Image from 'next/image';
import Link from 'next/link';

import { SITE_BRAND_NAME, SITE_NAV_LOGO_SRC } from '@/lib/site-brand';
import { cn } from '@/lib/utils';

type SiteBrandLogoProps = {
  href?: string;
  className?: string;
  imageClassName?: string;
  showText?: boolean | 'sm';
  textClassName?: string;
  accentClassName?: string;
  priority?: boolean;
};

export function SiteBrandLogo({
  href = '/',
  className,
  imageClassName = 'size-9 rounded-full object-cover sm:size-10',
  showText = false,
  textClassName,
  accentClassName = 'text-accent',
  priority = false,
}: SiteBrandLogoProps) {
  const content = (
    <>
      <Image
        src={SITE_NAV_LOGO_SRC}
        alt={SITE_BRAND_NAME}
        width={40}
        height={40}
        className={imageClassName}
        priority={priority}
      />
      {showText === 'sm' ? (
        <span className={cn('hidden text-sm font-bold tracking-tight sm:inline', textClassName)}>
          EDENET<span className={accentClassName}> Real Estate</span>
        </span>
      ) : showText ? (
        <span className={cn('font-bold tracking-tight', textClassName)}>
          EDENET<span className={accentClassName}> Real Estate</span>
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn('inline-flex shrink-0 items-center gap-2', className)}
        aria-label={`${SITE_BRAND_NAME} | go to home`}
      >
        {content}
      </Link>
    );
  }

  return <div className={cn('inline-flex shrink-0 items-center gap-2', className)}>{content}</div>;
}
