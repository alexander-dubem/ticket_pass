import React from 'react';

export const TicketGraphic: React.FC = () => {
  return (
    <svg
      className="w-48 h-32 text-zinc-300 drop-shadow-[0_0_20px_rgba(217,70,239,0.25)]"
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ticketFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.32" />
          <stop offset="50%" stopColor="#d946ef" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {/* Ticket shape */}
      <path
        d="M20 20C20 14.4772 24.4772 10 30 10H170C175.523 10 180 14.4772 180 20V45C174.477 45 170 49.4772 170 55C170 60.5228 174.477 65 180 65V90C180 95.5228 175.523 100 170 100H30C24.4772 100 20 95.5228 20 90V65C25.5228 65 30 60.5228 30 55C30 49.4772 25.5228 45 20 45V20Z"
        fill="url(#ticketFill)"
        stroke="url(#strokeGradient)"
        strokeWidth="1.5"
      />

      {/* Tear line */}
      <line x1="140" y1="12" x2="140" y2="98" stroke="#2c2a3a" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Event title bars */}
      <rect x="40" y="30" width="60" height="8" rx="4" fill="#3d3a52" />
      <rect x="40" y="45" width="40" height="6" rx="3" fill="#2c2a3a" />

      {/* Crypto coin node */}
      <circle cx="50" cy="75" r="12" fill="#fbbf24" fillOpacity="0.22" />
      <circle cx="50" cy="75" r="8" fill="#fbbf24" fillOpacity="0.4" />
      <path d="M50 69V81M47 72H53M47 78H53" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="68" y="72" width="30" height="6" rx="3" fill="#2c2a3a" />

      {/* On-chain transaction/contract indicators */}
      <circle cx="160" cy="35" r="8" fill="#22d3ee" fillOpacity="0.22" />
      <path d="M157 35H163M160 32V38" stroke="#22d3ee" strokeWidth="1.2" strokeLinecap="round" />

      {/* QR block */}
      <circle cx="160" cy="70" r="11" fill="#1d1b29" stroke="#a855f7" strokeOpacity="0.5" />
      <g fill="#d946ef">
        <rect x="154" y="64" width="3" height="3" rx="0.5" />
        <rect x="161" y="64" width="3" height="3" rx="0.5" />
        <rect x="154" y="71" width="3" height="3" rx="0.5" />
        <rect x="161" y="71" width="3" height="3" rx="0.5" />
        <rect x="157.5" y="67" width="3" height="3" rx="0.5" />
      </g>

      {/* Sparkles */}
      <path d="M36 22L37 26L41 27L37 28L36 32L35 28L31 27L35 26Z" fill="#fbbf24" fillOpacity="0.8" />
      <path d="M168 92L169 95L172 96L169 97L168 100L167 97L164 96L167 95Z" fill="#22d3ee" fillOpacity="0.8" />
    </svg>
  );
};
