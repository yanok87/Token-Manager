import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { erc20Abi } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { getTokenAddress, type TokenSymbol } from "@/lib/tokens";
import { parseTokenAmount } from "@/utils/format";

type UseApproveTokenParams = {
  symbol: TokenSymbol;
  onSuccess?: () => void;
  onRefetchAllowance?: () => void;
};

type UseApproveTokenReturn = {
  approve: (amount: string, spender: string) => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  hash: `0x${string}` | undefined;
  reset: () => void;
};

export function useApproveToken({
  symbol,
  onSuccess,
  onRefetchAllowance,
}: UseApproveTokenParams): UseApproveTokenReturn {
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
      onRefetchAllowance?.();
      onSuccess?.();
    }
  }, [isSuccess, queryClient, onRefetchAllowance, onSuccess]);

  const approve = async (amount: string, spender: string) => {
    // Validation
    if (!amount || !spender) {
      setError(new Error("Please enter amount and spender address"));
      return;
    }

    const spenderAddress = spender as `0x${string}`;

    // Validate spender address
    if (!spenderAddress.startsWith("0x") || spenderAddress.length !== 42) {
      setError(new Error("Invalid spender address"));
      return;
    }

    try {
      const amountBigInt = parseTokenAmount(amount, symbol);

      writeContract({
        address: getTokenAddress(symbol),
        abi: erc20Abi,
        functionName: "approve",
        args: [spenderAddress, amountBigInt],
      });
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Invalid amount"),
      );
    }
  };

  const reset = () => {
    setError(null);
    resetWrite();
  };

  return {
    approve,
    isLoading: isPending || isConfirming,
    isPending,
    isConfirming,
    isSuccess,
    error: error || (writeError as Error) || (receiptError as Error) || null,
    hash,
    reset,
  };
}

