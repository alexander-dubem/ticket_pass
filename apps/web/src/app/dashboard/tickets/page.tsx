"use client";
import React, { useEffect, useState } from "react";
import { Loader2, Ticket as TicketIcon, Filter } from "lucide-react";
import { useWallet } from "../../../context/WalletContext";
import { DashboardHeader } from "../../../components/Dashboard/DashboardHeader";
import { TicketCard } from "../../../components/Dashboard/TicketCard";

const STATUSES = ["ALL", "MINTED", "TRANSFERRED", "VERIFIED"];

export default function TicketsPage() {
  const { address } = useWallet();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!address) return;
    const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    fetch(`${BACKEND}/events/tickets?address=${address}`)
      .then((r) => r.json())
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, [address]);

  const filtered =
    filter === "ALL" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div>
      <DashboardHeader
        title="Manage Tickets"
        subtitle="All on-chain tickets associated with your wallet."
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filter === s
                ? "bg-brand/15 border-brand/30 text-brand"
                : "bg-zinc-900/40 border-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            }`}
          >
            {s === "ALL"
              ? `All (${tickets.length})`
              : `${s} (${tickets.filter((t) => t.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-zinc-800/60 p-12 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
            <TicketIcon className="w-8 h-8 text-brand" />
          </div>
          <div>
            <p className="text-white font-bold">
              {filter === "ALL" ? "No tickets yet" : `No ${filter} tickets`}
            </p>
            <p className="text-zinc-500 text-sm mt-1">
              {filter === "ALL"
                ? "Purchase tickets from the event drops to see them here."
                : "Try selecting a different filter."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
