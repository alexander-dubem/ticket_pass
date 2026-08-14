import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Users,
  Globe,
  EyeOff,
  Pencil,
  Coins,
  Sparkle,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress, ProgressIndicator, ProgressTrack } from "../ui/progress";

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

const COVER_GRADIENTS = [
  "from-rose-500 via-pink-500 to-fuchsia-500",
  "from-violet-500 via-purple-500 to-cyan-400",
  "from-amber-400 via-rose-500 to-pink-500",
  "from-cyan-400 via-sky-500 to-violet-500",
  "from-fuchsia-500 via-violet-500 to-indigo-500",
];

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const dateStr = new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const sold = event._count?.tickets ?? 0;
  const pctSold = Math.round((sold / event.capacity) * 100);
  const coverImg = event.images?.[0];
  const grad = COVER_GRADIENTS[(sold + event.capacity) % COVER_GRADIENTS.length];

  return (
    <div className="glass glass-hover rounded-2xl border border-white/10 overflow-hidden group flex flex-col">
      {/* Cover Image / Placeholder */}
      <div className="h-36 relative overflow-hidden shrink-0">
        {coverImg ? (
          <Image
            src={coverImg}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${grad} relative`}>
            <div className="absolute inset-0 bg-grid opacity-40 mix-blend-overlay" />
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm">
                <Sparkle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {/* Status Badge */}
        <Badge
          className="absolute top-3 right-3 gap-1 backdrop-blur-sm"
          variant={event.isPublished ? "success" : "outline"}
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
        </Badge>
        {event.category && (
          <Badge
            variant="gradient"
            className="absolute top-3 left-3 border-white/20"
          >
            {event.category}
          </Badge>
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
            <Coins className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="font-mono">{event.price} XLM</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {sold}/{event.capacity} sold
            </span>
            <span className="text-gradient font-bold">{pctSold}%</span>
          </div>
          <Progress value={pctSold} className="gap-0">
            <ProgressTrack className="h-1.5 bg-white/[0.06]">
              <ProgressIndicator className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500" />
            </ProgressTrack>
          </Progress>
        </div>

        {/* Edit action */}
        <Link href={`/dashboard/events/${event.id}/edit`} className="mt-1">
          <Button
            variant="ghost"
            className="w-full gap-2 text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-fuchsia-400/40 rounded-xl"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Event
          </Button>
        </Link>
      </div>
    </div>
  );
};
