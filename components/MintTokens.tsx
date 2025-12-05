"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/context/WalletContext";
import { getTokenAddress, type TokenSymbol } from "@/lib/tokens";
import { parseTokenAmount } from "@/utils/format";
import { tokenAbiWithMint } from "@/lib/tokenAbiWithMint";
import { colors } from "@/theme/colors";
import { getErrorMessage } from "@/utils/transaction";
import { AnimatedText } from "@/components/AnimatedText";
import { EtherscanLink } from "@/components/EtherscanLink";

// Standard mint amount (1000 tokens)
const MINT_AMOUNT = "1000";

type MintButtonProps = {
  symbol: TokenSymbol;
  address: `0x${string}`;
};

export function MintButton({ symbol, address }: MintButtonProps) {
  const [mintAmount] = useState(MINT_AMOUNT);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();
  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset: resetWriteContract,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Show/hide alerts based on error and success states
  useEffect(() => {
    if (error) {
      setShowError(true);
      setShowSuccess(false);
    }
  }, [error]);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setShowError(false);
      queryClient.invalidateQueries();
    }
  }, [isSuccess, queryClient]);

  // Reset alerts when starting a new transaction
  useEffect(() => {
    if (isPending) {
      setShowError(false);
      setShowSuccess(false);
    }
  }, [isPending]);

  const handleMint = () => {
    const amount = parseTokenAmount(mintAmount, symbol);
    writeContract({
      address: getTokenAddress(symbol),
      abi: tokenAbiWithMint,
      functionName: "mint",
      args: [address, amount],
    });
  };

  const isLoading = isPending || isConfirming;
  const isDisabled = isLoading;

  // Get human-readable error message
  const errorMessage = getErrorMessage(error, {
    customMessages: {
      userRejection:
        "Transaction cancelled. You cancelled the minting request in your wallet.",
      default: error?.message.includes("mint")
        ? "Mint function not found. The contract might use a different mint signature."
        : "An error occurred while minting tokens.",
    },
  });

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "400px",
      }}
    >
      <Button
        variant="contained"
        onClick={handleMint}
        disabled={isDisabled}
        sx={{
          width: 140, // Fixed width to accommodate "Mint USDC" without wrapping
          height: "auto", // Let it size naturally
          minHeight: "36.5px", // Ensure minimum height
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0, // Prevent shrinking
          whiteSpace: "nowrap", // Prevent text wrapping
          "& .MuiButton-root": {
            height: "auto",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "20px", // Ensure minimum height matches CircularProgress
            lineHeight: "20px", // Match text line height to CircularProgress
            whiteSpace: "nowrap", // Prevent text wrapping
            gap: 1,
          }}
        >
          {isPending ? (
            <CircularProgress size={20} sx={{ color: colors.black }} />
          ) : isConfirming ? (
            <AnimatedText text="Minting" />
          ) : (
            `Mint ${symbol}`
          )}
        </Box>
      </Button>
      {showError && (
        <Alert
          severity="error"
          sx={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            mt: 1,
            width: "400px",
            maxWidth: "90vw",
            zIndex: 100,
            overflow: "visible", // Allow absolutely positioned children to extend
          }}
          onClose={() => {
            setShowError(false);
            resetWriteContract();
          }}
        >
          <Typography variant="body2">{errorMessage}</Typography>
        </Alert>
      )}
      {showSuccess && hash && (
        <Alert
          severity="success"
          sx={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            mt: 1,
            width: "400px",
            maxWidth: "90vw",
            zIndex: 100,
          }}
          onClose={() => setShowSuccess(false)}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2">
              Successfully minted {mintAmount} {symbol}!
            </Typography>
            <EtherscanLink txHash={hash} />
          </Box>
        </Alert>
      )}
    </Box>
  );
}

export function MintTokens() {
  const { address } = useWallet();

  if (!address) {
    return null;
  }

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
        Mint Test Tokens
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Get test tokens to use in the app. Each mint gives you 1000 tokens.
      </Typography>

      <Grid container spacing={2}>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <MintButton symbol="DAI" address={address} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <MintButton symbol="USDC" address={address} />
        </Grid>
      </Grid>
    </Box>
  );
}
