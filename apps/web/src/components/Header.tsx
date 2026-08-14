'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '../context/WalletContext';
import { Button } from './ui/button';
import { Wallet, LogOut, Disc, LayoutDashboard } from 'lucide-react';
import { cn } from '../utils/cn';

const NAV_LINKS = [
  { href: '/', label: 'Drops' },
  { href: '/wallet', label: 'My Wallet' },
  { href: '/verify', label: 'Gate Validator' },
];

export const Header: React.FC = () => {
  const { address, disconnect } = useWallet();
  const pathname = usePathname();

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent" />
      <div className="container relative mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-white group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 glow-brand">
            <Disc className="w-5 h-5 text-white animate-spin-slow" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-extrabold tracking-tight">
              TICKET<span className="text-gradient">PASS</span>
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Stellar Drops
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full border border-white/8 bg-white/[0.04] backdrop-blur">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-white bg-gradient-to-r from-pink-500/20 via-fuchsia-500/20 to-violet-500/20 shadow-inner'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {address ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/overview"
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 hover:border-fuchsia-400/40 px-2.5 py-1.5 rounded-lg transition-all"
                title="Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono bg-white/[0.05] border border-white/10 text-zinc-300 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {truncateAddress(address)}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="h-9 gap-1 text-red-300 border-red-500/25 hover:bg-red-500/10 px-2.5"
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
