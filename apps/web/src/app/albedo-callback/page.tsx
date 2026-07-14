'use client';
import React, { useEffect } from 'react';

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
      <p className="text-sm font-mono">Completing Albedo Authorization...</p>
    </div>
  );
}
