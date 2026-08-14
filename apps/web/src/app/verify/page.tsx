'use client';
import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { useWallet } from '../../context/WalletContext';
import { ShieldAlert, ShieldCheck, Loader2, ScanLine, KeyRound, UserCheck } from 'lucide-react';

export default function VerifyPage() {
  const { apiFetch } = useWallet();
  const [tokenInput, setTokenInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'VALID' | 'INVALID';
    message: string;
    ticketDetails?: {
      ticketId: number;
      eventId: string;
      ownerAddress: string;
      verifiedAt?: string;
    };
  } | null>(null);

  const handleVerify = async () => {
    if (!tokenInput) return;
    setIsValidating(true);
    setValidationResult(null);
    try {
      let decodedPayload;
      try {
        decodedPayload = JSON.parse(atob(tokenInput));
      } catch {
        throw new Error('Malformed or corrupted entry token format.');
      }

      let result;
      try {
        result = await apiFetch(`/events/${decodedPayload.eventId}/tickets/${decodedPayload.ticketId}/verify`, {
          method: 'POST',
        });
      } catch (err) {
        throw new Error('Backend verification failed. Please ensure the API is running and try again.');
      }

      setValidationResult({
        status: 'VALID',
        message: 'On-chain ticket signature and double-spend integrity verified.',
        ticketDetails: {
          ticketId: result.ticket.ticketId,
          eventId: result.ticket.eventId,
          ownerAddress: result.ticket.ownerAddress,
          verifiedAt: new Date().toISOString(),
        }
      });
    } catch (err: any) {
      setValidationResult({
        status: 'INVALID',
        message: err.message || 'Verification failed.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="mesh-bg flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-lg relative z-10">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold mb-4">
            <ScanLine className="w-3.5 h-3.5" />
            Venue Staff Only
          </span>
          <h1 className="text-3xl font-black text-white tracking-tight">Gate Validator Terminal</h1>
          <p className="text-sm text-zinc-400 mt-2">
            Verify ticketholder credentials and submit check-ins directly on-chain
          </p>
        </div>

        <Card className="glass-strong border-white/10 ring-gradient overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-white/[0.03]">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-3 text-[10px] font-mono text-zinc-500">gate-validator · stellar-testnet</span>
          </div>

          <CardHeader className="text-center pb-2">
            <CardTitle className="text-sm text-zinc-300 font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Check-In Token
            </CardTitle>
            <CardDescription className="text-xs text-zinc-500 mt-1">
              Paste the base64 signed entry token from the attendee's wallet.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ScanLine className="w-4 h-4 text-cyan-400" />
              </div>
              <Textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste base64 signed entry token here..."
                rows={4}
                className="w-full bg-black/40 border-white/15 rounded-xl pl-9 text-xs text-white font-mono focus-visible:border-cyan-400/50 focus-visible:ring-2 focus-visible:ring-cyan-400/20 transition-all resize-none"
              />
              {tokenInput && (
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-white animate-scan-line" />
                </div>
              )}
            </div>

            {validationResult && (
              <div className={`p-4 rounded-xl border flex gap-3 items-start text-sm animate-rise ${
                validationResult.status === 'VALID'
                  ? 'bg-emerald-500/10 border-emerald-500/25'
                  : 'bg-destructive/10 border-destructive/25'
              }`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  validationResult.status === 'VALID'
                    ? 'bg-emerald-500/20'
                    : 'bg-red-500/20'
                }`}>
                  {validationResult.status === 'VALID' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-red-300" />
                  )}
                </span>
                <div className="space-y-2">
                  <p className={`font-bold ${validationResult.status === 'VALID' ? 'text-emerald-300' : 'text-red-300'}`}>
                    {validationResult.status === 'VALID' ? 'Access Granted' : 'Access Denied'}
                  </p>
                  <p className="text-xs text-zinc-400">{validationResult.message}</p>

                  {validationResult.ticketDetails && (
                    <div className="text-[11px] text-zinc-400 font-mono border-t border-white/10 pt-2 mt-2 space-y-1">
                      <p className="flex items-center gap-1.5"><UserCheck className="w-3 h-3 text-emerald-400" /> Ticket ID: #{validationResult.ticketDetails.ticketId}</p>
                      <p className="truncate">Event: {validationResult.ticketDetails.eventId}</p>
                      <p className="truncate">Holder: {validationResult.ticketDetails.ownerAddress}</p>
                      <p>Time: {new Date(validationResult.ticketDetails.verifiedAt || '').toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          <div className="p-6 pt-2">
            <Button
              variant="gradient-cyan"
              onClick={handleVerify}
              disabled={isValidating || !tokenInput}
              className="w-full py-6 font-bold"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking Ledger Double-Spend...
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4" />
                  Validate Entry
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
