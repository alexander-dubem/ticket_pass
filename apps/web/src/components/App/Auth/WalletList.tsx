import React from "react";
import {
  ArrowLeft,
  Loader2,
  Download,
  ChevronRight,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { Badge } from "../../ui/badge";

interface WalletListProps {
  wallets: any[];
  isLoadingWallets: boolean;
  isConnecting: boolean;
  errorMsg: string | null;
  onBackClick: () => void;
  onSelectWallet: (wallet: any) => void;
}

export const WalletList: React.FC<WalletListProps> = ({
  wallets,
  isLoadingWallets,
  isConnecting,
  errorMsg,
  onBackClick,
  onSelectWallet,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBackClick}
          className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-white leading-none">
            Select a Wallet
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">
            Choose your preferred Stellar identity provider
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-xs text-red-300 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 custom-scrollbar">
        {isLoadingWallets ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
            <span className="text-xs text-zinc-500">
              Querying browser extensions...
            </span>
          </div>
        ) : (
          wallets.map((wallet) => (
            <button
              key={wallet.id}
              disabled={isConnecting}
              onClick={() => onSelectWallet(wallet)}
              className="w-full text-left p-3 rounded-xl bg-white/[0.04] hover:bg-gradient-to-r hover:from-pink-500/10 hover:via-fuchsia-500/10 hover:to-violet-500/10 border border-white/10 hover:border-fuchsia-400/40 transition-all flex items-center justify-between group disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center p-1 border border-white/10 text-white shrink-0 overflow-hidden">
                  {wallet.icon && wallet.icon.trim().startsWith("<svg") ? (
                    <div
                      className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current"
                      dangerouslySetInnerHTML={{ __html: wallet.icon }}
                    />
                  ) : (
                    <img
                      src={wallet.icon}
                      alt={wallet.name}
                      className="w-full h-full object-contain rounded"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{wallet.name}</p>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wide font-medium mt-0.5">
                    {wallet.type}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {wallet.isAvailable ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-semibold text-emerald-400">Ready</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1.5 py-0 border-white/15 text-zinc-500 font-normal flex items-center gap-1 group-hover:border-zinc-500 transition-colors"
                  >
                    <Download className="w-2.5 h-2.5" />
                    <span>Get</span>
                  </Badge>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] text-zinc-600">
        <Wallet className="w-3 h-3 text-fuchsia-500" />
        <span>Wallets never expose your secret keys to Drip Wave.</span>
      </div>
    </div>
  );
};
