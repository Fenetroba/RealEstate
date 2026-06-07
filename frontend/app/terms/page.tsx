import type { Metadata } from 'next';

import { LegalDocumentContent } from '@/components/legal/LegalDocumentContent';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { termsCopy } from '@/lib/constants/legal';

export const metadata: Metadata = {
  title: termsCopy.metaTitle,
  description: termsCopy.sections[0]?.body,
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-background">
        <LegalDocumentContent
          title={termsCopy.title}
          updated={termsCopy.updated}
          sections={termsCopy.sections}
        />
      </main>
      <Footer />
    </>
  );
}
