import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTransferToken } from "../useTransferToken";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

// Mock dependencies
jest.mock("wagmi");

// Unmock QueryClientProvider to use the real implementation
jest.unmock("@tanstack/react-query");

const mockUseWriteContract = useWriteContract as jest.MockedFunction<
  typeof useWriteContract
>;
const mockUseWaitForTransactionReceipt =
  useWaitForTransactionReceipt as jest.MockedFunction<
    typeof useWaitForTransactionReceipt
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

describe("useTransferToken", () => {
  const mockWriteContract = jest.fn();
  const mockReset = jest.fn();
  const mockRefetchBalance = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockBalance = BigInt("1000000000000000000"); // 1 token

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseWriteContract.mockReturnValue({
      writeContract: mockWriteContract,
      data: undefined,
      isPending: false,
      error: null,
      reset: mockReset,
    } as any);

    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: false,
      error: null,
    } as any);
  });

  describe("Transfer function", () => {
    it("should set error when amount is missing", async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      await result.current.transfer("", "0x1234567890123456789012345678901234567890");

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toBe(
          "Please enter amount and recipient address",
        );
      });
    });

    it("should set error when recipient is missing", async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      await result.current.transfer("1", "");

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toBe(
          "Please enter amount and recipient address",
        );
      });
    });

    it("should set error when amount is 0", async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      await result.current.transfer("0", "0x1234567890123456789012345678901234567890");

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toBe(
          "Transfer amount must be greater than 0",
        );
      });
    });

    it("should set error when recipient address is invalid", async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      await result.current.transfer("1", "invalid-address");

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toBe("Invalid recipient address");
      });
    });

    it("should set error when amount exceeds balance", async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      await result.current.transfer("1000", "0x1234567890123456789012345678901234567890");

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.error?.message).toBe("Not enough funds");
      });
    });

    it("should call writeContract with correct parameters", async () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      const recipient = "0x1234567890123456789012345678901234567890";
      await result.current.transfer("0.5", recipient);

      await waitFor(() => {
        expect(mockWriteContract).toHaveBeenCalledWith({
          address: expect.any(String),
          abi: expect.any(Array),
          functionName: "transfer",
          args: [recipient, BigInt("500000000000000000")], // 0.5 DAI with 18 decimals
        });
      });
    });
  });

  describe("Loading states", () => {
    it("should return isLoading true when pending", () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: true,
        error: null,
        reset: mockReset,
      } as any);

      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isPending).toBe(true);
    });

    it("should return isLoading true when confirming", () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: "0x123" as `0x${string}`,
        isPending: false,
        error: null,
        reset: mockReset,
      } as any);

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: true,
        isSuccess: false,
        error: null,
      } as any);

      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isConfirming).toBe(true);
    });
  });

  describe("Success handling", () => {
    it("should call onRefetchBalance on success", async () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: "0x123" as `0x${string}`,
        isPending: false,
        error: null,
        reset: mockReset,
      } as any);

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
        error: null,
      } as any);

      const wrapper = createTestWrapper();
      renderHook(
        () =>
          useTransferToken({
            symbol: "DAI",
            balance: mockBalance,
            onRefetchBalance: mockRefetchBalance,
          }),
        { wrapper },
      );

      await waitFor(() => {
        expect(mockRefetchBalance).toHaveBeenCalled();
      });
    });

    it("should call onSuccess callback on success", async () => {
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: "0x123" as `0x${string}`,
        isPending: false,
        error: null,
        reset: mockReset,
      } as any);

      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: true,
        error: null,
      } as any);

      const wrapper = createTestWrapper();
      renderHook(
        () =>
          useTransferToken({
            symbol: "DAI",
            balance: mockBalance,
            onSuccess: mockOnSuccess,
          }),
        { wrapper },
      );

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe("Error handling", () => {
    it("should return error from writeContract", () => {
      const mockError = new Error("Write error");
      mockUseWriteContract.mockReturnValue({
        writeContract: mockWriteContract,
        data: undefined,
        isPending: false,
        error: mockError,
        reset: mockReset,
      } as any);

      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      expect(result.current.error).toBe(mockError);
    });

    it("should return error from transaction receipt", () => {
      const mockError = new Error("Receipt error");
      mockUseWaitForTransactionReceipt.mockReturnValue({
        isLoading: false,
        isSuccess: false,
        error: mockError,
      } as any);

      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      expect(result.current.error).toBe(mockError);
    });
  });

  describe("Reset function", () => {
    it("should reset error and write contract", () => {
      const wrapper = createTestWrapper();
      const { result } = renderHook(
        () => useTransferToken({ symbol: "DAI", balance: mockBalance }),
        { wrapper },
      );

      result.current.reset();

      expect(mockReset).toHaveBeenCalled();
    });
  });
});

