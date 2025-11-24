"use client";

import { Box, Container, Typography, Paper, Button, Grid } from "@mui/material";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NetworkWarning } from "@/components/NetworkWarning";
import { ApproveTransferItem } from "@/components/ApproveTransfer";
import { EventTable } from "@/components/EventTable";
import { colors } from "@/theme/colors";
import { useWallet } from "@/context/WalletContext";

export default function TransactionsPage() {
  const { isConnected, address } = useWallet();
  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
        py: 4,
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
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Transactions
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: { xs: "280px", sm: "100%" },
              }}
            >
              Approve and transfer tokens, and view your transaction history.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            sx={{ color: colors.black }}
          >
            Home
          </Button>
        </Box>

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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                width: "100%",
              }}
            >
              <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      width: "100%",
                      borderRadius: 3,
                      overflow: "visible",
                      position: "relative",
                    }}
                  >
                    <ApproveTransferItem symbol="DAI" address={address} />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex" }}>
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      width: "100%",
                      borderRadius: 3,
                      overflow: "visible",
                      position: "relative",
                    }}
                  >
                    <ApproveTransferItem symbol="USDC" address={address} />
                  </Paper>
                </Grid>
              </Grid>
              <Typography variant="h4" gutterBottom>
                Events History
              </Typography>
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  width: "100%",
                  borderRadius: 3,
                  overflow: "visible",
                  position: "relative",
                }}
              >
                <EventTable />
              </Paper>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
