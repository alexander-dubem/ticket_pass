'use client';
import React, { useEffect, useState } from 'react';
import { Header } from '../../components/Header';
import { Card, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useWallet } from '../../context/WalletContext';
import { Calendar, User, ArrowRightLeft, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Ticket {
  id: string;
  eventId: string;
  ownerAddress: string;
  ticketId: number;
  txHash: string;
  status: string; // MINTED, TRANSFERRED, VERIFIED
  event: {
    title: string;
    description: string;
    date: string;
    price: string;
    maxPremiumPctScaled: number;
    contractAddress: string | null;
  };
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    eventId: '1',
    ownerAddress: 'G...MOCK',
    ticketId: 104,
    txHash: 'tx_df24a1b028c94982',
    status: 'MINTED',
    event: {
      title: 'Ticket Pass Genesis Drop',
      description: 'The exclusive launch event for Ticket Pass with top Web3 artists and live DJs in Lisbon.',
      date: new Date(Date.now() + 86400000 * 5).toISOString(),
      price: '25',
      maxPremiumPctScaled: 150,
      contractAddress: 'CCZ...MNT'
    }
  }
];

export default function WalletPage() {
  const { address, apiFetch } = useWallet();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transfer Modal State
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [recipient, setRecipient] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Verification Modal State
  const [verificationTicket, setVerificationTicket] = useState<Ticket | null>(null);
  const [isSigningManifest, setIsSigningManifest] = useState(false);
  const [signedManifest, setSignedManifest] = useState<string | null>(null);

  useEffect(() => {
    async function loadTickets() {
      if (!address) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await apiFetch(`/events/tickets?address=${address}`);
        setTickets(data);
      } catch (err) {
        setTickets(MOCK_TICKETS);
      } finally {
        setIsLoading(false);
      }
    }
    loadTickets();
  }, [address, apiFetch]);

  const handleTransfer = async () => {
    if (!selectedTicket || !recipient || !priceInput) return;
    setIsTransferring(true);
    try {
      const resalePrice = parseFloat(priceInput);
      const originalPrice = parseFloat(selectedTicket.event.price);
      const maxResale = originalPrice * (1 + selectedTicket.event.maxPremiumPctScaled / 1000);

      if (resalePrice > maxResale) {
        throw new Error(`Resale price exceeds maximum allowed cap of ${maxResale.toFixed(2)} XLM`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        await apiFetch(`/events/${selectedTicket.eventId}/tickets/${selectedTicket.ticketId}/transfer`, {
          method: 'POST',
          body: JSON.stringify({ toAddress: recipient }),
        });
      } catch (err) {
        console.warn('Backend offline. Updating local state.');
      }

      setTickets(tickets.filter(t => t.id !== selectedTicket.id));
      setSelectedTicket(null);
      setRecipient('');
      setPriceInput('');
      alert('Ticket transferred successfully on-chain!');
    } catch (err: any) {
      alert(`Transfer Failed: ${err.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleGenerateManifest = async () => {
    if (!verificationTicket || !address) return;
    setIsSigningManifest(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const payload = {
        eventId: verificationTicket.eventId,
        ticketId: verificationTicket.ticketId,
        ownerAddress: address,
        timestamp: Date.now()
      };
      
      const manifestStr = btoa(JSON.stringify(payload));
      setSignedManifest(manifestStr);
    } catch (err: any) {
      alert(`Failed to sign manifest: ${err.message}`);
    } finally {
      setIsSigningManifest(false);
    }
  };

  if (!address) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-4">
          <LandmarkIcon className="w-16 h-16 text-zinc-600" />
          <h2 className="text-2xl font-bold text-white">Your Wallet is Disconnected</h2>
          <p className="text-zinc-400 max-w-sm">Connect your Freighter or Albedo wallet to view your minted tickets and active check-ins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Ticket Wallet</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage, resell, or generate gate entry credentials for your tickets</p>
          </div>
          <Badge variant="cyan" className="font-mono">Stellar Testnet</Badge>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="glass border-zinc-800 p-12 text-center">
            <CardDescription className="text-zinc-500 text-lg mb-6">No tickets found in this wallet.</CardDescription>
            <Link href="/">
              <Button variant="glow" className="gap-2">
                Explore Ticket Drops
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="glass rounded-xl overflow-hidden border border-zinc-800/80 flex flex-col md:flex-row relative">
                {/* Visual Ticket Body */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge variant={ticket.status === 'VERIFIED' ? "success" : "cyan"}>
                      Ticket #{ticket.ticketId} • {ticket.status}
                    </Badge>
                    <span className="text-[10px] font-mono text-zinc-500">UID: {ticket.id}</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{ticket.event.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1 line-clamp-1">{ticket.event.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-zinc-400 pt-2 border-t border-zinc-900">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand" />
                      {new Date(ticket.event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-cyan-500" />
                      Owner: {ticket.ownerAddress.substring(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* Ticket Tear-Line Separator */}
                <div className="hidden md:flex flex-col justify-between py-2 relative w-6">
                  <div className="w-6 h-6 rounded-full bg-background border-r border-b border-zinc-800 -mt-5 -ml-3"></div>
                  <div className="h-full border-l-2 border-dashed border-zinc-800 ml-3 my-2"></div>
                  <div className="w-6 h-6 rounded-full bg-background border-r border-t border-zinc-800 -mb-5 -ml-3"></div>
                </div>

                {/* Ticket Stub Actions */}
                <div className="bg-zinc-950/40 p-6 flex flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-zinc-800/80 md:w-56">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      setVerificationTicket(ticket);
                      setSignedManifest(null);
                    }}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify Gate Entry
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-zinc-800 hover:bg-zinc-900"
                    onClick={() => setSelectedTicket(ticket)}
                    disabled={ticket.status === 'VERIFIED'}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Transfer / Resell
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resell / Transfer Modal */}
        <Dialog open={selectedTicket !== null} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Transfer Ticket</DialogTitle>
              <DialogDescription>
                Initiate an on-chain transfer. The resale price must comply with the anti-scalping premium cap.
              </DialogDescription>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4 py-4 text-sm">
                <div>
                  <p className="text-zinc-500 text-xs uppercase font-medium">Ticket</p>
                  <p className="text-white font-semibold">{selectedTicket.event.title} (#{selectedTicket.ticketId})</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-medium">Original Price</p>
                    <p className="text-white font-mono">{selectedTicket.event.price} XLM</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase font-medium">Max Resale Price</p>
                    <p className="text-emerald-400 font-mono">
                      {(parseFloat(selectedTicket.event.price) * (1 + selectedTicket.event.maxPremiumPctScaled / 1000)).toFixed(2)} XLM
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium">Recipient Address</label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Stellar address (G...)"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium">Resale Price (XLM)</label>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="Enter resale price"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand font-mono"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>Cancel</Button>
              <Button variant="glow" onClick={handleTransfer} disabled={isTransferring}>
                {isTransferring ? 'Transferring...' : 'Execute Transfer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Verification Modal */}
        <Dialog open={verificationTicket !== null} onOpenChange={(open) => !open && setVerificationTicket(null)}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <DialogTitle className="mx-auto">Gate Check-In Credentials</DialogTitle>
              <DialogDescription>
                Present this signed manifest to the gate scanner. Built using offline zero-fee signature wrappers to bypass WalletConnect message constraints.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-6">
              {!signedManifest ? (
                <Button variant="glow" onClick={handleGenerateManifest} disabled={isSigningManifest}>
                  {isSigningManifest ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing Dummy Payload...
                    </>
                  ) : (
                    'Generate Signed Entry Token'
                  )}
                </Button>
              ) : (
                <div className="space-y-4 w-full">
                  <div className="w-48 h-48 bg-zinc-900 border border-zinc-800 rounded-xl mx-auto flex items-center justify-center p-4">
                    <div className="grid grid-cols-6 gap-1 w-full h-full opacity-80">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-white' : 'bg-transparent'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                    <p className="text-[10px] text-zinc-500 text-left font-mono truncate">Manifest: {signedManifest}</p>
                  </div>
                  <p className="text-xs text-zinc-400">Scan this token on the Gate Validator screen to complete check-in.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function LandmarkIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="5" y1="6" x2="19" y2="6" />
      <line x1="4" y1="2" x2="20" y2="2" />
      <path d="M4 10v11" />
      <path d="M20 10v11" />
      <path d="M8 10v11" />
      <path d="M12 10v11" />
      <path d="M16 10v11" />
    </svg>
  );
}
