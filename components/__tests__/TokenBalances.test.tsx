import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TokenBalances } from "../TokenBalances";
import { useReadContract } from "wagmi";
import { useWallet } from "@/context/WalletContext";

// Mock dependencies
jest.mock("wagmi");
jest.mock("@/context/WalletContext");

const mockUseReadContract = useReadContract as jest.MockedFunction<
  typeof useReadContract
>;
const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;

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

describe("TokenBalances", () => {
  const mockAddress =
    "0x1234567890123456789012345678901234567890" as `0x${string}`;
  const mockDAIBalance = BigInt("1000000000000000000"); // 1 DAI (18 decimals)
  const mockUSDCBalance = BigInt("2000000"); // 2 USDC (6 decimals)

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when address is not available", () => {
    mockUseWallet.mockReturnValue({
      isConnected: false,
      address: undefined,
    });

    const wrapper = createTestWrapper();
    const { container } = render(<TokenBalances />, { wrapper });
    expect(container.firstChild).toBeNull();
  });

  it("should render when address is available", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    // Mock useReadContract for DAI balance
    mockUseReadContract.mockReturnValueOnce({
      data: mockDAIBalance,
      isLoading: false,
      error: null,
    } as any);

    // Mock useReadContract for USDC balance
    mockUseReadContract.mockReturnValueOnce({
      data: mockUSDCBalance,
      isLoading: false,
      error: null,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    expect(screen.getByText(/Token Balances/i)).toBeInTheDocument();
  });

  it("should render both DAI and USDC balance items", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    // Mock useReadContract for DAI balance
    mockUseReadContract.mockReturnValueOnce({
      data: mockDAIBalance,
      isLoading: false,
      error: null,
    } as any);

    // Mock useReadContract for USDC balance
    mockUseReadContract.mockReturnValueOnce({
      data: mockUSDCBalance,
      isLoading: false,
      error: null,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    expect(screen.getByText(/DAI/i)).toBeInTheDocument();
    expect(screen.getByText(/USDC/i)).toBeInTheDocument();
  });

  it("should display formatted DAI balance correctly", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    // Mock useReadContract for DAI balance
    mockUseReadContract.mockReturnValueOnce({
      data: mockDAIBalance,
      isLoading: false,
      error: null,
    } as any);

    // Mock useReadContract for USDC balance
    mockUseReadContract.mockReturnValueOnce({
      data: mockUSDCBalance,
      isLoading: false,
      error: null,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    // Should display formatted balance (1 DAI)
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("should display formatted USDC balance correctly", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    // Mock useReadContract for DAI balance
    mockUseReadContract.mockReturnValueOnce({
      data: mockDAIBalance,
      isLoading: false,
      error: null,
    } as any);

    // Mock useReadContract for USDC balance
    mockUseReadContract.mockReturnValueOnce({
      data: mockUSDCBalance,
      isLoading: false,
      error: null,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    // Should display formatted balance (2 USDC)
    const balances = screen.getAllByText("2");
    expect(balances.length).toBeGreaterThan(0);
  });

  it("should show loading state for balance items", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    // Mock useReadContract for DAI balance - loading
    mockUseReadContract.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    // Mock useReadContract for USDC balance - loading
    mockUseReadContract.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    expect(screen.getByText(/Loading DAI.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading USDC.../i)).toBeInTheDocument();
    expect(screen.getAllByRole("progressbar").length).toBeGreaterThanOrEqual(2);
  });

  it("should show error state for balance items", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    const mockError = new Error("Failed to fetch balance");

    // Mock useReadContract for DAI balance - error
    mockUseReadContract.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as any);

    // Mock useReadContract for USDC balance - error
    mockUseReadContract.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    expect(screen.getByText(/Error loading DAI balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Error loading USDC balance/i)).toBeInTheDocument();
  });

  it("should display zero balance when balance is undefined", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    // Mock useReadContract for DAI balance - undefined
    mockUseReadContract.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    // Mock useReadContract for USDC balance - undefined
    mockUseReadContract.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    // Should display "0" for undefined balances
    const zeroBalances = screen.getAllByText("0");
    expect(zeroBalances.length).toBeGreaterThanOrEqual(2);
  });

  it("should handle large balances correctly", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    const largeDAIBalance = BigInt("1000000000000000000000"); // 1000 DAI

    // Mock useReadContract for DAI balance
    mockUseReadContract.mockReturnValueOnce({
      data: largeDAIBalance,
      isLoading: false,
      error: null,
    } as any);

    // Mock useReadContract for USDC balance
    mockUseReadContract.mockReturnValueOnce({
      data: mockUSDCBalance,
      isLoading: false,
      error: null,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    // Should display formatted large balance
    expect(screen.getByText("1000")).toBeInTheDocument();
  });

  it("should handle mixed loading and loaded states", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    // Mock useReadContract for DAI balance - loading
    mockUseReadContract.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    // Mock useReadContract for USDC balance - loaded
    mockUseReadContract.mockReturnValueOnce({
      data: mockUSDCBalance,
      isLoading: false,
      error: null,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    expect(screen.getByText(/Loading DAI.../i)).toBeInTheDocument();
    expect(screen.getByText(/USDC/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should handle mixed error and loaded states", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    const mockError = new Error("Failed to fetch");

    // Mock useReadContract for DAI balance - error
    mockUseReadContract.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as any);

    // Mock useReadContract for USDC balance - loaded
    mockUseReadContract.mockReturnValueOnce({
      data: mockUSDCBalance,
      isLoading: false,
      error: null,
    } as any);

    const wrapper = createTestWrapper();
    render(<TokenBalances />, { wrapper });

    expect(screen.getByText(/Error loading DAI balance/i)).toBeInTheDocument();
    expect(screen.getByText(/USDC/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
