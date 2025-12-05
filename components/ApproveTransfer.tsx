"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import { useWallet } from "@/context/WalletContext";
import { getTokenAddress, type TokenSymbol } from "@/lib/tokens";
import { formatTokenAmount, formatDisplayAmount } from "@/utils/format";
import { colors } from "@/theme/colors";
import { getErrorMessage } from "@/utils/transaction";
import { AnimatedText } from "@/components/AnimatedText";
import { EtherscanLink } from "@/components/EtherscanLink";
import { useApproveToken } from "@/hooks/useApproveToken";
import { useTransferToken } from "@/hooks/useTransferToken";

type ApproveTransferProps = {
  symbol: TokenSymbol;
  address: `0x${string}`;
};

export function ApproveTransferItem({ symbol, address }: ApproveTransferProps) {
  const [amount, setAmount] = useState("");
  const [spender, setSpender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get token balance
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: getTokenAddress(symbol),
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });

  // Get allowance for the spender address (only when spender is entered)
  const isValidSpender = Boolean(
    spender && spender.startsWith("0x") && spender.length === 42,
  );
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: getTokenAddress(symbol),
    abi: erc20Abi,
    functionName: "allowance",
    args: [address, spender as `0x${string}`],
    query: {
      enabled: isValidSpender,
    },
  });

  // Use approve hook
  const {
    approve,
    isLoading: isApproveLoading,
    isPending: isApproving,
    isConfirming: isConfirmingApprove,
    isSuccess: isApproveSuccess,
    error: approveError,
    hash: approveHash,
    reset: resetApprove,
  } = useApproveToken({
    symbol,
    onRefetchAllowance: refetchAllowance,
  });

  // Use transfer hook
  const {
    transfer,
    isLoading: isTransferLoading,
    isPending: isTransferring,
    isConfirming: isConfirmingTransfer,
    isSuccess: isTransferSuccess,
    error: transferError,
    hash: transferHash,
    reset: resetTransfer,
  } = useTransferToken({
    symbol,
    balance,
    onRefetchBalance: refetchBalance,
  });

  const isLoading = isApproveLoading || isTransferLoading;
  const currentHash = approveHash || transferHash;
  const isApprove = !!approveHash;
  const currentError = approveError || transferError;

  // Handle success states
  useEffect(() => {
    if (isApproveSuccess || isTransferSuccess) {
      setShowSuccess(true);
      setShowError(false);
    }
  }, [isApproveSuccess, isTransferSuccess]);

  // Handle error states
  useEffect(() => {
    if (currentError) {
      setShowError(true);
      setShowSuccess(false);
    }
  }, [currentError]);

  // Reset alerts when starting new transaction
  useEffect(() => {
    if (isApproveLoading || isTransferLoading) {
      setShowError(false);
      setShowSuccess(false);
    }
  }, [isApproveLoading, isTransferLoading]);

  // Get formatted error message
  const transactionErrorMessage = getErrorMessage(currentError, {
    customMessages: {
      userRejection:
        "Transaction cancelled. You cancelled the request in your wallet.",
      insufficientFunds: "Not enough funds. Please check your balance.",
    },
  });
  const errorMessage = transactionErrorMessage || currentError?.message;

  const handleApprove = async () => {
    await approve(amount, spender);
  };

  const handleTransfer = async () => {
    await transfer(amount, recipient);
  };

  const formattedBalance = balance
    ? formatDisplayAmount(formatTokenAmount(balance, symbol))
    : "0";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        position: "relative",
        overflow: "visible",
      }}
    >
      <Typography variant="h6" fontWeight={600}>
        {symbol} - Approve & Transfer
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Balance: {formattedBalance} {symbol}
      </Typography>
      {isValidSpender && allowance !== undefined && (
        <Typography variant="body2" color="text.secondary">
          Current Allowance:{" "}
          {formatDisplayAmount(formatTokenAmount(allowance, symbol))} {symbol}
        </Typography>
      )}

      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.0"
        fullWidth
        disabled={isLoading}
        autoComplete="off"
      />

      <TextField
        label="Spender Address (for Approve)"
        value={spender}
        onChange={(e) => setSpender(e.target.value)}
        placeholder="0x... (contract or address that will spend tokens)"
        fullWidth
        disabled={isLoading}
        helperText="The address/contract you're approving to spend your tokens"
      />

      <TextField
        label="Recipient Address (for Transfer)"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        placeholder="0x..."
        fullWidth
        disabled={isLoading}
        helperText="The address that will receive the tokens"
      />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          position: "relative",
          width: "100%",
        }}
      >
        <Button
          variant="contained"
          onClick={handleApprove}
          disabled={isLoading || !amount || !spender}
          sx={{
            flex: 1,
            minHeight: "36.5px",
            color: colors.black,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "20px",
              lineHeight: "20px",
              whiteSpace: "nowrap",
            }}
          >
            {isApproving ? (
              <CircularProgress size={20} sx={{ color: colors.black }} />
            ) : isConfirmingApprove ? (
              <AnimatedText text="Approving" />
            ) : (
              "APPROVE"
            )}
          </Box>
        </Button>

        <Button
          variant="contained"
          onClick={handleTransfer}
          disabled={isLoading || !amount || !recipient}
          sx={{
            flex: 1,
            minHeight: "36.5px",
            color: colors.black,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "20px",
              lineHeight: "20px",
              whiteSpace: "nowrap",
            }}
          >
            {isTransferring ? (
              <CircularProgress size={20} sx={{ color: colors.black }} />
            ) : isConfirmingTransfer ? (
              <AnimatedText text="Transferring" />
            ) : (
              "TRANSFER"
            )}
          </Box>
        </Button>

        {showError && errorMessage && (
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
              zIndex: 1000,
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            }}
            onClose={() => {
              setShowError(false);
              resetApprove();
              resetTransfer();
            }}
          >
            <Typography variant="body2">{errorMessage}</Typography>
          </Alert>
        )}

        {showSuccess && currentHash && (
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
              zIndex: 1000,
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            }}
            onClose={() => setShowSuccess(false)}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="body2">
                Successfully {isApprove ? "approved" : "transferred"} {amount}{" "}
                {symbol}!
              </Typography>
              <EtherscanLink txHash={currentHash} />
            </Box>
          </Alert>
        )}
      </Box>
    </Box>
  );
}

export function ApproveTransfer() {
  const { address } = useWallet();

  if (!address) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width: "100%",
      }}
    >
      <ApproveTransferItem symbol="DAI" address={address} />
      <ApproveTransferItem symbol="USDC" address={address} />
    </Box>
  );
}
