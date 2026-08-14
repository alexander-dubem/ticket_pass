import React from "react";
import { CalendarDays, MapPin, Hash, CheckCircle, ArrowRightLeft, Zap, Ticket } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  MINTED: "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-300",
  TRANSFERRED: "bg-blue-500/15 border-blue-500/30 text-blue-300",
  VERIFIED: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  EXPIRED: "bg-zinc-700/30 border-zinc-600/30 text-zinc-500",
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
  const statusStyle = STATUS_STYLES[ticket.status] ?? STATUS_STYLES.EXPIRED;
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
          <img
            src={coverImg}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
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
        <div
          className={`absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm ${statusStyle}`}
        >
          <StatusIcon className="w-2.5 h-2.5" />
          {ticket.status}
        </div>
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
          <p className="text-[10px] font-mono text-zinc-600 truncate border-t border-white/10 pt-2">
            tx: {ticket.txHash.substring(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
};
