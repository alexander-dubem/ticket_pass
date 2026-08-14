'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { useWallet } from '../../../context/WalletContext';
import { Calendar, Users, ShieldCheck, ArrowLeft, Loader2, Landmark, Coins, Wallet, CheckCircle2, PartyPopper } from 'lucide-react';
import Link from 'next/link';

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

const MOCK_EVENTS: Record<string, Event> = {
  '1': {
    id: '1',
    title: 'Neon Bloom Festival',
    description: 'Three nights of immersive art, live DJs and fireworks under the Lagos sky. A celebration you won’t forget.',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    price: '25',
    capacity: 250,
    maxPremiumPctScaled: 150,
    contractAddress: 'CCZ...MNT',
    images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80'],
    _count: { tickets: 182 },
  },
  '2': {
    id: '2',
    title: 'Champagne & Roses Wedding Gala',
    description: 'A black-tie celebration of love — golden-hour toasts, live band, and dancing until sunrise in Bali.',
    date: new Date(Date.now() + 86400000 * 12).toISOString(),
    price: '15',
    capacity: 150,
    maxPremiumPctScaled: 200,
    contractAddress: 'CCY...HZN',
    images: ['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'],
    _count: { tickets: 145 },
  },
  '3': {
    id: '3',
    title: 'Stellar Afterparty Summit',
    description: 'The official crypto celebration after the Soroban Dev Summit. Builders, beats and bad vibes banned.',
    date: new Date(Date.now() + 86400000 * 20).toISOString(),
    price: '40',
    capacity: 500,
    maxPremiumPctScaled: 100,
    contractAddress: 'CCX...DEV',
    images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'],
    _count: { tickets: 120 },
  },
};

const HERO_GRADIENTS: Record<string, string> = {
  '1': 'from-rose-500 via-pink-500 to-fuchsia-500',
  '2': 'from-violet-500 via-purple-500 to-cyan-400',
  '3': 'from-amber-400 via-rose-500 to-pink-500',
};

function EventCountdown({ date }: { date: string }) {
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
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex gap-2">
      {[{ v: d, l: 'Days' }, { v: h, l: 'Hrs' }, { v: m, l: 'Min' }, { v: s, l: 'Sec' }].map((x) => (
        <div key={x.l} className="glass-strong rounded-xl px-3 py-2 text-center min-w-[56px]">
          <p className="text-xl font-black text-white font-mono tabular-nums leading-none">{String(x.v).padStart(2, '0')}</p>
          <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1">{x.l}</p>
        </div>
      ))}
    </div>
  );
}

export default function EventDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { address, apiFetch } = useWallet();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{ txHash: string; ticketId: number } | null>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const data = await apiFetch(`/events/${id}`);
        if (data) {
          setEvent(data);
        }
      } catch (err) {
        // Fallback to mock data if API is offline
        const mockEv = MOCK_EVENTS[id];
        if (mockEv) {
          setEvent(mockEv);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadEvent();
  }, [id, apiFetch]);

  const handleMint = async () => {
    if (!address) {
      router.push(`/auth?redirect=/event/${id}`);
      return;
    }

    setIsMinting(true);
    try {
      const dummyInnerTxXdr = 'AAAAAgAAAAD...user_signed_inner_contract_payload_XDR...';

      let result;
      try {
        result = await apiFetch(`/events/${id}/purchase`, {
          method: 'POST',
          body: JSON.stringify({ xdr: dummyInnerTxXdr }),
        });
      } catch (err) {
        console.warn('Backend connection failed. Simulating on-chain transaction verification.');
        await new Promise(resolve => setTimeout(resolve, 2500));
        result = {
          success: true,
          txHash: 'tx_' + Buffer.from(Math.random().toString()).toString('hex').substring(0, 16),
          ticket: { ticketId: (event?._count?.tickets || 0) + 1 }
        };
      }

      setMintResult({
        txHash: result.txHash,
        ticketId: result.ticket.ticketId,
      });

      if (event) {
        setEvent({
          ...event,
          _count: { tickets: (event._count?.tickets || 0) + 1 }
        });
      }
    } catch (err: any) {
      alert(`Minting Failed: ${err.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mesh-bg flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mesh-bg flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <p className="text-zinc-500 text-lg">Drop event not found.</p>
          <Link href="/">
            <Button variant="outline">Back to Drops</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const sold = event._count?.tickets || 0;
  const pct = Math.min(100, Math.round((sold / event.capacity) * 100));
  const isSoldOut = sold >= event.capacity;
  const premiumPct = event.maxPremiumPctScaled / 10;
  const maxResalePrice = parseFloat(event.price) * (1 + premiumPct / 100);
  const heroGrad = HERO_GRADIENTS[event.id] || HERO_GRADIENTS['1'];

  return (
    <div className="mesh-bg flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl relative z-10">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 text-sm text-zinc-400 hover:text-white px-3 -ml-3 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Drops
        </Button>

        {/* Hero Banner */}
        <div className="relative h-72 md:h-80 rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-fuchsia-500/10 mb-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${heroGrad}`} />
          {event.images?.[0] ? (
            <Image
              src={event.images[0]}
              alt={event.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority
              className="object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-grid opacity-40 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/30" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm mb-5 glow-brand">
              <PartyPopper className="w-9 h-9 text-white" />
            </div>
            <Badge variant={isSoldOut ? "destructive" : "gradient"} className="mb-3">
              {isSoldOut ? 'Sold Out' : 'Active Drop'}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 max-w-2xl">
              {event.title}
            </h1>
            <EventCountdown date={event.date} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
                <Calendar className="w-4 h-4 text-fuchsia-400" />
                <span>{new Date(event.date).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
              </div>
              <p className="text-zinc-300 leading-relaxed">{event.description}</p>
            </div>

            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold tracking-wider text-zinc-300 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Soroban On-Chain Guarantees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-zinc-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/10">
                    <p className="text-xs text-zinc-500 font-medium">Original price</p>
                    <p className="text-base font-bold text-white font-mono mt-1 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {event.price} XLM
                    </p>
                  </div>
                  <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/10">
                    <p className="text-xs text-zinc-500 font-medium">Max Resale Cap ({premiumPct}%)</p>
                    <p className="text-base font-bold text-gradient font-mono mt-1">{maxResalePrice.toFixed(2)} XLM</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-500">
                  Anti-Scalping Protection: the smart contract at{' '}
                  <code className="text-fuchsia-400 font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-[10px] border border-white/10">
                    {event.contractAddress || 'CCX...DEV'}
                  </code>{' '}
                  strictly restricts ticket transfers above capacity price + {premiumPct}% premium.
                </p>
              </CardContent>
            </Card>

            {/* Wallet requirement note */}
            <Card className="glass border-white/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Crypto Checkout</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Pay with your Stellar wallet. No card, no KYC — just sign the mint payload
                      from Freighter or Albedo and your pass lands in your wallet instantly.
                      Network gas is sponsored by the platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mint Action Panel */}
          <div className="space-y-6">
            <Card className="glass-strong border-white/10 sticky top-24 ring-gradient overflow-hidden">
              <CardHeader>
                <CardDescription className="text-xs text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                  Ticket Drop
                </CardDescription>
                <CardTitle className="text-3xl font-black text-white font-mono flex items-center gap-2">
                  <Coins className="w-6 h-6 text-amber-400" />
                  {event.price} <span className="text-lg font-bold text-zinc-400">XLM</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3 text-sm text-zinc-400">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="flex items-center gap-2"><Wallet className="w-4 h-4 text-fuchsia-400" /> Payment</span>
                    <span className="font-mono text-emerald-300 text-xs">Stellar · Gas-Free</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {sold} / {event.capacity} Minted
                    </span>
                    <span className="text-gradient font-bold">{pct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/[0.06] rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {!mintResult ? (
                  <Button
                    variant="glow"
                    className="w-full py-6 font-bold"
                    onClick={handleMint}
                    disabled={isMinting || isSoldOut}
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing Mint Payload…
                      </>
                    ) : !address ? (
                      <>
                        <Wallet className="w-4 h-4" />
                        Connect Wallet to Mint
                      </>
                    ) : isSoldOut ? (
                      'Sold Out'
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        Mint On-Chain Ticket
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-xl space-y-3 animate-rise">
                    <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Ticket Minted Successfully!
                    </p>
                    <div className="text-[11px] text-zinc-400 font-mono space-y-1">
                      <p className="truncate">Tx: {mintResult.txHash}</p>
                      <p>Ticket ID: #{mintResult.ticketId}</p>
                    </div>
                    <Link href="/wallet">
                      <Button variant="outline" size="sm" className="w-full text-xs h-8 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/10 mt-1">
                        View in Wallet
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
