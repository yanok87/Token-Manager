import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { MintTokens, MintButton } from "../MintTokens";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from "wagmi";
import { useWallet } from "@/context/WalletContext";

// Mock dependencies
jest.mock("wagmi");
jest.mock("@/context/WalletContext");
// Mock useQueryClient to return a mock object with invalidateQueries
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  const mockInvalidateQueries = jest.fn();
  return {
    ...actual,
    useQueryClient: jest.fn(() => ({
      invalidateQueries: mockInvalidateQueries,
    })),
  };
});
jest.mock("@/components/AnimatedText", () => ({
  AnimatedText: ({ text }: { text: string }) => <span>{text}</span>,
}));
jest.mock("@/components/EtherscanLink", () => ({
  EtherscanLink: ({ txHash }: { txHash: string }) => (
    <a href={`https://etherscan.io/tx/${txHash}`}>View on Etherscan</a>
  ),
}));

const mockUseWriteContract = useWriteContract as jest.MockedFunction<
  typeof useWriteContract
>;
const mockUseWaitForTransactionReceipt =
  useWaitForTransactionReceipt as jest.MockedFunction<
    typeof useWaitForTransactionReceipt
  >;
const mockUseChainId = useChainId as jest.MockedFunction<typeof useChainId>;
const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;
const mockUseQueryClient = useQueryClient as jest.MockedFunction<
  typeof useQueryClient
>;

// Test wrapper with QueryClient
const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("MintTokens", () => {
  const mockAddress =
    "0x1234567890123456789012345678901234567890" as `0x${string}`;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseChainId.mockReturnValue(11155111); // Sepolia chain ID
  });

  it("should not render when address is not available", () => {
    mockUseWallet.mockReturnValue({
      isConnected: false,
      address: undefined,
    });

    const wrapper = createTestWrapper();
    const { container } = render(<MintTokens />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it("should render when address is available", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    mockUseWriteContract.mockReturnValue({
      writeContract: jest.fn(),
      data: undefined,
      isPending: false,
      error: null,
      reset: jest.fn(),
    } as any);

    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
    } as any);

    const wrapper = createTestWrapper();
    render(<MintTokens />, { wrapper });

    expect(screen.getByText(/Mint Test Tokens/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Get test tokens to use in the app/i),
    ).toBeInTheDocument();
  });

  it("should render both DAI and USDC mint buttons", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    mockUseWriteContract.mockReturnValue({
      writeContract: jest.fn(),
      data: undefined,
      isPending: false,
      error: null,
      reset: jest.fn(),
    } as any);

    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
    } as any);

    const wrapper = createTestWrapper();
    render(<MintTokens />, { wrapper });

    expect(screen.getByText(/Mint DAI/i)).toBeInTheDocument();
    expect(screen.getByText(/Mint USDC/i)).toBeInTheDocument();
  });
});

describe("MintButton", () => {
  const mockAddress =
    "0x1234567890123456789012345678901234567890" as `0x${string}`;
  const mockWriteContract = jest.fn();
  const mockInvalidateQueries = jest.fn();

  const renderMintButton = (symbol: "DAI" | "USDC" = "DAI") => {
    const wrapper = createTestWrapper();
    return render(<MintButton symbol={symbol} address={mockAddress} />, {
      wrapper,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseChainId.mockReturnValue(11155111);

    mockUseQueryClient.mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as any);

    mockUseWriteContract.mockReturnValue({
      writeContract: mockWriteContract,
      data: undefined,
      isPending: false,
      error: null,
      reset: jest.fn(),
    } as any);

    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
    } as any);
  });

  describe("Rendering", () => {
    it("should render mint button with correct symbol", () => {
      renderMintButton("DAI");
      expect(screen.getByText(/Mint DAI/i)).toBeInTheDocument();
    });

    it("should render USDC mint button", () => {
      renderMintButton("USDC");
      expect(screen.getByText(/Mint USDC/i)).toBeInTheDocument();
    });
  });

  describe("Mint functionality", () => {
    it("should call writeContract with correct parameters when mint button is clicked", async () => {
      const user = userEvent.setup();
      renderMintButton("DAI");

      const mintButton = screen.getByText(/Mint DAI/i).closest("button");
      expect(mintButton).toBeDefined();
      if (mintButton) {
        await user.click(mintButton);
      }

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith({
          address: expect.any(String),
          abi: expect.any(Array),
          functionName: "mint",
          args: [mockAddress, expect.any(BigInt)],
        });
      });
    });

    it("should call writeContract with correct amount for DAI (18 decimals)", async () => {
      const user = userEvent.setup();
      renderMintButton("DAI");

      const mintButton = screen.getByText(/Mint DAI/i).closest("button");
      if (mintButton) {
        await user.click(mintButton);
      }

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith(
          expect.objectContaining({
            args: [mockAddress, BigInt("1000000000000000000000")], // 1000 DAI with 18 decimals
          }),
        );
      });
    });

    it("should call writeContract with correct amount for USDC (6 decimals)", async () => {
      const user = userEvent.setup();
      renderMintButton("USDC");

      const mintButton = screen.getByText(/Mint USDC/i).closest("button");
      if (mintButton) {
        await user.click(mintButton);
      }

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith(
          expect.objectContaining({
            args: [mockAddress, BigInt("1000000000")], // 1000 USDC with 6 decimals
          }),
        );
      });
    });
  });

  describe("Loading states", () => {
    it("should show loading spinner when transaction is pending", () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: true,
        error: null,
        reset: jest.fn(),
      } as any);

      renderMintButton("DAI");

      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toBeInTheDocument();
    });

    it('should show "Minting" text when transaction is confirming', () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: "0x123" as `0x${string}`,
        isPending: false,
        error: null,
        reset: jest.fn(),
      } as any);

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: true,
        isSuccess: false,
      } as any);

      renderMintButton("DAI");

      expect(screen.getByText(/Minting/i)).toBeInTheDocument();
    });

    it("should disable button when loading", () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: true,
        error: null,
        reset: jest.fn(),
      } as any);

      renderMintButton("DAI");

      const progressbar = screen.getByRole("progressbar");
      const mintButton = progressbar.closest("button");
      expect(mintButton).toBeDisabled();
    });
  });

  describe("Error handling", () => {
    it("should show error message when transaction fails", async () => {
      const mockError = new Error("Transaction failed");
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: mockError,
        reset: jest.fn(),
      } as any);

      renderMintButton("DAI");

      await waitFor(() => {
        expect(screen.getByText(/Transaction failed/i)).toBeInTheDocument();
      });
    });

    it("should show user rejection message when user cancels", async () => {
      const mockError = new Error("User rejected") as any;
      mockError.code = 4001;
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: mockError,
        reset: jest.fn(),
      } as any);

      renderMintButton("DAI");

      await waitFor(() => {
        expect(screen.getByText(/Transaction cancelled/i)).toBeInTheDocument();
      });
    });

    it("should allow closing error alert", async () => {
      const mockError = new Error("Transaction failed");
      const mockReset = jest.fn();
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: mockError,
        reset: mockReset,
      } as any);

      const user = userEvent.setup();
      renderMintButton("DAI");

      await waitFor(() => {
        expect(screen.getByText(/Transaction failed/i)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/Transaction failed/i),
        ).not.toBeInTheDocument();
      });
      expect(mockReset).toHaveBeenCalled();
    });

    it("should show mint function not found message when error message includes 'mint'", async () => {
      const mockError = new Error("mint function not found");
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: mockError,
        reset: jest.fn(),
      } as any);

      renderMintButton("DAI");

      await waitFor(() => {
        expect(
          screen.getByText(/Mint function not found/i),
        ).toBeInTheDocument();
      });
    });

    it("should show generic error message when error does not include 'mint'", async () => {
      // Use an error message that doesn't include "mint" and isn't a user rejection
      const mockError = new Error("Network error");
      const mockReset = jest.fn();
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: mockError,
        reset: mockReset,
      } as any);

      renderMintButton("DAI");

      // Wait for the error to be processed and displayed
      // Note: getErrorMessage returns error.message if no custom default matches
      // So we check for the error message being displayed
      await waitFor(
        () => {
          const alert = screen.getByRole("alert");
          expect(alert).toBeInTheDocument();
          // The error message should be displayed (either formatted or raw)
          expect(alert).toHaveTextContent(/Network error|An error occurred/i);
        },
        { timeout: 3000 },
      );
    });
  });

  describe("Success handling", () => {
    it("should show success message when transaction succeeds", async () => {
      const mockHash = "0x1234567890abcdef" as `0x${string}`;

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: mockHash,
        isPending: false,
        error: null,
        reset: jest.fn(),
      } as any);

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
      } as any);

      renderMintButton("DAI");

      await waitFor(() => {
        expect(
          screen.getByText(/Successfully minted 1000 DAI!/i),
        ).toBeInTheDocument();
      });

      expect(mockInvalidateQueries).toHaveBeenCalled();
    });

    it("should show Etherscan link in success message", async () => {
      const mockHash = "0x1234567890abcdef" as `0x${string}`;

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: mockHash,
        isPending: false,
        error: null,
        reset: jest.fn(),
      } as any);

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
      } as any);

      renderMintButton("DAI");

      await waitFor(() => {
        expect(screen.getByText(/View on Etherscan/i)).toBeInTheDocument();
      });
    });

    it("should allow closing success alert", async () => {
      const mockHash = "0x1234567890abcdef" as `0x${string}`;

      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: mockHash,
        isPending: false,
        error: null,
        reset: jest.fn(),
      } as any);

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
      } as any);

      const user = userEvent.setup();
      renderMintButton("DAI");

      await waitFor(() => {
        expect(screen.getByText(/Successfully minted/i)).toBeInTheDocument();
      });

      // Find the close button in the success alert
      const alerts = screen.getAllByRole("alert");
      const successAlert = alerts.find((alert) =>
        alert.textContent?.includes("Successfully minted"),
      );

      if (successAlert) {
        const closeButton =
          successAlert.querySelector('button[aria-label="Close"]') ||
          successAlert.querySelector('button[aria-label="close"]');

        if (closeButton) {
          await user.click(closeButton);
        }
      }

      await waitFor(
        () => {
          expect(
            screen.queryByText(/Successfully minted/i),
          ).not.toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });

  describe("Alert reset behavior", () => {
    it("should hide error alert when starting a new transaction", async () => {
      const mockError = new Error("Previous error");
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: mockError,
        reset: jest.fn(),
      } as any);

      const { rerender } = renderMintButton("DAI");

      await waitFor(() => {
        expect(screen.getByText(/Previous error/i)).toBeInTheDocument();
      });

      // Simulate starting a new transaction
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: true,
        error: null,
        reset: jest.fn(),
      } as any);

      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <MintButton symbol="DAI" address={mockAddress} />
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(screen.queryByText(/Previous error/i)).not.toBeInTheDocument();
      });
    });
  });
});
