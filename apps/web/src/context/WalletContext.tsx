'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';

interface WalletContextType {
  address: string | null;
  token: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Initialize SWK statically
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: defaultModules()
    });

    // Hydrate state from localStorage
    const savedAddress = localStorage.getItem('drip_address');
    const savedToken = localStorage.getItem('drip_token');
    if (savedAddress && savedToken) {
      setAddress(savedAddress);
      setToken(savedToken);
    }
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    try {
      // 1. Open Wallet Picker via static authModal
      const walletRes = await StellarWalletsKit.authModal();
      const userAddress = walletRes.address;
      
      // 2. Fetch challenge XDR from backend (SEP-10 simulation)
      let challengeXdr: string;
      let mockAuth = false;
      try {
        const chalRes = await fetch(`${BACKEND_URL}/auth/challenge?address=${userAddress}`);
        if (!chalRes.ok) throw new Error('Backend offline');
        const data = await chalRes.json();
        challengeXdr = data.xdr;
      } catch (err) {
        console.warn('Backend connection failed, using client-side mock challenge fallback for demonstration.');
        mockAuth = true;
        challengeXdr = 'MOCK_CHALLENGE_XDR';
      }

      let jwtToken = '';
      if (!mockAuth) {
        // 3. Request wallet to sign the challenge transaction
        const signRes = await StellarWalletsKit.signTransaction(challengeXdr, {
          networkPassphrase: Networks.TESTNET,
        });

        // 4. Submit signed challenge to backend to get JWT
        const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: userAddress, xdr: signRes.signedTxXdr }),
        });

        if (!loginRes.ok) throw new Error('Challenge verification failed');
        const loginData = await loginRes.json();
        jwtToken = loginData.token;
      } else {
        // Mock token generation for local dev without backend running
        jwtToken = 'mock_jwt_token_' + Math.random().toString(36).substring(7);
      }

      // Save credentials
      setAddress(userAddress);
      setToken(jwtToken);
      localStorage.setItem('drip_address', userAddress);
      localStorage.setItem('drip_token', jwtToken);
    } catch (err: any) {
      console.error('Wallet connection / authentication failed:', err.message);
      alert(`Wallet Connection Error: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setToken(null);
    localStorage.removeItem('drip_address');
    localStorage.removeItem('drip_token');
  };

  // Helper fetch function that automatically appends the SEP-10 Bearer Token
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Default to JSON Content-Type if posting body
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = 'API call failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    return response.json();
  };

  return (
    <WalletContext.Provider value={{ address, token, isConnecting, connect, disconnect, apiFetch }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
