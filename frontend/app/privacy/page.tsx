import type { Metadata } from 'next';

import { LegalDocumentContent } from '@/components/legal/LegalDocumentContent';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { privacyCopy } from '@/lib/constants/legal';

export const metadata: Metadata = {
  title: privacyCopy.metaTitle,
  description: privacyCopy.sections[0]?.body,
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-background">
        <LegalDocumentContent
          title={privacyCopy.title}
          updated={privacyCopy.updated}
          sections={privacyCopy.sections}
        />
      </main>
      <Footer />
    </>
  );
}
