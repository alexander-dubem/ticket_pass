"use client";
import React, { useEffect, useState } from "react";
import { Loader2, Copy, Check, User, Pencil } from "lucide-react";
import { useWallet } from "../../../context/WalletContext";
import { DashboardHeader } from "../../../components/Dashboard/DashboardHeader";
import { Button } from "../../../components/ui/button";

export default function ProfilePage() {
  const { address, apiFetch } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!address) return;
    apiFetch("/users/me")
      .then((data) => {
        setProfile(data);
        setDisplayName(data.displayName ?? "");
      })
      .catch(() => setProfile({ walletAddress: address, stats: {} }))
      .finally(() => setLoading(false));
  }, [address, apiFetch]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveDisplayName = async () => {
    setSaving(true);
    try {
      const updated = await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName }),
      });
      setProfile((p: any) => ({ ...p, displayName: updated.displayName }));
      setEditing(false);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <DashboardHeader
        title="Profile"
        subtitle="Manage your on-chain identity and display settings."
      />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Avatar + Name */}
          <div className="glass rounded-2xl border border-white/10 p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 flex items-center justify-center shrink-0 glow-brand">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="input-field flex-1 text-sm"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={saveDisplayName}
                    disabled={saving}
                    className="shrink-0 cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="shrink-0 cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-base truncate">
                    {profile?.displayName || "Unnamed Wallet"}
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-zinc-500 mt-0.5">
                Member since{" "}
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="glass rounded-2xl border border-white/10 p-6 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Wallet Address
            </h3>
            <div className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/10">
              <p className="text-xs font-mono text-zinc-300 flex-1 break-all">
                {address}
              </p>
              <button
                onClick={copyAddress}
                className="text-zinc-500 hover:text-brand transition-colors shrink-0 cursor-pointer"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="glass rounded-2xl border border-white/10 p-6 space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Activity Stats
            </h3>
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {[
                { label: "Events", value: profile?.stats?.eventsOrganized ?? 0 },
                { label: "Tickets", value: profile?.stats?.ticketsOwned ?? 0 },
                { label: "Verified", value: profile?.stats?.ticketsVerified ?? 0 },
              ].map((s) => (
                <div key={s.label} className="text-center py-2 px-3">
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
