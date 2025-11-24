import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NetworkWarning } from "../NetworkWarning";
import { useChainId, useSwitchChain } from "wagmi";
import { useWallet } from "@/context/WalletContext";

// Mock dependencies
jest.mock("wagmi");
jest.mock("@/context/WalletContext");
jest.mock("@/lib/wagmiConfig", () => ({
  REQUIRED_CHAIN_ID: 11155111, // Sepolia chain ID
  REQUIRED_CHAIN: {
    id: 11155111,
    name: "Sepolia",
  },
}));

// Import after mocks
const { REQUIRED_CHAIN_ID, REQUIRED_CHAIN } = require("@/lib/wagmiConfig");

const mockUseChainId = useChainId as jest.MockedFunction<typeof useChainId>;
const mockUseSwitchChain = useSwitchChain as jest.MockedFunction<
  typeof useSwitchChain
>;
const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

describe("NetworkWarning", () => {
  const mockSwitchChain = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSwitchChain.mockReturnValue({
      switchChain: mockSwitchChain,
      isPending: false,
    } as any);
  });

  it("should not render when wallet is not connected", () => {
    mockUseWallet.mockReturnValue({
      isConnected: false,
      address: undefined,
    });

    mockUseChainId.mockReturnValue(1); // Wrong chain

    const { container } = render(<NetworkWarning />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when on correct network", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    });

    mockUseChainId.mockReturnValue(REQUIRED_CHAIN_ID);

    const { container } = render(<NetworkWarning />);
    expect(container.firstChild).toBeNull();
  });

  it("should render warning when connected but on wrong network", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    });

    mockUseChainId.mockReturnValue(1); // Wrong chain (Mainnet instead of Sepolia)

    render(<NetworkWarning />);

    expect(screen.getByText(/Wrong Network Detected/i)).toBeInTheDocument();
    // Text is split across elements, so check for parts
    expect(screen.getByText(/This app requires the/i)).toBeInTheDocument();
    // "Sepolia" appears in both the message and button, so use getAllByText
    expect(
      screen.getAllByText(new RegExp(REQUIRED_CHAIN.name, "i")).length,
    ).toBeGreaterThan(0);
  });

  it("should display switch chain button with correct network name", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    });

    mockUseChainId.mockReturnValue(1); // Wrong chain

    render(<NetworkWarning />);

    const switchButton = screen.getByRole("button", {
      name: new RegExp(`Switch to ${REQUIRED_CHAIN.name}`, "i"),
    });
    expect(switchButton).toBeInTheDocument();
  });

  it("should call switchChain with correct chainId when button is clicked", async () => {
    const user = userEvent.setup();
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    });

    mockUseChainId.mockReturnValue(1); // Wrong chain

    render(<NetworkWarning />);

    const switchButton = screen.getByRole("button", {
      name: new RegExp(`Switch to ${REQUIRED_CHAIN.name}`, "i"),
    });
    await user.click(switchButton);

    expect(mockSwitchChain).toHaveBeenCalledWith({
      chainId: REQUIRED_CHAIN_ID,
    });
  });

  it('should disable button and show "Switching..." when switch is pending', () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    });

    mockUseChainId.mockReturnValue(1); // Wrong chain

    mockUseSwitchChain.mockReturnValue({
      switchChain: mockSwitchChain,
      isPending: true,
    } as any);

    render(<NetworkWarning />);

    const switchButton = screen.getByRole("button", { name: /Switching.../i });
    expect(switchButton).toBeInTheDocument();
    expect(switchButton).toBeDisabled();
  });

  it("should show warning icon", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    });

    mockUseChainId.mockReturnValue(1); // Wrong chain

    render(<NetworkWarning />);

    // The Warning icon should be present (Material-UI renders it as an SVG)
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("should render with error severity styling", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    });

    mockUseChainId.mockReturnValue(1); // Wrong chain

    render(<NetworkWarning />);

    const alert = screen.getByRole("alert");
    // Material-UI Alert uses class names for severity, not attributes
    expect(alert).toHaveClass("MuiAlert-colorError");
  });

  it("should handle different wrong chain IDs", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: "0x1234567890123456789012345678901234567890" as `0x${string}`,
    });

    // Test with different wrong chains
    const wrongChains = [1, 5, 137]; // Mainnet, Goerli, Polygon

    wrongChains.forEach((chainId) => {
      mockUseChainId.mockReturnValue(chainId);
      const { unmount } = render(<NetworkWarning />);

      expect(screen.getByText(/Wrong Network Detected/i)).toBeInTheDocument();

      unmount();
    });
  });
});
