import React from "react";
import Image from "next/image";
import { CalendarDays, MapPin, Hash, CheckCircle, ArrowRightLeft, Zap, Ticket } from "lucide-react";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";

const STATUS_VARIANT: Record<string, "fuchsia" | "cyan" | "success" | "outline"> = {
  MINTED: "fuchsia",
  TRANSFERRED: "cyan",
  VERIFIED: "success",
  EXPIRED: "outline",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  MINTED: Zap,
  TRANSFERRED: ArrowRightLeft,
  VERIFIED: CheckCircle,
  EXPIRED: Hash,
};

const COVER_GRADIENTS = [
  "from-rose-500 via-pink-500 to-fuchsia-500",
  "from-violet-500 via-purple-500 to-cyan-400",
  "from-amber-400 via-rose-500 to-pink-500",
  "from-cyan-400 via-sky-500 to-violet-500",
];

interface TicketCardProps {
  ticket: {
    id: string;
    ticketId: number;
    status: string;
    txHash?: string | null;
    createdAt: string;
    event: {
      title: string;
      date: string;
      location: string;
      images?: string[];
    };
  };
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const { event } = ticket;
  const dateStr = new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const coverImg = event.images?.[0];
  const StatusIcon = STATUS_ICONS[ticket.status] ?? Hash;
  const grad = COVER_GRADIENTS[ticket.ticketId % COVER_GRADIENTS.length];

  return (
    <div className="glass glass-hover rounded-2xl border border-white/10 overflow-hidden group relative">
      {/* Ticket tear-line decoration */}
      <div className="absolute left-0 right-0 top-[140px] flex items-center pointer-events-none z-10">
        <div className="w-4 h-4 rounded-full bg-background border border-white/15 -ml-2" />
        <div className="flex-1 border-t border-dashed border-white/20" />
        <div className="w-4 h-4 rounded-full bg-background border border-white/15 -mr-2" />
      </div>

      {/* Cover */}
      <div className="h-36 relative overflow-hidden">
        {coverImg ? (
          <Image
            src={coverImg}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${grad} relative`}>
            <div className="absolute inset-0 bg-grid opacity-40 mix-blend-overlay" />
            <div className="w-full h-full flex items-center justify-center">
              <Ticket className="w-8 h-8 text-white/70" />
              <span className="absolute bottom-2 right-3 text-2xl font-black text-white/30">#{ticket.ticketId}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {/* Status badge */}
        <Badge
          variant={STATUS_VARIANT[ticket.status] ?? "outline"}
          className="absolute top-3 right-3 gap-1 backdrop-blur-sm"
        >
          <StatusIcon className="w-2.5 h-2.5" />
          {ticket.status}
        </Badge>
        <div className="absolute bottom-2 left-3 text-[9px] font-mono text-white/60 tracking-widest">
          DRIP WAVE · {dateStr.toUpperCase()}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 pt-5 space-y-3">
        <div>
          <p className="text-xs text-zinc-500 font-medium mb-0.5">Ticket #{ticket.ticketId}</p>
          <h3 className="font-bold text-white text-sm leading-tight line-clamp-2">
            {event.title}
          </h3>
        </div>

        <div className="space-y-1 text-xs text-zinc-500">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 shrink-0 text-fuchsia-400" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {ticket.txHash && (
          <div className="text-[10px] font-mono text-zinc-600 truncate">
            <Separator className="mb-2 bg-white/10" />
            tx: {ticket.txHash.substring(0, 20)}...
          </div>
        )}
      </div>
    </div>
  );
};
