"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { useWallet } from "../../context/WalletContext";
import { AuthLanding } from "../../components/App/Auth/AuthLanding";
import { WalletList } from "../../components/App/Auth/WalletList";
import { Loader2 } from "lucide-react";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnecting, connectWithId, getSupportedWallets } =
    useWallet();

  const [state, setState] = useState<"landing" | "wallet-list">("landing");
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (address) {
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    }
  }, [address, router, searchParams]);

  // Load supported wallets on mount
  useEffect(() => {
    async function loadWallets() {
      setIsLoadingWallets(true);
      try {
        const list = await getSupportedWallets();
        setWallets(list);
      } catch (err: any) {
        console.error("Failed to load supported wallets:", err);
      } finally {
        setIsLoadingWallets(false);
      }
    }
    loadWallets();
  }, [getSupportedWallets]);

  const handleSelectWallet = async (wallet: any) => {
    if (!wallet.isAvailable && wallet.url) {
      // If extension not installed, open download link
      window.open(wallet.url, "_blank");
      return;
    }

    setErrorMsg(null);
    try {
      await connectWithId(wallet.id);
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMsg(err.message || `Could not connect to ${wallet.name}.`);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      <Header />

      {/* Backdrop image */}
      <div className="absolute inset-0 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1920&q=70"
          alt=""
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Background Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[110px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none animate-pulse-slow"></div>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="relative overflow-hidden w-full max-w-md h-[480px] glass-strong rounded-3xl border border-white/10 shadow-2xl shadow-fuchsia-500/10 ring-gradient">
          {/* PANEL 1: Landing State */}
          <div
            className={`absolute inset-0 w-full h-full p-8 transition-all duration-500 ease-in-out ${
              state === "landing"
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <AuthLanding onConnectWalletClick={() => setState("wallet-list")} />
          </div>

          {/* PANEL 2: Wallet Selection List */}
          <div
            className={`absolute inset-0 w-full h-full p-8 flex flex-col transition-all duration-500 ease-in-out ${
              state === "wallet-list"
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <WalletList
              wallets={wallets}
              isLoadingWallets={isLoadingWallets}
              isConnecting={isConnecting}
              errorMsg={errorMsg}
              onBackClick={() => {
                setState("landing");
                setErrorMsg(null);
              }}
              onSelectWallet={handleSelectWallet}
            />

            {/* Global connection overlay */}
            {isConnecting && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 glow-brand">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </span>
                <p className="text-sm font-bold text-white">
                  Authenticating...
                </p>
                <p className="text-[11px] text-zinc-400 text-center px-8">
                  Please open your wallet extension and sign the cryptographic
                  challenge transaction to log in.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-brand animate-spin" />
          </div>
          <Footer />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
