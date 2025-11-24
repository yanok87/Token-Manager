"use client";

import { Box, Typography, CircularProgress } from "@mui/material";
import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import { useWallet } from "@/context/WalletContext";
import { getTokenAddress, type TokenSymbol } from "@/lib/tokens";
import { formatTokenAmount, formatDisplayAmount } from "@/utils/format";
import { colors } from "@/theme/colors";

type BalanceItemProps = {
  symbol: TokenSymbol;
  address: `0x${string}`;
};

function BalanceItem({ symbol, address }: BalanceItemProps) {
  const {
    data: balance,
    isLoading,
    error,
  } = useReadContract({
    address: getTokenAddress(symbol),
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" color="text.secondary">
          Loading {symbol}...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error">
        Error loading {symbol} balance
      </Typography>
    );
  }

  const formattedBalance = balance
    ? formatDisplayAmount(formatTokenAmount(balance, symbol))
    : "0";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.5,
        px: 2,
        borderRadius: 2,
        backgroundColor: colors.surface.item,
      }}
    >
      <Typography variant="body1" fontWeight={500}>
        {symbol}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {formattedBalance}
      </Typography>
    </Box>
  );
}

export function TokenBalances() {
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
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Token Balances
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
        <BalanceItem symbol="DAI" address={address} />
        <BalanceItem symbol="USDC" address={address} />
      </Box>
    </Box>
  );
}
