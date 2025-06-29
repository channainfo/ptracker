'use client';

import { createContext, useContext, useState } from 'react';

interface WalletContextType {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  loading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    // TODO: Implement wallet connection logic
  };

  const disconnect = () => {
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ address, connect, disconnect, loading }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};