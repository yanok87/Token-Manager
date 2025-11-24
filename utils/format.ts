import { formatUnits, parseUnits } from "viem";
import type { TokenSymbol } from "@/lib/tokens";
import { getTokenDecimals } from "@/lib/tokens";

/**
 * Format token amount from raw bigint to human-readable string
 */
export function formatTokenAmount(amount: bigint, symbol: TokenSymbol): string {
  const decimals = getTokenDecimals(symbol);
  return formatUnits(amount, decimals);
}

/**
 * Parse human-readable token amount to raw bigint
 */
export function parseTokenAmount(amount: string, symbol: TokenSymbol): bigint {
  const decimals = getTokenDecimals(symbol);
  return parseUnits(amount, decimals);
}

/**
 * Format token amount with symbol (e.g., "100.50 DAI")
 */
export function formatTokenAmountWithSymbol(
  amount: bigint,
  symbol: TokenSymbol,
): string {
  const formatted = formatTokenAmount(amount, symbol);
  return `${formatted} ${symbol}`;
}

/**
 * Format number to display with appropriate decimal places
 */
export function formatDisplayAmount(
  amount: string,
  decimals: number = 4,
): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0";

  // Remove trailing zeros
  return num.toFixed(decimals).replace(/\.?0+$/, "");
}

/**
 * Format a Unix timestamp (in seconds) to a human-readable date and time string
 * Uses a consistent format that works the same on server and client
 * Note: ClientDate component handles hydration by only rendering after mount
 */
export function formatDateTime(timestamp?: number): string {
  if (!timestamp) return "N/A";
  const date = new Date(Number(timestamp) * 1000); // Convert Unix timestamp to milliseconds

  // Use a consistent format that works the same on server and client
  // Format: "Jan 1, 2024, 12:00:00 PM"
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = hours.toString().padStart(2, "0");

  return `${month} ${day}, ${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Format an Ethereum address to a shortened version (e.g., "0x1234...5678")
 */
export function formatAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
