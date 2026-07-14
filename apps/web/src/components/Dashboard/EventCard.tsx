import React from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Users,
  Ticket,
  Globe,
  EyeOff,
  Pencil,
} from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: string;
    location: string;
    capacity: number;
    price: string;
    isPublished: boolean;
    images?: string[];
    category?: string;
    _count?: { tickets: number };
  };
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const dateStr = new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const sold = event._count?.tickets ?? 0;
  const pctSold = Math.round((sold / event.capacity) * 100);
  const coverImg = event.images?.[0];

  return (
    <div className="glass rounded-2xl border border-zinc-800/60 overflow-hidden hover:border-zinc-700/60 transition-all duration-200 group flex flex-col">
      {/* Cover Image / Placeholder */}
      <div className="h-36 bg-zinc-900 relative overflow-hidden shrink-0">
        {coverImg ? (
          <img
            src={coverImg}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
            <CalendarDays className="w-10 h-10 text-zinc-700" />
          </div>
        )}
        {/* Status Badge */}
        <div
          className={`absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            event.isPublished
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-zinc-700/50 border-zinc-600/40 text-zinc-400"
          }`}
        >
          {event.isPublished ? (
            <>
              <Globe className="w-2.5 h-2.5" /> Live
            </>
          ) : (
            <>
              <EyeOff className="w-2.5 h-2.5" /> Draft
            </>
          )}
        </div>
        {event.category && (
          <div className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/20 border border-brand/30 text-brand">
            {event.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-1.5 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ticket className="w-3.5 h-3.5 shrink-0" />
            <span>{event.price} XLM</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {sold}/{event.capacity} sold
            </span>
            <span>{pctSold}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500"
              style={{ width: `${pctSold}%` }}
            />
          </div>
        </div>

        {/* Edit action */}
        <Link
          href={`/dashboard/events/${event.id}/edit`}
          className="mt-1 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800/60 border border-zinc-800/60 hover:border-zinc-700 rounded-xl py-2 transition-all cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Event
        </Link>
      </div>
    </div>
  );
};
