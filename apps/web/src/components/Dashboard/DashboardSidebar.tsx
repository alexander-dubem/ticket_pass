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
import { cn } from "../../utils/cn";

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
        className={`hidden md:flex flex-col fixed left-0 top-0 h-full z-30 glass-strong border-r border-white/10 transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center h-16 px-4 border-b border-white/10 shrink-0 overflow-hidden">
          <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 glow-brand">
              <Disc className="w-5 h-5 text-white animate-spin-slow" />
            </span>
            {!collapsed && (
              <span className="flex flex-col leading-none">
                <span className="font-bold text-sm tracking-tight text-white truncate">
                  TICKET<span className="text-gradient font-extrabold">PASS</span>
                </span>
                <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Studio
                </span>
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
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                      isActive
                        ? "text-white bg-gradient-to-r from-pink-500/20 via-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/25 shadow-[0_0_16px_rgba(217,70,239,0.12)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-fuchsia-400" : ""
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Disconnect + Collapse */}
        <div className="shrink-0 px-2 pb-4 space-y-1 border-t border-white/10 pt-3">
          <button
            onClick={disconnect}
            title={collapsed ? "Disconnect" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Disconnect</span>}
          </button>

          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] transition-all w-full cursor-pointer"
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-strong border-t border-white/10">
        <ul className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-1 rounded-xl transition-all duration-200",
                    isActive ? "text-fuchsia-400" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <item.icon
                    className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "")}
                  />
                  <span className="text-[10px] font-medium leading-none truncate max-w-[52px] text-center">
                    {item.label.split(" ").slice(-1)[0]}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Spacer for collapsed/expanded sidebar on desktop */}
      <div
        className={cn(
          "hidden md:block shrink-0 transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      />
    </>
  );
};
