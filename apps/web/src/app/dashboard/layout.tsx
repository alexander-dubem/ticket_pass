"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";
import { DashboardSidebar } from "../../components/Dashboard/DashboardSidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { address } = useWallet();

  // Auth guard — redirect to /auth if wallet not connected
  useEffect(() => {
    // Small delay to allow localStorage hydration before deciding to redirect
    const t = setTimeout(() => {
      if (!address && !localStorage.getItem("drip_address")) {
        router.push("/auth?redirect=/dashboard/overview");
      }
    }, 300);
    return () => clearTimeout(t);
  }, [address, router]);


  if (!address) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      {/* Main content area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Page content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
