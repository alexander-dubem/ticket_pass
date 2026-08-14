import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { WalletProvider } from '../context/WalletContext';
import '../styles/globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Ticket Pass — Celebrate On-Chain',
  description: 'Modern decentralized ticketing for festivals, weddings and celebrations. Anti-scalp ticket drops powered by Stellar and Soroban.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
