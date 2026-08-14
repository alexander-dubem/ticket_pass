'use client';
import React, { useEffect } from 'react';
import { Disc } from 'lucide-react';
import { Footer } from '../../components/Footer';

export default function AlbedoCallbackPage() {
  useEffect(() => {
    // Albedo protocol standard callback page
    // Ref: https://albedo.link/docs/
    if (typeof window !== 'undefined' && window.opener) {
      window.opener.postMessage({
        source: 'albedo-callback',
        location: window.location.href
      }, '*');
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-400 relative z-10">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500">
          <Disc className="w-5 h-5 text-white animate-spin" />
        </span>
        <p className="text-sm font-mono">Completing Albedo Authorization...</p>
      </main>
      <Footer />
    </div>
  );
}
