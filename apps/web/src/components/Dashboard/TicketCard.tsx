import React from "react";
import { CalendarDays, MapPin, Hash, CheckCircle, ArrowRightLeft, Zap } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  MINTED: "bg-brand/10 border-brand/25 text-brand",
  TRANSFERRED: "bg-blue-500/10 border-blue-500/25 text-blue-400",
  VERIFIED: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
  EXPIRED: "bg-zinc-700/30 border-zinc-600/30 text-zinc-500",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  MINTED: Zap,
  TRANSFERRED: ArrowRightLeft,
  VERIFIED: CheckCircle,
  EXPIRED: Hash,
};

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
  const statusStyle = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.EXPIRED;

  return (
    <div className="glass rounded-2xl border border-zinc-800/60 overflow-hidden hover:border-zinc-700/60 transition-all duration-200 group relative">
      {/* Ticket tear-line decoration */}
      <div className="absolute left-0 right-0 top-[140px] flex items-center pointer-events-none z-10">
        <div className="w-4 h-4 rounded-full bg-background border border-zinc-800/80 -ml-2" />
        <div className="flex-1 border-t border-dashed border-zinc-700/60" />
        <div className="w-4 h-4 rounded-full bg-background border border-zinc-800/80 -mr-2" />
      </div>

      {/* Cover */}
      <div className="h-36 bg-zinc-900 relative overflow-hidden">
        {coverImg ? (
          <img
            src={coverImg}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand/10 to-zinc-900 flex items-center justify-center">
            <div className="text-4xl font-black text-brand/30">#{ticket.ticketId}</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
        {/* Status badge */}
        <div
          className={`absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle}`}
        >
          <StatusIcon className="w-2.5 h-2.5" />
          {ticket.status}
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
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {ticket.txHash && (
          <p className="text-[10px] font-mono text-zinc-600 truncate border-t border-zinc-800/60 pt-2">
            tx: {ticket.txHash.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
};
