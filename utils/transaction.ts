/**
 * Check if error is due to user rejection/cancellation
 */
export function isUserRejection(error: Error | null): boolean {
  if (!error) return false;
  const message = error.message.toLowerCase();
  const code = (error as any).code;
  return (
    message.includes("user rejected") ||
    message.includes("user denied") ||
    message.includes("rejected") ||
    message.includes("denied") ||
    code === 4001 ||
    code === "4001"
  );
}

/**
 * Get Etherscan URL for a transaction hash on Sepolia testnet
 */
export function getEtherscanUrl(txHash: `0x${string}`): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

/**
 * Get human-readable error message
 */
export function getErrorMessage(
  error: Error | null,
  options?: {
    customMessages?: {
      userRejection?: string;
      insufficientFunds?: string;
      default?: string;
    };
  },
): string {
  if (!error) return "";

  const customMessages = options?.customMessages || {};

  if (isUserRejection(error)) {
    return (
      customMessages.userRejection ||
      "Transaction cancelled. You cancelled the request in your wallet."
    );
  }

  if (
    error.message &&
    (error.message.includes("insufficient") ||
      error.message.includes("balance"))
  ) {
    return (
      customMessages.insufficientFunds ||
      "Not enough funds. Please check your balance."
    );
  }

  return error.message || customMessages.default || "An error occurred.";
}
