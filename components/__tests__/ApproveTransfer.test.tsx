import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApproveTransferItem, ApproveTransfer } from "../ApproveTransfer";
import { useReadContract } from "wagmi";
import { useWallet } from "@/context/WalletContext";
import { useApproveToken } from "@/hooks/useApproveToken";
import { useTransferToken } from "@/hooks/useTransferToken";

// Mock dependencies
jest.mock("wagmi");
jest.mock("@/context/WalletContext");
jest.mock("@/hooks/useApproveToken");
jest.mock("@/hooks/useTransferToken");

// Override the global mock for useQueryClient to return a mock with invalidateQueries
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    // Keep QueryClientProvider as real implementation
    QueryClientProvider: actual.QueryClientProvider,
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

const mockUseReadContract = useReadContract as jest.MockedFunction<
  typeof useReadContract
>;
const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;
const mockUseApproveToken = useApproveToken as jest.MockedFunction<
  typeof useApproveToken
>;
const mockUseTransferToken = useTransferToken as jest.MockedFunction<
  typeof useTransferToken
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

describe("ApproveTransferItem", () => {
  const mockAddress =
    "0x1234567890123456789012345678901234567890" as `0x${string}`;
  const mockSpender =
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`;
  const mockRecipient =
    "0x9876543210987654321098765432109876543210" as `0x${string}`;
  const mockBalance = BigInt("1000000000000000000"); // 1 DAI (18 decimals)
  const mockAllowance = BigInt("500000000000000000"); // 0.5 DAI

  const mockApprove = jest.fn();
  const mockTransfer = jest.fn();
  const mockResetApprove = jest.fn();
  const mockResetTransfer = jest.fn();
  const mockRefetchBalance = jest.fn();
  const mockRefetchAllowance = jest.fn();

  const renderComponent = () => {
    const wrapper = createTestWrapper();
    return render(<ApproveTransferItem symbol="DAI" address={mockAddress} />, {
      wrapper,
    });
  };

  // Helper to find buttons by their text content or by position when loading
  const getButtonByText = (text: string | RegExp): HTMLElement | null => {
    const buttons = screen.getAllByRole("button");
    return (
      buttons.find((btn) => {
        const btnText = btn.textContent || "";
        // Check if button contains the text or a loading spinner
        const hasText =
          typeof text === "string"
            ? btnText.includes(text)
            : text.test(btnText);
        // Check if button has a CircularProgress (spinner) - for loading states
        const hasSpinner = btn.querySelector('[role="progressbar"]') !== null;
        return hasText || hasSpinner;
      }) || null
    );
  };

  // Helper to get buttons by position when we know the layout
  const getApproveButton = (): HTMLElement | null => {
    const buttons = screen.getAllByRole("button");
    // Approve button is typically the first transaction button
    // Filter out close buttons and other UI buttons
    const transactionButtons = buttons.filter(
      (btn) =>
        !btn.textContent?.match(/close|×/i) &&
        (btn.textContent?.match(/APPROVE|Approving/i) ||
          btn.querySelector('[role="progressbar"]')),
    );
    return transactionButtons[0] || null;
  };

  const getTransferButton = (): HTMLElement | null => {
    const buttons = screen.getAllByRole("button");
    const transactionButtons = buttons.filter(
      (btn) =>
        !btn.textContent?.match(/close|×/i) &&
        (btn.textContent?.match(/TRANSFER|Transferring/i) ||
          btn.querySelector('[role="progressbar"]')),
    );
    // Transfer button is the second transaction button
    return transactionButtons[1] || transactionButtons[0] || null;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useWallet
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    // Mock useReadContract - return balance for balanceOf, allowance for allowance
    mockUseReadContract.mockImplementation(({ functionName }: any) => {
      if (functionName === "balanceOf") {
        return {
          data: mockBalance,
          refetch: mockRefetchBalance,
          isLoading: false,
          error: null,
        } as any;
      } else if (functionName === "allowance") {
        return {
          data: mockAllowance,
          refetch: mockRefetchAllowance,
          isLoading: false,
          error: null,
        } as any;
      }
      return {
        data: undefined,
        refetch: jest.fn(),
        isLoading: false,
        error: null,
      } as any;
    });

    // Mock approve hook
    mockUseApproveToken.mockReturnValue({
      approve: mockApprove,
      isLoading: false,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      error: null,
      hash: undefined,
      reset: mockResetApprove,
    });

    // Mock transfer hook
    mockUseTransferToken.mockReturnValue({
      transfer: mockTransfer,
      isLoading: false,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      error: null,
      hash: undefined,
      reset: mockResetTransfer,
    });
  });

  describe("Rendering", () => {
    it("should render the component with token symbol", () => {
      renderComponent();
      expect(screen.getByText(/DAI - Approve & Transfer/i)).toBeInTheDocument();
    });

    it("should display token balance", () => {
      renderComponent();
      expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
    });

    it("should render approve and transfer buttons", () => {
      renderComponent();
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      const approveButtons = screen.getAllByText(/APPROVE/i);
      const transferButtons = screen.getAllByText(/TRANSFER/i);
      expect(approveButtons.length).toBeGreaterThanOrEqual(1);
      expect(transferButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("should render input fields for amount, spender, and recipient", () => {
      renderComponent();
      expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Spender Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Recipient Address/i)).toBeInTheDocument();
    });
  });

  describe("Approve functionality", () => {
    it("should disable approve button when amount or spender is missing", () => {
      renderComponent();

      const approveButton = getButtonByText(/APPROVE/i);
      expect(approveButton).toBeInTheDocument();
      expect(approveButton).toBeDisabled();
    });

    it("should enable approve button when amount and spender are provided", async () => {
      const user = userEvent.setup();
      renderComponent();

      const amountInput = screen.getByLabelText(/Amount/i);
      const spenderInput = screen.getByLabelText(/Spender Address/i);

      await user.type(amountInput, "1");
      await user.type(spenderInput, mockSpender);

      const approveButton = getButtonByText(/APPROVE/i);
      expect(approveButton).toBeInTheDocument();
      expect(approveButton).not.toBeDisabled();
    });

    it("should call approve hook when approve button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();

      const amountInput = screen.getByLabelText(/Amount/i);
      const spenderInput = screen.getByLabelText(/Spender Address/i);

      await user.type(amountInput, "1");
      await user.type(spenderInput, mockSpender);

      const approveButton = getButtonByText(/APPROVE/i);
      expect(approveButton).toBeInTheDocument();
      await user.click(approveButton!);

      await waitFor(() => {
        expect(mockApprove).toHaveBeenCalledWith("1", mockSpender);
      });
    });

    it("should show error from approve hook", async () => {
      mockUseApproveToken.mockReturnValue({
        approve: mockApprove,
        isLoading: false,
        isPending: false,
        isConfirming: false,
        isSuccess: false,
        error: new Error("Invalid spender address"),
        hash: undefined,
        reset: mockResetApprove,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Invalid spender address/i)).toBeInTheDocument();
      });
    });
  });

  describe("Transfer functionality", () => {
    it("should disable transfer button when amount or recipient is missing", () => {
      renderComponent();

      const transferButton = getButtonByText(/TRANSFER/i);
      expect(transferButton).toBeInTheDocument();
      expect(transferButton).toBeDisabled();
    });

    it("should enable transfer button when amount and recipient are provided", async () => {
      const user = userEvent.setup();
      renderComponent();

      const amountInput = screen.getByLabelText(/Amount/i);
      const recipientInput = screen.getByLabelText(/Recipient Address/i);

      await user.type(amountInput, "0.5");
      await user.type(recipientInput, mockRecipient);

      const transferButton = getButtonByText(/TRANSFER/i);
      expect(transferButton).toBeInTheDocument();
      expect(transferButton).not.toBeDisabled();
    });

    it("should call transfer hook when transfer button is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();

      const amountInput = screen.getByLabelText(/Amount/i);
      const recipientInput = screen.getByLabelText(/Recipient Address/i);

      await user.type(amountInput, "0.5");
      await user.type(recipientInput, mockRecipient);

      const transferButton = getButtonByText(/TRANSFER/i);
      expect(transferButton).toBeInTheDocument();
      await user.click(transferButton!);

      await waitFor(() => {
        expect(mockTransfer).toHaveBeenCalledWith("0.5", mockRecipient);
      });
    });

    it("should show error from transfer hook", async () => {
      mockUseTransferToken.mockReturnValue({
        transfer: mockTransfer,
        isLoading: false,
        isPending: false,
        isConfirming: false,
        isSuccess: false,
        error: new Error("Not enough funds"),
        hash: undefined,
        reset: mockResetTransfer,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Not enough funds/i)).toBeInTheDocument();
      });
    });
  });

  describe("Loading states", () => {
    it("should disable buttons when approve is loading", () => {
      mockUseApproveToken.mockReturnValue({
        approve: mockApprove,
        isLoading: true,
        isPending: true,
        isConfirming: false,
        isSuccess: false,
        error: null,
        hash: undefined,
        reset: mockResetApprove,
      });

      renderComponent();

      // When loading, buttons show spinner, so find by position/role
      // Get all buttons and filter to find transaction buttons
      const buttons = screen.getAllByRole("button");
      const transactionButtons = buttons.filter(
        (btn) =>
          !btn.textContent?.match(/close|×/i) &&
          !btn.getAttribute("aria-label")?.match(/close/i),
      );
      // First button should be Approve (may have spinner), second is Transfer
      const approveButton = transactionButtons.find(
        (btn) =>
          btn.textContent?.match(/APPROVE|Approving/i) ||
          btn.querySelector('[role="progressbar"]') !== null,
      );
      const transferButton = transactionButtons.find(
        (btn) => btn.textContent?.match(/TRANSFER/i),
      );
      expect(approveButton).toBeDefined();
      expect(transferButton).toBeDefined();
      expect(approveButton).toBeDisabled();
      expect(transferButton).toBeDisabled();
    });

    it("should disable buttons when transfer is loading", () => {
      mockUseTransferToken.mockReturnValue({
        transfer: mockTransfer,
        isLoading: true,
        isPending: true,
        isConfirming: false,
        isSuccess: false,
        error: null,
        hash: undefined,
        reset: mockResetTransfer,
      });

      renderComponent();

      // When loading, buttons show spinner, so find by position/role
      const buttons = screen.getAllByRole("button");
      const transactionButtons = buttons.filter(
        (btn) =>
          !btn.textContent?.match(/close|×/i) &&
          !btn.getAttribute("aria-label")?.match(/close/i),
      );
      // First button is Approve, second should be Transfer (may have spinner)
      const approveButton = transactionButtons.find(
        (btn) => btn.textContent?.match(/APPROVE/i),
      );
      const transferButton = transactionButtons.find(
        (btn) =>
          btn.textContent?.match(/TRANSFER|Transferring/i) ||
          btn.querySelector('[role="progressbar"]') !== null,
      );
      expect(approveButton).toBeDefined();
      expect(transferButton).toBeDefined();
      expect(approveButton).toBeDisabled();
      expect(transferButton).toBeDisabled();
    });

    it("should show loading spinner when approve is pending", () => {
      mockUseApproveToken.mockReturnValue({
        approve: mockApprove,
        isLoading: true,
        isPending: true,
        isConfirming: false,
        isSuccess: false,
        error: null,
        hash: undefined,
        reset: mockResetApprove,
      });

      renderComponent();

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should show confirming text when approve is confirming", () => {
      mockUseApproveToken.mockReturnValue({
        approve: mockApprove,
        isLoading: true,
        isPending: false,
        isConfirming: true,
        isSuccess: false,
        error: null,
        hash: "0x123" as `0x${string}`,
        reset: mockResetApprove,
      });

      renderComponent();

      const approvingTexts = screen.getAllByText(/Approving/i);
      expect(approvingTexts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Success states", () => {
    it("should show success message when approve succeeds", async () => {
      const mockHash = "0x1234567890abcdef" as `0x${string}`;
      mockUseApproveToken.mockReturnValue({
        approve: mockApprove,
        isLoading: false,
        isPending: false,
        isConfirming: false,
        isSuccess: true,
        error: null,
        hash: mockHash,
        reset: mockResetApprove,
      });

      renderComponent();

      await waitFor(() => {
        expect(
          screen.getByText(/Successfully approved/i),
        ).toBeInTheDocument();
      });
    });

    it("should show success message when transfer succeeds", async () => {
      const mockHash = "0x1234567890abcdef" as `0x${string}`;
      mockUseTransferToken.mockReturnValue({
        transfer: mockTransfer,
        isLoading: false,
        isPending: false,
        isConfirming: false,
        isSuccess: true,
        error: null,
        hash: mockHash,
        reset: mockResetTransfer,
      });

      renderComponent();

      await waitFor(() => {
        expect(
          screen.getByText(/Successfully transferred/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Allowance display", () => {
    it("should not display allowance when spender is invalid", () => {
      renderComponent();
      expect(screen.queryByText(/Current Allowance:/i)).not.toBeInTheDocument();
    });

    it("should display allowance when spender is valid", async () => {
      const user = userEvent.setup();
      renderComponent();

      const spenderInput = screen.getByLabelText(/Spender Address/i);
      await user.type(spenderInput, mockSpender);

      await waitFor(() => {
        expect(screen.getByText(/Current Allowance:/i)).toBeInTheDocument();
      });
    });
  });

  describe("Error handling", () => {
    it("should close error alert when close button is clicked", async () => {
      mockUseApproveToken.mockReturnValue({
        approve: mockApprove,
        isLoading: false,
        isPending: false,
        isConfirming: false,
        isSuccess: false,
        error: new Error("Test error"),
        hash: undefined,
        reset: mockResetApprove,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Test error/i)).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", { name: /close/i });
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
      });

      expect(mockResetApprove).toHaveBeenCalled();
      expect(mockResetTransfer).toHaveBeenCalled();
    });
  });
});

describe("ApproveTransfer", () => {
  const mockAddress =
    "0x1234567890123456789012345678901234567890" as `0x${string}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render nothing when address is not available", () => {
    mockUseWallet.mockReturnValue({
      isConnected: false,
      address: undefined,
    });

    const wrapper = createTestWrapper();
    const { container } = render(<ApproveTransfer />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it("should render ApproveTransferItem components when address is available", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    mockUseReadContract.mockReturnValue({
      data: BigInt("1000000000000000000"),
      refetch: jest.fn(),
    } as any);

    mockUseApproveToken.mockReturnValue({
      approve: jest.fn(),
      isLoading: false,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      error: null,
      hash: undefined,
      reset: jest.fn(),
    });

    mockUseTransferToken.mockReturnValue({
      transfer: jest.fn(),
      isLoading: false,
      isPending: false,
      isConfirming: false,
      isSuccess: false,
      error: null,
      hash: undefined,
      reset: jest.fn(),
    });

    const wrapper = createTestWrapper();
    render(<ApproveTransfer />, { wrapper });

    expect(screen.getByText(/DAI - Approve & Transfer/i)).toBeInTheDocument();
    expect(screen.getByText(/USDC - Approve & Transfer/i)).toBeInTheDocument();
  });
});
