"use client";
import React, { useEffect, useState } from "react";
import { Ticket as TicketIcon } from "lucide-react";
import { useWallet } from "../../../context/WalletContext";
import { DashboardHeader } from "../../../components/Dashboard/DashboardHeader";
import { TicketCard } from "../../../components/Dashboard/TicketCard";
import { Spinner } from "../../../components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../../components/ui/empty";

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
      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(String(value ?? "ALL"))}
        className="mb-6"
      >
        <TabsList className="w-full sm:w-fit h-10 bg-white/[0.03] border border-white/10 rounded-lg p-1">
          {STATUSES.map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              className="text-xs font-semibold px-3 py-1.5 rounded-md data-active:bg-gradient-to-r data-active:from-pink-500/20 data-active:to-violet-500/20 data-active:border-fuchsia-500/40 data-active:text-fuchsia-300"
            >
              {s === "ALL"
                ? `All (${tickets.length})`
                : `${s} (${tickets.filter((t) => t.status === s).length})`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner className="size-8 text-fuchsia-500" />
        </div>
      ) : filtered.length === 0 ? (
        <Empty className="glass rounded-2xl border-white/10 p-12">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-fuchsia-500/30">
              <TicketIcon className="size-8 text-fuchsia-400" />
            </EmptyMedia>
            <EmptyContent>
              <EmptyTitle className="text-base">
                {filter === "ALL" ? "No tickets yet" : `No ${filter} tickets`}
              </EmptyTitle>
              <EmptyDescription>
                {filter === "ALL"
                  ? "Purchase tickets from the event drops to see them here."
                  : "Try selecting a different filter."}
              </EmptyDescription>
            </EmptyContent>
          </EmptyHeader>
        </Empty>
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
