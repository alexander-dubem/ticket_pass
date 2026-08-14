import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
  gradient?: string;
}

const DEFAULT_GRADIENTS = [
  "from-pink-500 to-fuchsia-600",
  "from-violet-500 to-indigo-600",
  "from-cyan-400 to-sky-600",
  "from-amber-400 to-rose-500",
];

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  loading,
  gradient,
}) => {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5 flex flex-col gap-3 hover:border-fuchsia-400/30 hover:shadow-fuchsia-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
        <div className={cn(
          "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center group-hover:scale-110 transition-transform",
          gradient || DEFAULT_GRADIENTS[0]
        )}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>

      {loading ? (
        <div className="h-9 w-24 bg-white/[0.06] rounded-lg animate-pulse" />
      ) : (
        <p className="text-3xl font-black text-white tabular-nums">{value}</p>
      )}

      {trend && (
        <p
          className={cn(
            "text-xs font-medium",
            trendUp ? "text-emerald-400" : "text-zinc-500"
          )}
        >
          {trend}
        </p>
      )}
    </div>
  );
};
