import type { Metadata } from 'next';

import { AboutContent } from '@/components/about/AboutContent';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { aboutCopy, aboutLeadPlainText } from '@/lib/constants/about';

export const metadata: Metadata = {
  title: aboutCopy.metaTitle,
  description: aboutLeadPlainText(),
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-background">
        <AboutContent />
      </main>
      <Footer />
    </>
  );
}
