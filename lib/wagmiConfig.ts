// lib/wagmiConfig.ts
"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, mainnet } from "wagmi/chains";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID env variable for WalletConnect",
  );
}

// Supported chains - Sepolia is the required chain for this app
export const SUPPORTED_CHAINS = [sepolia, mainnet] as const;
export const REQUIRED_CHAIN = sepolia;
export const REQUIRED_CHAIN_ID = sepolia.id;

export const wagmiConfig = getDefaultConfig({
  appName: "Token Manager",
  projectId: walletConnectProjectId || "demo-project-id",
  chains: SUPPORTED_CHAINS as [typeof sepolia, typeof mainnet],
  ssr: true,
});
