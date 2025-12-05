import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { getTokenAddress, type TokenSymbol } from "@/lib/tokens";
import { parseTokenAmount } from "@/utils/format";

type UseTransferTokenParams = {
  symbol: TokenSymbol;
  balance: bigint | undefined;
  onSuccess?: () => void;
  onRefetchBalance?: () => void;
};

type UseTransferTokenReturn = {
  transfer: (amount: string, recipient: string) => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  hash: `0x${string}` | undefined;
  reset: () => void;
};

export function useTransferToken({
  symbol,
  balance,
  onSuccess,
  onRefetchBalance,
}: UseTransferTokenParams): UseTransferTokenReturn {
  const queryClient = useQueryClient();
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const [error, setError] = useState<Error | null>(null);

  // Reset error when starting new transaction
  useEffect(() => {
    if (isPending) {
      setError(null);
    }
  }, [isPending]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      setError(writeError as Error);
    }
  }, [writeError]);

  // Handle receipt errors
  useEffect(() => {
    if (receiptError) {
      setError(receiptError as Error);
    }
  }, [receiptError]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries();
      onRefetchBalance?.();
      onSuccess?.();
    }
  }, [isSuccess, queryClient, onRefetchBalance, onSuccess]);

  const transfer = async (amount: string, recipient: string) => {
    // Validation
    if (!amount || !recipient) {
      setError(new Error("Please enter amount and recipient address"));
      return;
    }

    const recipientAddress = recipient as `0x${string}`;

    try {
      const amountBigInt = parseTokenAmount(amount, symbol);

      // Validate that transfer amount is greater than 0
      if (amountBigInt <= BigInt(0)) {
        setError(new Error("Transfer amount must be greater than 0"));
        return;
      }

      // Validate recipient address
      if (
        !recipientAddress.startsWith("0x") ||
        recipientAddress.length !== 42
      ) {
        setError(new Error("Invalid recipient address"));
        return;
      }

      // Check balance
      if (balance && amountBigInt > balance) {
        setError(new Error("Not enough funds"));
        return;
      }

      writeContract({
        address: getTokenAddress(symbol),
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipientAddress, amountBigInt],
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Invalid amount"));
    }
  };

  const reset = () => {
    setError(null);
    resetWrite();
  };

  return {
    transfer,
    isLoading: isPending || isConfirming,
    isPending,
    isConfirming,
    isSuccess,
    error: error || (writeError as Error) || (receiptError as Error) || null,
    hash,
    reset,
  };
}

