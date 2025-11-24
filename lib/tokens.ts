// Token contract addresses on Sepolia testnet
export const TOKEN_ADDRESSES = {
  DAI: "0x1D70D57ccD2798323232B2dD027B3aBcA5C00091" as const,
  USDC: "0xC891481A0AaC630F4D89744ccD2C7D2C4215FD47" as const,
} as const;

// Token decimals
export const TOKEN_DECIMALS = {
  DAI: 18,
  USDC: 6,
} as const;

// Token symbols
export type TokenSymbol = keyof typeof TOKEN_ADDRESSES;

// Helper to get token address
export function getTokenAddress(symbol: TokenSymbol): `0x${string}` {
  return TOKEN_ADDRESSES[symbol] as `0x${string}`;
}

// Helper to get token decimals
export function getTokenDecimals(symbol: TokenSymbol): number {
  return TOKEN_DECIMALS[symbol];
}
