"use client";
import React, { useEffect, useState } from "react";
import { CalendarDays, Ticket, CheckCircle, Activity, ArrowUpRight } from "lucide-react";
import { useWallet } from "../../../context/WalletContext";
import { DashboardHeader } from "../../../components/Dashboard/DashboardHeader";
import { StatCard } from "../../../components/Dashboard/StatCard";

interface UserStats {
  eventsOrganized: number;
  ticketsOwned: number;
  ticketsVerified: number;
}

export default function OverviewPage() {
  const { apiFetch, address } = useWallet();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    async function load() {
      try {
        const [me, tickets] = await Promise.all([
          apiFetch("/users/me"),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/events/tickets?address=${address}`
          ).then((r) => r.json()),
        ]);
        setStats(me.stats);
        setRecentTickets(Array.isArray(tickets) ? tickets.slice(0, 5) : []);
      } catch {
        // Backend may be offline; show zeros
        setStats({ eventsOrganized: 0, ticketsOwned: 0, ticketsVerified: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [address, apiFetch]);

  return (
    <div>
      <DashboardHeader
        title="Overview"
        subtitle="Welcome back! Here's what's happening with your account."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Events Organized"
          value={stats?.eventsOrganized ?? 0}
          icon={CalendarDays}
          loading={loading}
          trend="All-time"
          gradient="from-pink-500 to-fuchsia-600"
        />
        <StatCard
          label="Tickets Owned"
          value={stats?.ticketsOwned ?? 0}
          icon={Ticket}
          loading={loading}
          trend="In your wallet"
          gradient="from-violet-500 to-indigo-600"
        />
        <StatCard
          label="Tickets Verified"
          value={stats?.ticketsVerified ?? 0}
          icon={CheckCircle}
          loading={loading}
          trend="Check-ins completed"
          trendUp={(stats?.ticketsVerified ?? 0) > 0}
          gradient="from-emerald-400 to-cyan-500"
        />
      </div>

      {/* Recent Tickets */}
      <div className="glass rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-fuchsia-400" />
            Recent Tickets
          </h2>
          <a
            href="/dashboard/tickets"
            className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-white/[0.05] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="text-center py-10 text-zinc-600 text-sm">
            No tickets yet. Purchase your first ticket from the{" "}
            <a href="/" className="text-fuchsia-400 hover:underline">event drops</a>.
          </div>
        ) : (
          <ul className="space-y-3">
            {recentTickets.map((t: any) => (
              <li
                key={t.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10 text-sm"
              >
                <div>
                  <p className="font-semibold text-white text-xs leading-tight">
                    {t.event?.title ?? "Unknown Event"}
                  </p>
                  <p className="text-zinc-500 text-[11px]">Ticket #{t.ticketId}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    t.status === "MINTED"
                      ? "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-300"
                      : t.status === "VERIFIED"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-blue-500/15 border-blue-500/30 text-blue-300"
                  }`}
                >
                  {t.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
