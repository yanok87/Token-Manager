"use client";

import { useChainId, useSwitchChain } from "wagmi";
import { Alert, AlertTitle, Button, Typography } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import { REQUIRED_CHAIN_ID, REQUIRED_CHAIN } from "@/lib/wagmiConfig";
import { colors } from "@/theme/colors";
import { useWallet } from "@/context/WalletContext";

export function NetworkWarning() {
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const { isConnected } = useWallet();

  // Only show warning if wallet is connected and on wrong network
  if (!isConnected || chainId === REQUIRED_CHAIN_ID) {
    return null;
  }

  const handleSwitchChain = () => {
    switchChain({ chainId: REQUIRED_CHAIN_ID });
  };

  return (
    <Alert
      severity="error"
      icon={<WarningIcon />}
      sx={{
        mb: 3,
        backgroundColor: colors.error.light,
        border: `1px solid ${colors.error.border}`,
      }}
      action={
        <Button
          variant="contained"
          onClick={handleSwitchChain}
          disabled={isPending}
          size="small"
          sx={{
            fontWeight: 600,
          }}
        >
          {isPending ? "Switching..." : `Switch to ${REQUIRED_CHAIN.name}`}
        </Button>
      }
    >
      <AlertTitle sx={{ fontWeight: 600 }}>Wrong Network Detected</AlertTitle>
      <Typography variant="body2">
        This app requires the <strong>{REQUIRED_CHAIN.name}</strong> network.
        Please switch your network to continue.
      </Typography>
    </Alert>
  );
}
