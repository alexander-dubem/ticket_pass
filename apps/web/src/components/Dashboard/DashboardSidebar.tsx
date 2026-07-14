"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  CalendarDays,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Disc,
  LogOut,
} from "lucide-react";
import { useWallet } from "../../context/WalletContext";

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "Manage Events",
    href: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    label: "Manage Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
  },
];

export const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const { disconnect } = useWallet();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full z-30 glass border-r border-zinc-800/60 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center h-16 px-4 border-b border-zinc-800/60 shrink-0 overflow-hidden">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Disc className="w-6 h-6 text-brand animate-spin-slow shrink-0" />
            {!collapsed && (
              <span className="font-bold text-base tracking-tight text-white truncate">
                TICKET<span className="text-brand font-extrabold">PASS</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                      isActive
                        ? "bg-brand/15 text-brand border border-brand/25 shadow-[0_0_12px_rgba(var(--brand-primary-rgb),0.15)]"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    <item.icon
                      className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? "text-brand" : ""
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Disconnect + Collapse */}
        <div className="shrink-0 px-2 pb-4 space-y-1 border-t border-zinc-800/60 pt-3">
          <button
            onClick={disconnect}
            title={collapsed ? "Disconnect" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Disconnect</span>}
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40 transition-all w-full cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-zinc-800/60">
        <ul className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 py-1 rounded-xl transition-all duration-200 ${
                    isActive ? "text-brand" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "scale-110" : ""
                    }`}
                  />
                  <span className="text-[10px] font-medium leading-none truncate max-w-[52px] text-center">
                    {item.label.split(" ").slice(-1)[0]}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-brand" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Spacer for collapsed/expanded sidebar on desktop */}
      <div
        className={`hidden md:block shrink-0 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      />
    </>
  );
};
