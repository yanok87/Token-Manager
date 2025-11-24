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
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { erc20Abi } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/context/WalletContext";
import { getTokenAddress, type TokenSymbol } from "@/lib/tokens";
import {
  parseTokenAmount,
  formatTokenAmount,
  formatDisplayAmount,
} from "@/utils/format";
import { colors } from "@/theme/colors";
import { getErrorMessage } from "@/utils/transaction";
import { AnimatedText } from "@/components/AnimatedText";
import { EtherscanLink } from "@/components/EtherscanLink";

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
  const [customErrorMessage, setCustomErrorMessage] = useState("");
  const queryClient = useQueryClient();

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

  // Approve transaction
  const {
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApproving,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isConfirmingApprove, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  // Transfer transaction
  const {
    writeContract: writeTransfer,
    data: transferHash,
    isPending: isTransferring,
    error: transferError,
    reset: resetTransfer,
  } = useWriteContract();

  const { isLoading: isConfirmingTransfer, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({
      hash: transferHash,
    });

  // Handle approve success
  useEffect(() => {
    if (isApproveSuccess) {
      setShowSuccess(true);
      setShowError(false);
      // Refetch allowance after approval if spender is valid
      if (isValidSpender && refetchAllowance) {
        refetchAllowance();
      }
      queryClient.invalidateQueries();
    }
  }, [isApproveSuccess, queryClient, isValidSpender, refetchAllowance]);

  // Handle transfer success
  useEffect(() => {
    if (isTransferSuccess) {
      setShowSuccess(true);
      setShowError(false);
      // Refetch balance and invalidate all queries
      refetchBalance();
      queryClient.invalidateQueries();
    }
  }, [isTransferSuccess, queryClient, refetchBalance]);

  // Handle errors
  useEffect(() => {
    if (approveError) {
      setShowError(true);
      setShowSuccess(false);
      setCustomErrorMessage(approveError.message);
    }
  }, [approveError]);

  useEffect(() => {
    if (transferError) {
      setShowError(true);
      setShowSuccess(false);
      setCustomErrorMessage(transferError.message);
    }
  }, [transferError]);

  // Reset alerts when starting new transaction
  useEffect(() => {
    if (isApproving || isTransferring) {
      setShowError(false);
      setShowSuccess(false);
    }
  }, [isApproving, isTransferring]);

  // Get error message (combine transaction errors with custom validation errors)
  const error = approveError || transferError;
  const transactionErrorMessage = getErrorMessage(error, {
    customMessages: {
      userRejection:
        "Transaction cancelled. You cancelled the request in your wallet.",
      insufficientFunds: "Not enough funds. Please check your balance.",
    },
  });
  const errorMessage = transactionErrorMessage || customErrorMessage;

  const handleApprove = () => {
    if (!amount || !spender) {
      setShowError(true);
      setCustomErrorMessage("Please enter amount and spender address");
      return;
    }

    try {
      const amountBigInt = parseTokenAmount(amount, symbol);
      const spenderAddress = spender as `0x${string}`;

      // Validate spender address
      if (!spenderAddress.startsWith("0x") || spenderAddress.length !== 42) {
        setShowError(true);
        setCustomErrorMessage("Invalid spender address");
        return;
      }

      writeApprove({
        address: getTokenAddress(symbol),
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress, amountBigInt],
      });
    } catch (error) {
      setShowError(true);
      setCustomErrorMessage(
        error instanceof Error ? error.message : "Invalid amount",
      );
    }
  };

  const handleTransfer = () => {
    if (!amount || !recipient) {
      setShowError(true);
      setCustomErrorMessage("Please enter amount and recipient address");
      return;
    }

    try {
      const amountBigInt = parseTokenAmount(amount, symbol);
      const recipientAddress = recipient as `0x${string}`;

      // Validate that transfer amount is greater than 0
      if (amountBigInt <= BigInt(0)) {
        setShowError(true);
        setCustomErrorMessage("Transfer amount must be greater than 0");
        return;
      }

      // Validate recipient address
      if (
        !recipientAddress.startsWith("0x") ||
        recipientAddress.length !== 42
      ) {
        setShowError(true);
        setCustomErrorMessage("Invalid recipient address");
        return;
      }

      // Check balance
      if (balance && amountBigInt > balance) {
        setShowError(true);
        setCustomErrorMessage("Not enough funds");
        return;
      }

      writeTransfer({
        address: getTokenAddress(symbol),
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipientAddress, amountBigInt],
      });
    } catch (error) {
      setShowError(true);
      setCustomErrorMessage(
        error instanceof Error ? error.message : "Invalid amount",
      );
    }
  };

  const isLoading =
    isApproving ||
    isConfirmingApprove ||
    isTransferring ||
    isConfirmingTransfer;
  const currentHash = approveHash || transferHash;
  const isApprove = !!approveHash;

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
