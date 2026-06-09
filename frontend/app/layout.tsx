import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/providers/AppProviders';
import ThemeProvider from '@/components/providers/ThemeProvider';
import { ToastContainer } from '@/components/ui/Toast';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'EDENET RealEstate',
    template: '%s | Edenet',
  },
  description:
    'Blockchain-verified real estate listings. Register properties, list for sale or rent, and transact on-chain with full transparency.',
  keywords: [
    'real estate', 'blockchain', 'NFT', 'property registry', 'verified listings',
    'Polygon', 'smart contracts', 'DAO', 'AI risk scoring',
  ],
  authors: [{ name: 'Edenet' }],
  creator: 'Edenet',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://edenet.io',
    siteName: 'Edenet',
    title: 'Edenet — Blockchain Real Estate Marketplace',
    description: 'Buy, sell, and invest in properties with blockchain verification and AI insights.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edenet — Blockchain Real Estate Marketplace',
    description: 'Buy, sell, and invest in properties with blockchain verification and AI insights.',
    creator: '@edenet',
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('edenet-theme');if(t==='dark')document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppProviders>
          <ThemeProvider>
            {children}
            <ToastContainer />
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
