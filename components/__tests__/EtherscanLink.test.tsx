import { render, screen } from "@testing-library/react";
import { EtherscanLink } from "../EtherscanLink";
import { getEtherscanUrl } from "@/utils/transaction";

jest.mock("@/utils/transaction", () => ({
  getEtherscanUrl: jest.fn((hash: string) => `https://sepolia.etherscan.io/tx/${hash}`),
}));

describe("EtherscanLink", () => {
  const mockTxHash = "0x1234567890123456789012345678901234567890123456789012345678901234" as `0x${string}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render a link to Etherscan", () => {
    render(<EtherscanLink txHash={mockTxHash} />);
    const link = screen.getByText("View on Etherscan");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", getEtherscanUrl(mockTxHash));
  });

  it("should open link in new tab", () => {
    render(<EtherscanLink txHash={mockTxHash} />);
    const link = screen.getByText("View on Etherscan");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should call getEtherscanUrl with correct hash", () => {
    render(<EtherscanLink txHash={mockTxHash} />);
    expect(getEtherscanUrl).toHaveBeenCalledWith(mockTxHash);
  });

  it("should render with different transaction hash", () => {
    const differentHash = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`;
    render(<EtherscanLink txHash={differentHash} />);
    expect(getEtherscanUrl).toHaveBeenCalledWith(differentHash);
  });
});

