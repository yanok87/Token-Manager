"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import {
  RainbowKitProvider,
  darkTheme as rainbowDarkTheme,
} from "@rainbow-me/rainbowkit";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { wagmiConfig } from "@/lib/wagmiConfig";
import { theme } from "@/theme/theme";
import { WalletProvider } from "@/context/WalletContext";

const queryClient = new QueryClient();

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowDarkTheme()}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <WalletProvider>{children}</WalletProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
