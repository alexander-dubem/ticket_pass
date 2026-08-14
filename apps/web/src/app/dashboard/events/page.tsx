"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { useWallet } from "../../../context/WalletContext";
import { EventCard } from "../../../components/Dashboard/EventCard";
import { Button } from "../../../components/ui/button";
import { Spinner } from "../../../components/ui/spinner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../../components/ui/empty";

export default function EventsPage() {
  const { address, apiFetch } = useWallet();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    fetch(`${BACKEND}/events?organizer=${address}`)
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [address, apiFetch]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Manage Events</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Create and manage your on-chain ticket drop events.
          </p>
        </div>
        <Link href="/dashboard/events/new">
          <Button variant="glow" className="gap-2 cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner className="size-8 text-fuchsia-500" />
        </div>
      ) : events.length === 0 ? (
        <Empty className="glass rounded-2xl border-white/10 p-12">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-fuchsia-500/30">
              <CalendarDays className="size-8 text-fuchsia-400" />
            </EmptyMedia>
            <EmptyContent>
              <EmptyTitle className="text-base">No events yet</EmptyTitle>
              <EmptyDescription>
                Create your first on-chain ticket drop event to get started.
              </EmptyDescription>
              <Link href="/dashboard/events/new">
                <Button variant="glow" className="gap-2 cursor-pointer">
                  <Plus className="w-4 h-4" />
                  Create Event
                </Button>
              </Link>
            </EmptyContent>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
