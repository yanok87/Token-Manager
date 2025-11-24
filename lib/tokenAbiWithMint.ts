import { erc20Abi } from "viem";

// Extended ERC20 ABI with mint function for test tokens
// Test token contracts often have a mint function that's not part of the standard ERC20
export const tokenAbiWithMint = [
  ...erc20Abi,
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Alternative mint signature (mints to msg.sender)
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
