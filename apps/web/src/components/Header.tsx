'use client';
import React from 'react';
import Link from 'next/link';
import { useWallet } from '../context/WalletContext';
import { Button } from './ui/button';
import { Wallet, LogOut, Disc, LayoutDashboard } from 'lucide-react';

export const Header: React.FC = () => {
  const { address, disconnect } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <Disc className="w-6 h-6 text-brand animate-spin-slow" />
          <span>TICKET<span className="text-brand font-extrabold">PASS</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-white transition-colors">Drops</Link>
          <Link href="/wallet" className="hover:text-white transition-colors">My Wallet</Link>
          <Link href="/verify" className="hover:text-white transition-colors">Gate Validator</Link>
        </nav>

        <div className="flex items-center gap-4">
          {address ? (
            <div className="flex items-center gap-2">
              {/* Dashboard — icon only on mobile, icon+label on sm+ */}
              <Link
                href="/dashboard/overview"
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1.5 rounded-lg transition-all"
                title="Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-brand shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Wallet address chip — sm+ only */}
              <span className="hidden sm:inline text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md">
                {truncateAddress(address)}
              </span>

              {/* Disconnect — icon only on mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="h-9 gap-1 text-red-400 border-red-500/20 hover:bg-red-500/10 px-2.5"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Link href="/auth">
              <Button
                variant="glow"
                size="sm"
                className="h-9 gap-2 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
