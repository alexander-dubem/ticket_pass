'use client';
import React from 'react';
import Link from 'next/link';
import { useWallet } from '../context/WalletContext';
import { Button } from './ui/button';
import { Wallet, LogOut, Disc } from 'lucide-react';

export const Header: React.FC = () => {
  const { address, connect, disconnect, isConnecting } = useWallet();

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
              <span className="hidden sm:inline text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-md">
                {truncateAddress(address)}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnect}
                className="h-9 gap-1 text-red-400 border-red-500/20 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="glow"
              size="sm"
              onClick={connect}
              disabled={isConnecting}
              className="h-9 gap-2"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
