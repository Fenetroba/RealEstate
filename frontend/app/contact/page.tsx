import type { Metadata } from 'next';

import { ContactContent } from '@/components/contact/ContactContent';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { contactCopy } from '@/lib/constants/contact';

export const metadata: Metadata = {
  title: contactCopy.metaTitle,
  description: contactCopy.lead,
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen w-full bg-background">
        <ContactContent />
      </main>
      <Footer />
    </>
  );
}
