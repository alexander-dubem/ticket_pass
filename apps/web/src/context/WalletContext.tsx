'use client';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';

interface WalletContextType {
  address: string | null;
  token: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  connectWithId: (walletId: string) => Promise<void>;
  getSupportedWallets: () => Promise<any[]>;
  disconnect: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | null>(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const isRefreshing = useRef(false);

  useEffect(() => {
    // Initialize SWK statically
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      selectedWalletId: FREIGHTER_ID,
      modules: defaultModules()
    });

    // Hydrate state from localStorage
    const savedAddress = localStorage.getItem('app_address');
    const savedToken = localStorage.getItem('app_token');
    if (savedAddress && savedToken) {
      setAddress(savedAddress);
      setToken(savedToken);
    }
  }, []);

  const getSupportedWallets = async () => {
    return StellarWalletsKit.refreshSupportedWallets();
  };

  // Shared SEP-10 authentication: fetch challenge -> sign -> exchange for a JWT.
  // Throws on failure.
  const sep10Authenticate = async (userAddress: string): Promise<string> => {
    const chalRes = await fetch(`${BACKEND_URL}/auth/challenge?address=${userAddress}`);
    if (!chalRes.ok) throw new Error('Backend offline');
    const data = await chalRes.json();

    const signRes = await StellarWalletsKit.signTransaction(data.xdr, {
      networkPassphrase: Networks.TESTNET,
    });

    const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: userAddress, xdr: signRes.signedTxXdr }),
    });

    if (!loginRes.ok) {
      let errorMsg = 'Challenge verification failed';
      try {
        const errorJson = await loginRes.json();
        errorMsg = errorJson.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const loginData = await loginRes.json();
    return loginData.token;
  };

  // Re-authenticate the connected wallet and swap in a fresh real JWT.
  // Returns the new token, or null if no wallet/address is available to refresh.
  const refreshToken = async (): Promise<string | null> => {
    if (isRefreshing.current) return null;
    const knownAddress = address ?? localStorage.getItem('app_address');
    if (!knownAddress) return null;

    isRefreshing.current = true;
    try {
      const newToken = await sep10Authenticate(knownAddress);
      setAddress(knownAddress);
      setToken(newToken);
      localStorage.setItem('app_address', knownAddress);
      localStorage.setItem('app_token', newToken);
      return newToken;
    } catch (err: any) {
      console.warn('Session refresh failed — please reconnect your wallet:', err.message);
      return null;
    } finally {
      isRefreshing.current = false;
    }
  };

  const connectWithId = async (walletId: string) => {
    setIsConnecting(true);
    try {
      // 1. Programmatically set the wallet and fetch address
      StellarWalletsKit.setWallet(walletId);
      const walletRes = await StellarWalletsKit.fetchAddress();
      const userAddress = walletRes.address;

      // 2. SEP-10 authentication (challenge + sign + login) to get a real JWT
      const jwtToken = await sep10Authenticate(userAddress);

      // Save credentials
      setAddress(userAddress);
      setToken(jwtToken);
      localStorage.setItem('app_address', userAddress);
      localStorage.setItem('app_token', jwtToken);
    } catch (err: any) {
      console.error('Wallet connection / authentication failed:', err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      // 1. Open Wallet Picker via static authModal
      const walletRes = await StellarWalletsKit.authModal();
      const userAddress = walletRes.address;

      // 2. SEP-10 authentication (challenge + sign + login) to get a real JWT
      const jwtToken = await sep10Authenticate(userAddress);

      // Save credentials
      setAddress(userAddress);
      setToken(jwtToken);
      localStorage.setItem('app_address', userAddress);
      localStorage.setItem('app_token', jwtToken);
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
    localStorage.removeItem('app_address');
    localStorage.removeItem('app_token');
  };

  // Helper fetch function that automatically appends the SEP-10 Bearer Token,
  // and transparently re-authenticates + retries once if the token is invalid/expired (401).
  const apiFetch = async (
    endpoint: string,
    options: RequestInit = {},
    retried = false,
    overrideToken?: string
  ): Promise<any> => {
    const currentToken = overrideToken ?? token ?? localStorage.getItem('app_token');
    const headers = new Headers(options.headers || {});
    if (currentToken) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }

    // Default to JSON Content-Type if posting body
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Session expired or invalid — try to silently re-authenticate and retry once
    if (response.status === 401 && !retried) {
      const knownAddress = address ?? localStorage.getItem('app_address');
      if (knownAddress) {
        const newToken = await refreshToken();
        if (newToken) {
          return apiFetch(endpoint, options, true, newToken);
        }
        throw new Error('Session expired. Please reconnect your wallet and try again.');
      }
    }

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
    <WalletContext.Provider value={{ address, token, isConnecting, connect, connectWithId, getSupportedWallets, disconnect, apiFetch }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
