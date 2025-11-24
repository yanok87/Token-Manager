import { Link } from "@mui/material";
import { getEtherscanUrl } from "@/utils/transaction";

type EtherscanLinkProps = {
  txHash: `0x${string}`;
};

/**
 * Component that displays a link to view transaction on Etherscan (Sepolia testnet)
 */
export function EtherscanLink({ txHash }: EtherscanLinkProps) {
  return (
    <Link
      href={getEtherscanUrl(txHash)}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        color: "inherit",
        textDecoration: "underline",
        fontWeight: 600,
        "&:hover": {
          textDecoration: "underline",
        },
      }}
    >
      View on Etherscan
    </Link>
  );
}
