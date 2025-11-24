"use client";

import { Box, Container, Typography, Paper, Button } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { NetworkWarning } from "@/components/NetworkWarning";
import { TokenBalances } from "@/components/TokenBalances";
import { MintTokens } from "@/components/MintTokens";
import { useWallet } from "@/context/WalletContext";

export default function HomePage() {
  const { isConnected, address } = useWallet();
  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          p: 4,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Token Manager
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect your wallet on Sepolia to view token balances and interact
          with DAI and USDC.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            width: "100%",
          }}
        >
          <ConnectButton />
          <NetworkWarning />
          {isConnected && address && (
            <>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Button
                  component={Link}
                  href="/transactions"
                  variant="contained"
                  sx={{ minWidth: 200 }}
                >
                  Go to Transactions
                </Button>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Paper
                  elevation={4}
                  sx={{
                    p: 4,
                    maxWidth: 600,
                    width: "100%",
                    borderRadius: 3,
                    overflow: "visible",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <MintTokens />
                    <TokenBalances />
                  </Box>
                </Paper>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
