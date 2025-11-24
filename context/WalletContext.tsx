"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAccount } from "wagmi";

type WalletContextType = {
  // Wallet state
  isConnected: boolean;
  address: `0x${string}` | undefined;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

type WalletProviderProps = {
  children: ReactNode;
};

export function WalletProvider({ children }: WalletProviderProps) {
  const { address, isConnected } = useAccount();

  const value: WalletContextType = {
    isConnected,
    address,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
