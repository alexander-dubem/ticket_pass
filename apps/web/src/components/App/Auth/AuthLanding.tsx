import React from "react";
import { Button } from "../../ui/button";
import { Wallet, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";
import { TicketGraphic } from "./TicketGraphic";

interface AuthLandingProps {
  onConnectWalletClick: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onConnectWalletClick,
}) => {
  return (
    <div className="text-center space-y-6 w-full h-full flex flex-col justify-between">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 via-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/30 text-fuchsia-300 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>On-Chain Ticket Pass</span>
        </div>

        <h2 className="text-2xl font-black text-white tracking-tight">
          Welcome to the{" "}
          <span className="text-gradient">Front Row</span>
        </h2>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
          Authenticate cryptographically using Stellar SEP-10 to access your
          ticket wallet. Passwordless, wallet-only.
        </p>
      </div>

      <div className="flex justify-center py-2">
        <TicketGraphic />
      </div>

      <div className="space-y-3">
        <Button
          variant="glow"
          className="w-full py-6 font-bold text-sm tracking-wide gap-2 group cursor-pointer"
          onClick={onConnectWalletClick}
        >
          <Wallet className="w-4 h-4 transition-transform group-hover:scale-110" />
          Connect Wallet
          <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform" />
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          SEP-10 challenge-response · your keys, your tickets
        </p>
      </div>
    </div>
  );
};
