'use client';

import { motion } from 'framer-motion';

import { Button } from '@/components/ui/Button';
import { ctaContent } from '@/lib/constants/landing';
import {
  landingPageContentMaxClass,
  landingPageCtaShellClass,
  landingPageInsetMutedClass,
  landingPageInsetTitleClass,
  landingPageInsetWrapClass,
  landingSectionDividerClass,
  landingSectionPadYClass,
} from '@/lib/landing-page-layout';
import { typeH1, typeLead } from '@/lib/site-typography';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function CtaSection() {
  return (
    <section
      className={cn(
        landingPageInsetWrapClass,
        landingSectionDividerClass,
        landingSectionPadYClass,
      )}
    >
      <div
        className={cn(
          landingPageContentMaxClass,
          landingPageCtaShellClass,
          'relative overflow-hidden text-center',
        )}
      >
        <div className="relative mx-auto w-full min-w-0 max-w-xl sm:max-w-2xl lg:max-w-full">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className={cn('mb-4', typeH1, landingPageInsetTitleClass)}
          >
            {ctaContent.title}
            <br />
            <span className="text-accent">{ctaContent.titleAccent}</span>
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.05 }}
            className={cn('mx-auto mb-8 max-w-xl', typeLead, landingPageInsetMutedClass)}
          >
            {ctaContent.subtitle}
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <Button variant="primary" size="lg" href={ctaContent.primaryCta.href}>
              {ctaContent.primaryCta.label}
            </Button>
            <Button variant="onDarkOutline" size="lg" href={ctaContent.secondaryCta.href}>
              {ctaContent.secondaryCta.label}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
