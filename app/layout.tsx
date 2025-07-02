import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Web3Provider } from '@/components/Web3Provider';
import { Header } from '@/components/Header';
import { NetworkChecker } from '@/components/NetworkChecker';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Moscow NFTs',
  description: 'A decentralized Moscow NFTs built on Polygon with DIP token payments',
  keywords: ['NFT', 'marketplace', 'polygon', 'web3', 'crypto'],
  authors: [{ name: 'Moscow Team' }],
  openGraph: {
    title: 'Moscow NFTs',
    description: 'Discover, collect, and sell extraordinary NFTs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moscow NFTs',
    description: 'Discover, collect, and sell extraordinary NFTs',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Web3Provider>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
            <Header />
            <NetworkChecker />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster 
              position="top-right" 
              richColors 
              closeButton
              duration={4000}
            />
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}