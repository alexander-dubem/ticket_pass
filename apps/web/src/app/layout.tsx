import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { WalletProvider } from '../context/WalletContext';
import '../styles/globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Ticket Pass - Decentralized Stellar Ticketing',
  description: 'High-throughput anti-scalping ticket drops powered by Stellar and Soroban.',
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
