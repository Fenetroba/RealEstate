'use client';

import { AboutBenefitVisual } from '@/components/about/AboutBenefitVisual';
import { Button } from '@/components/ui/Button';
import { aboutCopy } from '@/lib/constants/about';
import {
  aboutBenefitDividerClass,
  aboutBenefitNumberClass,
  aboutBenefitRowClass,
  aboutBenefitRowPadding,
  aboutBenefitsHeadingSpacing,
  aboutBodyTextClass,
  aboutCardTitleClass,
  aboutCtaSectionClass,
  aboutHeaderLeadSpacing,
  aboutHeaderTitleSpacing,
  aboutPageLeadClass,
  aboutPageLeadHighlightClass,
  aboutPageContentTopClass,
  aboutPageShellClass,
  aboutPageTitleClass,
  aboutSectionTitleClass,
} from '@/lib/constants/about-page-styles';
import { cn } from '@/lib/utils';

export function AboutContent() {
  const copy = aboutCopy;

  return (
    <div className={cn(aboutPageShellClass, aboutPageContentTopClass)}>
      <div className={aboutHeaderTitleSpacing}>
        <h1 className={aboutPageTitleClass}>{copy.title}</h1>
      </div>

      <p className={cn(aboutPageLeadClass, aboutHeaderLeadSpacing)}>
        {copy.leadSegments.map((segment, index) =>
          segment.highlight ? (
            <span key={index} className={aboutPageLeadHighlightClass}>
              {segment.text}
            </span>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </p>

      <h2 className={cn(aboutSectionTitleClass, aboutBenefitsHeadingSpacing)}>
        {copy.benefitsTitle}
      </h2>

      <div className="space-y-0">
        {copy.benefits.map((benefit, index) => (
          <div key={benefit.number}>
            <div
              className={cn(
                aboutBenefitRowClass,
                benefit.imagePosition === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row',
              )}
            >
              <div className={aboutBenefitRowPadding}>
                <div className="flex items-start gap-4">
                  <span className={aboutBenefitNumberClass}>{benefit.number}.</span>
                  <div className="min-w-0 flex-1">
                    <h3 className={cn(aboutCardTitleClass, 'mb-4')}>{benefit.title}</h3>
                    <p className={aboutBodyTextClass}>{benefit.description}</p>
                  </div>
                </div>
              </div>

              <div className={aboutBenefitRowPadding}>
                <AboutBenefitVisual
                  icon={benefit.icon}
                  label={benefit.visualLabel}
                  href={benefit.href}
                  hrefLabel={benefit.hrefLabel}
                />
              </div>
            </div>

            {index < copy.benefits.length - 1 ? (
              <div className={aboutBenefitDividerClass} aria-hidden />
            ) : null}
          </div>
        ))}
      </div>

      <section className={aboutCtaSectionClass}>
        <h2 className={cn(aboutSectionTitleClass, 'mb-6')}>{copy.cta.title}</h2>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Button variant="primary" size="lg" href={copy.cta.primary.href}>
            {copy.cta.primary.label}
          </Button>
          <Button variant="outline" size="lg" href={copy.cta.secondary.href}>
            {copy.cta.secondary.label}
          </Button>
        </div>
      </section>
    </div>
  );
}
