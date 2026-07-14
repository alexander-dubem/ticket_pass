'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useWallet } from '../context/WalletContext';
import { Calendar, Users, ArrowRight, Sparkles, MapPin, Disc, Loader2, ShieldCheck, Zap, KeyRound, Activity, Coins } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  price: string;
  capacity: number;
  maxPremiumPctScaled: number;
  contractAddress: string | null;
  _count?: { tickets: number };
}

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Ticket Pass Genesis Drop',
    description: 'The exclusive launch event for Ticket Pass with top Web3 artists and live DJs in Lisbon.',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    price: '25',
    capacity: 250,
    maxPremiumPctScaled: 150,
    contractAddress: 'CCZ...MNT',
    _count: { tickets: 182 },
  },
  {
    id: '2',
    title: 'Horizon Neon Rave',
    description: 'An immersive cyberpunk audio-visual experience powered by Stellar network speed.',
    date: new Date(Date.now() + 86400000 * 12).toISOString(),
    price: '15',
    capacity: 150,
    maxPremiumPctScaled: 200,
    contractAddress: 'CCY...HZN',
    _count: { tickets: 145 },
  },
  {
    id: '3',
    title: 'Soroban Developer Summit Party',
    description: 'The official networking and celebration event for developers building the next wave of Stellar dApps.',
    date: new Date(Date.now() + 86400000 * 20).toISOString(),
    price: '40',
    capacity: 500,
    maxPremiumPctScaled: 100,
    contractAddress: 'CCX...DEV',
    _count: { tickets: 120 },
  }
];

export default function HomePage() {
  const { apiFetch } = useWallet();
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await apiFetch('/events');
        if (data && data.length > 0) {
          setEvents(data);
        }
      } catch (err) {
        console.log('Using fallback mock event data since local database API is not running.');
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, [apiFetch]);

  const getTicketsSold = (ev: Event) => {
    return ev._count ? ev._count.tickets : 0;
  };

  const getProgressPercent = (ev: Event) => {
    const sold = getTicketsSold(ev);
    return Math.min(100, Math.round((sold / ev.capacity) * 100));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-brand animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>

      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Decentralized Tickets with Zero Scalping</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
            Claim Your Entry to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end">Next Big Wave</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Ticket Pass orchestrates high-throughput ticket drops on the Stellar Network. On-chain ticket integrity, instant transfers, and hardcoded smart contract resale price caps.
          </p>
          <div className="flex gap-4">
            <a href="#drops">
              <Button variant="glow" size="lg" className="gap-2">
                Explore Drops
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="pb-16 pt-4 border-b border-zinc-900">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="glass p-4 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <Coins className="w-6 h-6 text-brand mb-2" />
              <span className="text-2xl font-black font-mono text-white">$0.00</span>
              <span className="text-[11px] text-zinc-500 font-medium uppercase mt-1">Sponsor Gas Fees</span>
            </div>
            <div className="glass p-4 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <Zap className="w-6 h-6 text-cyan-500 mb-2" />
              <span className="text-2xl font-black font-mono text-white">~5s</span>
              <span className="text-[11px] text-zinc-500 font-medium uppercase mt-1">Stellar Consensus Speed</span>
            </div>
            <div className="glass p-4 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mb-2" />
              <span className="text-2xl font-black font-mono text-white">100%</span>
              <span className="text-[11px] text-zinc-500 font-medium uppercase mt-1">Anti-Scalp Price Cap</span>
            </div>
            <div className="glass p-4 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <KeyRound className="w-6 h-6 text-amber-500 mb-2" />
              <span className="text-2xl font-black font-mono text-white">SEP-10</span>
              <span className="text-[11px] text-zinc-500 font-medium uppercase mt-1">Cryptographic Auth</span>
            </div>
          </div>
        </section>

        {/* Drops Grid */}
        <section id="drops" className="py-20 scroll-mt-20 border-b border-zinc-900">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Active Drops</h2>
              <p className="text-sm text-muted-foreground">On-chain ticketing events currently open for purchase</p>
            </div>
            <Badge variant="cyan" className="px-3 py-1 font-mono">TESTNET</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const sold = getTicketsSold(ev);
              const pct = getProgressPercent(ev);
              const isSoldOut = sold >= ev.capacity;

              return (
                <Card key={ev.id} className="glass glass-hover flex flex-col justify-between overflow-hidden">
                  <div className="p-0 relative">
                    <div className="h-48 w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative flex items-center justify-center overflow-hidden border-b border-border">
                      <div className="absolute inset-0 bg-radial-gradient from-brand/10 to-transparent"></div>
                      <Disc className="w-16 h-16 text-zinc-700 animate-spin-slow" />
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        <Badge variant={isSoldOut ? "destructive" : "success"}>
                          {isSoldOut ? 'Sold Out' : 'Active Drop'}
                        </Badge>
                        <Badge variant="outline" className="bg-zinc-950/80 backdrop-blur border-zinc-800 text-zinc-400 font-mono">
                          {(ev.maxPremiumPctScaled / 10).toFixed(0)}% Resale Limit
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pt-6">
                    <CardTitle className="text-xl font-bold text-white line-clamp-1">{ev.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 min-h-10">{ev.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2 text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand" />
                        <span>{new Date(ev.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-500" />
                        <span>Lisbon, Portugal</span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {sold} / {ev.capacity} Tickets Sold
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-gradient-start to-brand-gradient-end rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">TICKET PRICE</p>
                      <p className="text-lg font-black text-white font-mono">{ev.price} XLM</p>
                    </div>
                    <Link href={`/event/${ev.id}`}>
                      <Button variant="glow" size="sm" className="gap-1">
                        View Drop
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-b border-zinc-900">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Integrity-First Ticketing Features</h2>
            <p className="text-sm text-muted-foreground">Built to tackle high-concurrency ticket releases and eliminate unfair secondary market scalping on-chain.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="glass p-6 rounded-xl border border-zinc-800/80 flex items-start gap-4">
              <div className="p-3 bg-brand/10 rounded-lg border border-brand/20 text-brand shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">On-Chain Anti-Scalping</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Soroban smart contracts regulate all secondary ticket sales. Resellers cannot list tickets above capacity price + original premium percentages, shutting down bots and scalpers.
                </p>
              </div>
            </div>

            <div className="glass p-6 rounded-xl border border-zinc-800/80 flex items-start gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400 shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Gasless User Experience</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  All transactions (mints, transfers, and checks) are sponsored using fee-bump envelopes. Users do not need to keep native XLM balances to pay for transaction network gas fees.
                </p>
              </div>
            </div>

            <div className="glass p-6 rounded-xl border border-zinc-800/80 flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-400 shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">SEP-10 Cryptographic Login</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Authenticate securely using your Stellar wallet extension or device keychain. Passwordless, database-free challenge-response sessions provide absolute wallet sovereignty.
                </p>
              </div>
            </div>

            <div className="glass p-6 rounded-xl border border-zinc-800/80 flex items-start gap-4">
              <div className="p-3 bg-brand/10 rounded-lg border border-brand/20 text-brand shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Parallel Transaction Pipelines</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Our custom NestJS backend handles major spikes in ticketing traffic (flash sales) using a managed queue of Stellar Channel Accounts to dispatch simultaneous ledgers in parallel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 border-b border-zinc-900">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">How It Works</h2>
            <p className="text-sm text-muted-foreground">The end-to-end lifecycle of a decentralized Ticket Pass.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto relative">
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-brand font-mono font-bold text-lg mb-4 shadow-lg">1</div>
              <h4 className="text-base font-bold text-white mb-2">Connect Wallet</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Link your Freighter or Albedo wallet in one tap to identify your keypair.</p>
            </div>
            
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-cyan-400 font-mono font-bold text-lg mb-4 shadow-lg">2</div>
              <h4 className="text-base font-bold text-white mb-2">Claim Your Drop</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Select an active drop, sign the mint request payload, and secure your ticket.</p>
            </div>

            <div className="flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-emerald-400 font-mono font-bold text-lg mb-4 shadow-lg">3</div>
              <h4 className="text-base font-bold text-white mb-2">Anti-Scalp Resale</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Need to sell? Transfer tickets securely on-chain knowing maximum resale price caps are enforced.</p>
            </div>

            <div className="flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-amber-400 font-mono font-bold text-lg mb-4 shadow-lg">4</div>
              <h4 className="text-base font-bold text-white mb-2">Gate Check-in</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">Present your ticket. The scanner verifies your cryptographic ownership signature instantly.</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground">Find answers to common questions about ticket purchasing, security, and wallets.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <details className="group glass border border-zinc-800/80 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-5 text-sm font-bold text-white cursor-pointer select-none focus:outline-none">
                <span>Do I need XLM (Stellar crypto) to purchase or transfer tickets?</span>
                <span className="text-zinc-500 transition-transform group-open:rotate-180 duration-300">▼</span>
              </summary>
              <div className="p-5 pt-0 border-t border-zinc-900/50 text-xs text-zinc-400 leading-relaxed">
                No, you do not need native XLM balances to pay for blockchain gas. Ticket Pass uses a Master Sponsor Account that automatically covers network gas fees via Stellar's Fee-Bump envelope wrapper.
              </div>
            </details>

            <details className="group glass border border-zinc-800/80 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-5 text-sm font-bold text-white cursor-pointer select-none focus:outline-none">
                <span>How does the contract stop ticket scalpers and bots?</span>
                <span className="text-zinc-500 transition-transform group-open:rotate-180 duration-300">▼</span>
              </summary>
              <div className="p-5 pt-0 border-t border-zinc-900/50 text-xs text-zinc-400 leading-relaxed">
                The underlying Soroban smart contract regulates ticket transfers. Each ticket retains its original mint price. When transferring/reselling, the contract restricts transaction inputs to ensure the resale price is below original capacity + designated max premium rates.
              </div>
            </details>

            <details className="group glass border border-zinc-800/80 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-5 text-sm font-bold text-white cursor-pointer select-none focus:outline-none">
                <span>Which crypto wallets are supported by Ticket Pass?</span>
                <span className="text-zinc-500 transition-transform group-open:rotate-180 duration-300">▼</span>
              </summary>
              <div className="p-5 pt-0 border-t border-zinc-900/50 text-xs text-zinc-400 leading-relaxed">
                We integrate the official Stellar Wallets Kit, supporting Freighter Extension, Albedo Wallet, and various mobile wallets over WalletConnect v2.
              </div>
            </details>

            <details className="group glass border border-zinc-800/80 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-5 text-sm font-bold text-white cursor-pointer select-none focus:outline-none">
                <span>What happens if my ticket state expires on-chain?</span>
                <span className="text-zinc-500 transition-transform group-open:rotate-180 duration-300">▼</span>
              </summary>
              <div className="p-5 pt-0 border-t border-zinc-900/50 text-xs text-zinc-400 leading-relaxed">
                Ticket Pass utilizes proactive TTL (Time-To-Live) management. During every transaction (minting, transfers), the smart contract automatically extends the lease on your persistent state, keeping ownership records active for at least 45 days prior to an event without manual restoration.
              </div>
            </details>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-zinc-950/60 py-8 relative z-10 text-center text-xs text-muted-foreground">
        <p>© 2026 Ticket Pass. Decentralized event ticketing on Stellar Consensus Protocol.</p>
      </footer>
    </div>
  );
}
