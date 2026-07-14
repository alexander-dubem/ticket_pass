import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  loading,
}) => {
  return (
    <div className="glass rounded-2xl border border-zinc-800/60 p-5 flex flex-col gap-3 hover:border-zinc-700/60 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center group-hover:bg-brand/15 transition-colors">
          <Icon className="w-4 h-4 text-brand" />
        </div>
      </div>

      {loading ? (
        <div className="h-8 w-24 bg-zinc-800/60 rounded-lg animate-pulse" />
      ) : (
        <p className="text-3xl font-black text-white tabular-nums">{value}</p>
      )}

      {trend && (
        <p
          className={`text-xs font-medium ${
            trendUp ? "text-emerald-400" : "text-zinc-500"
          }`}
        >
          {trend}
        </p>
      )}
    </div>
  );
};
