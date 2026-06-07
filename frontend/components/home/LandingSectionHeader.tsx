import { landingSectionHeaderMbClass } from '@/lib/landing-page-layout';
import {
  siteEyebrowBarClass,
  siteEyebrowRowClass,
  siteSectionEyebrowClass,
  siteSectionLeadClass,
  siteSectionTitleClass,
} from '@/lib/site-typography';
import { cn } from '@/lib/utils';

type LandingSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  titleClassName?: string;
};

/** Shared eyebrow + title block for every landing section. */
export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  className,
  titleClassName,
}: LandingSectionHeaderProps) {
  return (
    <header className={cn(landingSectionHeaderMbClass, className)}>
      <div className={siteEyebrowRowClass}>
        <div className={siteEyebrowBarClass} aria-hidden />
        <span className={siteSectionEyebrowClass}>{eyebrow}</span>
      </div>
      <h2 className={cn(siteSectionTitleClass, titleClassName)}>{title}</h2>
      {description ? <p className={siteSectionLeadClass}>{description}</p> : null}
    </header>
  );
}
