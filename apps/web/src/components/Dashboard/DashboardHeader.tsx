"use client";
import React from "react";
import { useWallet } from "../../context/WalletContext";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
}) => {
  const { address } = useWallet();

  const truncate = (addr: string) =>
    `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {address && (
        <span className="self-start sm:self-center text-xs font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-lg">
          {truncate(address)}
        </span>
      )}
    </div>
  );
};
