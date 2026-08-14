import React from "react";
import { Disc } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/8 bg-white/[0.02]">
      <div className="container mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500">
              <Disc className="w-5 h-5 text-white animate-spin-slow" />
            </span>
            <span className="font-extrabold text-base tracking-tight text-white">
              TICKET<span className="text-gradient">PASS</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
            High-throughput, anti-scalping ticket drops powered by Stellar Consensus
            Protocol and Soroban smart contracts. Own every moment, on-chain.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Platform</h4>
          <ul className="space-y-2.5 text-xs text-zinc-500">
            <li><a href="/#drops" className="hover:text-white transition-colors">Active Drops</a></li>
            <li><a href="/wallet" className="hover:text-white transition-colors">My Wallet</a></li>
            <li><a href="/verify" className="hover:text-white transition-colors">Gate Validator</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Host</h4>
          <ul className="space-y-2.5 text-xs text-zinc-500">
            <li><a href="/dashboard/events" className="hover:text-white transition-colors">Manage Events</a></li>
            <li><a href="/dashboard/events/new" className="hover:text-white transition-colors">Create a Drop</a></li>
            <li><a href="/dashboard/overview" className="hover:text-white transition-colors">Dashboard</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/8 py-5 text-center text-[11px] text-zinc-600">
        © 2026 Ticket Pass · Decentralized event ticketing on Stellar Consensus Protocol.
      </div>
    </footer>
  );
}
