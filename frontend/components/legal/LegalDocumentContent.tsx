import Link from 'next/link';

import { sitePageLeadClass, sitePageTitleClass } from '@/lib/site-typography';
import { appGutterClass, appShellYClass, pageGutterTailwindClass } from '@/lib/responsive';
import { cn } from '@/lib/utils';

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDocumentContentProps {
  title: string;
  updated: string;
  sections: LegalSection[];
}

export function LegalDocumentContent({ title, updated, sections }: LegalDocumentContentProps) {
  return (
    <article
      className={cn(
        'mx-auto w-full max-w-3xl',
        appGutterClass,
        pageGutterTailwindClass,
        appShellYClass,
      )}
    >
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Legal
      </p>
      <h1 className={sitePageTitleClass}>{title}</h1>
      <p className={cn(sitePageLeadClass, 'mt-2')}>Last updated: {updated}</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        <Link href="/contact" className="text-accent hover:underline">
          Contact us
        </Link>{' '}
        if you have questions about these policies.
      </p>
    </article>
  );
}
