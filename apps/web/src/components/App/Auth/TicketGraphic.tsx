import React from 'react';

export const TicketGraphic: React.FC = () => {
  return (
    <svg className="w-48 h-32 text-zinc-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.15)]" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ticketGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Ticket shape */}
      <path d="M20 20C20 14.4772 24.4772 10 30 10H170C175.523 10 180 14.4772 180 20V45C174.477 45 170 49.4772 170 55C170 60.5228 174.477 65 180 65V90C180 95.5228 175.523 100 170 100H30C24.4772 100 20 95.5228 20 90V65C25.5228 65 30 60.5228 30 55C30 49.4772 25.5228 45 20 45V20Z" fill="url(#ticketGlow)" stroke="url(#strokeGradient)" strokeWidth="1.5" />

      {/* Tear line */}
      <line x1="140" y1="12" x2="140" y2="98" stroke="#1f2937" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Ticket Details */}
      <rect x="40" y="30" width="60" height="8" rx="4" fill="#27272a" />
      <rect x="40" y="45" width="40" height="6" rx="3" fill="#18181b" />
      
      {/* Checkmark Node */}
      <circle cx="50" cy="75" r="12" fill="#10b981" fillOpacity="0.2" />
      <path d="M46 75L49 78L55 72" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="68" y="72" width="30" height="6" rx="3" fill="#18181b" />

      {/* On-chain floating transaction/contract indicator */}
      <circle cx="160" cy="35" r="8" fill="#06b6d4" fillOpacity="0.2" />
      <path d="M157 35H163M160 32V38" stroke="#06b6d4" strokeWidth="1.2" strokeLinecap="round" />

      <circle cx="160" cy="70" r="10" fill="#27272a" />
      <rect x="156" y="66" width="8" height="8" fill="#10b981" rx="1.5" />
    </svg>
  );
};
