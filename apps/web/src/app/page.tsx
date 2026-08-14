'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { useWallet } from '../context/WalletContext';
import {
  Sparkles, ArrowRight, Calendar, Users, MapPin, Disc,
  ShieldCheck, Zap, KeyRound, Activity, Coins, Ticket, PartyPopper,
  Music, Heart, Crown, Flame, Wallet, ArrowUpRight, Sparkle,
  type LucideIcon,
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  price: string;
  capacity: number;
  maxPremiumPctScaled: number;
  contractAddress: string | null;
  images?: string[];
  _count?: { tickets: number };
}

const CARD_GRADIENTS = [
  'from-rose-500 via-pink-500 to-fuchsia-500',
  'from-violet-500 via-purple-500 to-cyan-400',
  'from-amber-400 via-rose-500 to-pink-500',
  'from-cyan-400 via-sky-500 to-violet-500',
  'from-fuchsia-500 via-violet-500 to-indigo-500',
  'from-pink-500 via-rose-500 to-amber-400',
];

const CARD_ICONS: LucideIcon[] = [PartyPopper, Music, Heart, Flame, Crown, Sparkle];

const MARQUEE_ITEMS = [
  'Festivals', 'Weddings', 'Concerts', 'Birthday Parties', 'Corporate Galas',
  'Tech Summits', 'Rooftop Parties', 'Anniversaries', 'Sporting Finals', 'Cultural Showcases',
];

const CATEGORIES = ['All', 'Music', 'Festivals', 'Weddings', 'Tech', 'Nightlife', 'Food & Drink', 'Arts'];

function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);

  return (
    <span className="font-mono text-[11px] tabular-nums">
      {d}d&nbsp;{String(h).padStart(2, '0')}h&nbsp;{String(m).padStart(2, '0')}m
    </span>
  );
}

export default function HomePage() {
  const { apiFetch } = useWallet();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await apiFetch('/events');
        if (data && Array.isArray(data)) {
          setEvents(data);
        } else {
          setEvents([]);
        }
      } catch (err) {
        setError('Unable to load events. Please ensure the backend API is running.');
        console.error(err);
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
      <div className="mesh-bg flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 glow-brand">
            <Disc className="w-7 h-7 text-white animate-spin" />
          </span>
          <p className="text-sm text-zinc-500">Warming up the stage…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mesh-bg flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-zinc-500 text-lg">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="mesh-bg flex flex-col min-h-screen overflow-x-hidden">
      <Header />

      <main className="flex-1 relative z-10">
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative text-center pt-16 md:pt-24 pb-8 max-w-4xl mx-auto px-4 flex flex-col items-center">
          <div className="absolute inset-0 -z-10 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=70"
              alt="Live event crowd under lights"
              className="w-full h-full object-cover object-center opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b0514]/85 via-[#0b0514]/55 to-[#0b0514]/10" />
          </div>
          <div className="bg-grid absolute inset-0 -z-10" />
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[560px] h-[360px] bg-gradient-to-r from-pink-500/25 via-fuchsia-500/20 to-cyan-400/20 rounded-full blur-[110px] pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-semibold mb-7 animate-rise">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Decentralized Tickets · Zero Scalping · Powered by Stellar</span>
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.05] animate-rise">
            Your Vibe.
            <br />
            <span className="text-gradient">On the Blockchain.</span>
          </h1>

          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mb-9 leading-relaxed animate-rise">
            Claim a front-row seat to festivals, weddings and everything in between.
            Mint on-chain tickets with one wallet tap — gas-free, anti-scalp, and
            verified in seconds at the gate.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 animate-rise">
            <a href="#drops">
              <Button variant="glow" size="lg" className="gap-2 px-8">
                Explore Drops
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <a href="/auth?redirect=/dashboard/events">
              <Button variant="outline-glow" size="lg" className="gap-2 px-8">
                <Crown className="w-4 h-4" />
                Host an Event
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-[11px] text-zinc-500 font-medium animate-rise">
            <span className="flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5 text-fuchsia-400" /> SEP-10 Crypto Login</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-400" /> Fee-Bump Sponsored Gas</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> On-Chain Integrity</span>
          </div>

          {/* ── Hero Ticket Art ─────────────────────────────────── */}
          <div className="relative mt-14 mb-6 w-[300px] md:w-[400px]">
            <div className="absolute -inset-10 bg-gradient-to-r from-pink-500/30 via-fuchsia-500/25 to-cyan-400/25 blur-3xl rounded-full pointer-events-none" />

            <div className="relative rotate-1 rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-fuchsia-500/20 animate-float">
              <div className="bg-gradient-to-br from-rose-500 via-fuchsia-500 to-violet-600 p-5 md:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-1.5">
                    <Disc className="w-5 h-5 text-white" />
                    <span className="text-white font-extrabold text-sm tracking-tight">TICKETPASS&nbsp;</span>
                  </div>
                  <Badge variant="gold" className="bg-amber-400/20 text-amber-200">SEP-10</Badge>
                </div>

                <div className="h-16 md:h-20 w-full bg-white/90 rounded-lg flex items-center justify-between px-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Admit One</span>
                    <span className="text-zinc-900 font-black text-sm md:text-base leading-tight">Neon Bloom Festival</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">#104</span>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-amber-300 text-amber-900">
                      <Coins className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col leading-none">
                      <span className="text-[9px] uppercase tracking-widest text-white/70 font-semibold">Price</span>
                      <span className="text-white font-black text-base">25 XLM</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="grid grid-cols-6 gap-[2px]">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <span key={i} className={`h-2 w-1.5 ${i % 3 === 0 ? 'bg-white' : i % 2 === 0 ? 'bg-white/70' : 'bg-white/40'}`} />
                      ))}
                    </div>
                    <span className="text-[8px] font-mono text-white/60 tracking-widest">GATE&nbsp;SCAN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chips */}
            <div className="absolute -left-6 md:-left-14 top-10 glass-strong rounded-2xl px-3.5 py-2.5 shadow-xl animate-float-delay">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Gas Fees</p>
              <p className="text-sm font-black text-emerald-300 flex items-center gap-1"><Coins className="w-3.5 h-3.5" /> $0.00</p>
            </div>
            <div className="absolute -right-4 md:-right-12 bottom-8 glass-strong rounded-2xl px-3.5 py-2.5 shadow-xl animate-float">
              <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Resale Cap</p>
              <p className="text-sm font-black text-gradient">+15% max</p>
            </div>
          </div>
        </section>

        {/* ── VIBE MARQUEE ────────────────────────────────────────── */}
        <section className="border-y border-white/8 bg-white/[0.03] py-3 overflow-hidden">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-10 text-sm font-semibold tracking-wide text-zinc-400">
                {item}
                <Sparkle className="w-3.5 h-3.5 text-fuchsia-500/70" />
              </span>
            ))}
          </div>
        </section>

        {/* ── CATEGORIES ──────────────────────────────────────────── */}
        <section className="container mx-auto px-4 pt-12 pb-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  cat === 'All'
                    ? 'bg-gradient-to-r from-pink-500 to-violet-500 border-transparent text-white shadow-lg shadow-fuchsia-500/25'
                    : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:border-fuchsia-400/40 hover:bg-white/[0.07]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ── STATS STRIP ─────────────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto">
            <div className="glass glass-hover rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center mb-2.5">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-mono text-white">$0.00</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase mt-1 tracking-wide">Sponsor Gas Fees</span>
            </div>
            <div className="glass glass-hover rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center mb-2.5">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-mono text-white">~5s</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase mt-1 tracking-wide">Stellar Consensus</span>
            </div>
            <div className="glass glass-hover rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center mb-2.5">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-mono text-white">100%</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase mt-1 tracking-wide">Anti-Scalp Cap</span>
            </div>
            <div className="glass glass-hover rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-2.5">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black font-mono text-white">SEP-10</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase mt-1 tracking-wide">Crypto Auth</span>
            </div>
          </div>
        </section>

        {/* ── ACTIVE DROPS ────────────────────────────────────────── */}
        <section id="drops" className="container mx-auto px-4 py-16 scroll-mt-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="gradient" className="mb-3">🔥 Now Live</Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">Active Drops</h2>
              <p className="text-sm text-zinc-500 mt-2">Mint your on-chain pass — every ticket is a collectible you own.</p>
            </div>
            <Badge variant="cyan" className="px-3 py-1 font-mono">STELLAR TESTNET</Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev, i) => {
              const sold = getTicketsSold(ev);
              const pct = getProgressPercent(ev);
              const isSoldOut = sold >= ev.capacity;
              const EventIcon = CARD_ICONS[i % CARD_ICONS.length] ?? Sparkle;

              return (
                <Card key={ev.id} className="glass glass-hover flex flex-col overflow-hidden group">
                  {/* Ticket cover */}
                  <div className="relative h-52 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`} />
                    {ev.images?.[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={ev.images[0]}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-grid opacity-40 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

                    {ev.images?.[0] ? null : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm">
                          <EventIcon className="w-9 h-9 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge variant={isSoldOut ? "destructive" : "gradient"}>
                        {isSoldOut ? 'Sold Out' : 'Active Drop'}
                      </Badge>
                    </div>

                    <div className="absolute top-4 right-4 glass-strong rounded-full px-2.5 py-1">
                      <Countdown date={ev.date} />
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-white/80">
                        <Coins className="w-3.5 h-3.5" />
                        {ev.maxPremiumPctScaled / 10}% Resale Limit
                      </span>
                      <span className="text-[11px] font-mono text-white/80">#{String(i + 1).padStart(3, '0')}</span>
                    </div>

                    {/* bottom tick edge */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full">
                      <div className="h-0.5 border-t border-dashed border-white/40" />
                    </div>
                  </div>

                  <CardHeader className="pt-6 pb-2">
                    <CardTitle className="text-xl font-bold text-white line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-violet-400 transition-all">
                      {ev.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 min-h-10">{ev.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <div className="flex flex-col gap-2 text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-fuchsia-400" />
                        <span>{new Date(ev.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span>Lagos · Lisbon · Bali</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-zinc-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {sold} / {ev.capacity} Tickets Sold
                        </span>
                        <span className="text-gradient font-bold">{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-white/8 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Crypto Price</p>
                      <p className="text-lg font-black text-white font-mono flex items-center gap-1.5">
                        <Coins className="w-4 h-4 text-amber-400" />
                        {ev.price} XLM
                      </p>
                    </div>
                    <Link href={`/event/${ev.id}`}>
                      <Button variant="glow" size="sm" className="gap-1.5">
                        Buy with Crypto
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
            {events.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                  <Ticket className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">No Active Drops Yet</h3>
                <p className="text-sm text-zinc-400 max-w-md mb-6">
                  TicketPass is preparing its first on-chain drops. Check back soon or follow us to be the first to mint.
                </p>
                <Badge variant="cyan" className="font-mono">STELLAR TESTNET</Badge>
              </div>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────── */}
        <section className="border-y border-white/8 bg-white/[0.02] py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="pink" className="mb-3">⚡ How it works</Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
                From Wallet Tap to <span className="text-gradient">Gate Entry</span>
              </h2>
              <p className="text-sm text-zinc-500">The end-to-end lifecycle of a decentralized Ticket Pass.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto relative">
              {[
                { icon: Wallet, title: 'Connect Wallet', desc: 'Link Freighter or Albedo in one tap to identify your keypair.', grad: 'from-pink-500 to-rose-500' },
                { icon: Ticket, title: 'Mint Your Drop', desc: 'Pick an active drop, sign the mint payload, and secure your pass.', grad: 'from-violet-500 to-fuchsia-500' },
                { icon: Coins, title: 'Anti-Scalp Resale', desc: 'Sell safely on-chain — smart-contract resale price caps are enforced.', grad: 'from-amber-400 to-rose-500' },
                { icon: ShieldCheck, title: 'Gate Check-In', desc: 'Present your pass. The scanner verifies your crypto ownership instantly.', grad: 'from-cyan-400 to-violet-500' },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center px-2">
                  <div className={`relative mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.grad} flex items-center justify-center glow-brand`}>
                    <step.icon className="w-7 h-7 text-white" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-900 border border-white/15 text-white font-mono font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="violet" className="mb-3">🛡️ Built for integrity</Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
                Celebrate Loud. <span className="text-gradient-gold">Scalp-Proof.</span>
              </h2>
              <p className="text-sm text-zinc-500">Built to handle flash-sale traffic without bots, scalpers or lockups.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
              <div className="glass glass-hover p-7 rounded-2xl flex items-start gap-5 ring-gradient">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">On-Chain Anti-Scalping</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Soroban smart contracts regulate every resale. Sellers can’t list above capacity price plus the capped premium — bots and scalpers are shut down by code, not policy.
                  </p>
                </div>
              </div>

              <div className="glass glass-hover p-7 rounded-2xl flex items-start gap-5">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Gasless for Everyone</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Mints, transfers and gate checks are sponsored with fee-bump envelopes. You never need to hold XLM just to pay network gas.
                  </p>
                </div>
              </div>

              <div className="glass glass-hover p-7 rounded-2xl flex items-start gap-5">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">SEP-10 Cryptographic Login</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Passwordless, database-free challenge-response sessions. Your wallet extension is your identity — absolute sovereignty.
                  </p>
                </div>
              </div>

              <div className="glass glass-hover p-7 rounded-2xl flex items-start gap-5">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Parallel Transaction Pipelines</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    A managed pool of Stellar channel accounts dispatches simultaneous mints during flash sales — no latency, no lockups.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── ORGANIZER CTA ───────────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-20">
          <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-violet-600 p-10 md:p-16 text-center shadow-2xl shadow-fuchsia-500/25">
            <div className="absolute inset-0 bg-grid opacity-40 mix-blend-overlay" />
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl" />
            <div className="relative">
              <Crown className="w-10 h-10 text-white mx-auto mb-5 glow-brand rounded-full" />
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                Host Your Next Big Celebration
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8 text-sm md:text-base leading-relaxed">
                Weddings, festivals, conferences — launch your own on-chain ticket drop
                in minutes. Full control over pricing, capacity and resale caps.
              </p>
              <a href="/auth?redirect=/dashboard/events">
                <Button variant="default" size="lg" className="gap-2 bg-white text-zinc-900 hover:bg-white/90 shadow-xl px-8">
                  Start Hosting
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <section className="pb-20 border-t border-white/8 pt-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <Badge variant="gold" className="mb-3">💬 Good to know</Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-sm text-zinc-500">Everything you need to know before grabbing your pass.</p>
            </div>

            <Accordion className="max-w-3xl mx-auto gap-3">
              {[
                {
                  q: 'Do I need XLM to purchase or transfer tickets?',
                  a: 'No. TicketPass uses a Master Sponsor Account that covers network gas fees via Stellar’s fee-bump envelope — you pay only the ticket price.',
                },
                {
                  q: 'How does the contract stop scalpers and bots?',
                  a: 'Each ticket keeps its original mint price. The Soroban contract restricts resale to capacity price plus the capped premium, so bots can’t inflate the secondary market.',
                },
                {
                  q: 'Which crypto wallets are supported?',
                  a: 'Freighter extension, Albedo, and mobile wallets over WalletConnect v2 — all through the official Stellar Wallets Kit.',
                },
                {
                  q: 'What happens if my ticket state expires on-chain?',
                  a: 'Proactive TTL management keeps your ownership records alive. Every mint or transfer automatically extends state leases for at least 45 days before an event.',
                },
              ].map((faq, i) => (
                <AccordionItem
                  key={faq.q}
                  value={faq.q}
                  className="glass border border-white/10 rounded-2xl overflow-hidden not-last:border-white/10 px-1"
                >
                  <AccordionTrigger className="p-5 text-sm font-bold text-white">
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-fuchsia-500/30 flex items-center justify-center text-[10px] font-mono text-fuchsia-300">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
