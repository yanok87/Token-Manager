import type { TokenSymbol } from "@/lib/tokens";

export type TokenBalance = {
  symbol: TokenSymbol;
  value: string; // Human-readable formatted value
  rawValue: bigint; // Raw value from blockchain
  decimals: number;
};

export type TokenAllowance = {
  symbol: TokenSymbol;
  value: string; // Human-readable formatted value
  rawValue: bigint; // Raw value from blockchain
  decimals: number;
};
