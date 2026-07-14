"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "../../components/Header";
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
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Background Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="relative overflow-hidden w-full max-w-md h-[480px] glass rounded-2xl border border-zinc-800/80 shadow-2xl">
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
              <div className="absolute inset-0 bg-background/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-brand animate-spin" />
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
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
