import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEvents } from "../useEvents";
import { useWallet } from "@/context/WalletContext";
import { usePublicClient } from "wagmi";
import { parseEventLogs } from "viem";

// Mock dependencies
jest.mock("@/context/WalletContext");
jest.mock("wagmi");
jest.mock("viem", () => {
  const actual = jest.requireActual("viem");
  return {
    ...actual,
    parseEventLogs: jest.fn(),
  };
});

// Unmock QueryClientProvider to use the real implementation
jest.unmock("@tanstack/react-query");

const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>;
const mockUsePublicClient = usePublicClient as jest.MockedFunction<
  typeof usePublicClient
>;
const mockParseEventLogs = parseEventLogs as jest.MockedFunction<
  typeof parseEventLogs
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

describe("useEvents", () => {
  const mockAddress =
    "0x1234567890123456789012345678901234567890" as `0x${string}`;
  const mockPublicClient = {
    getBlockNumber: jest.fn(),
    getLogs: jest.fn(),
    getBlock: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: mockAddress,
    });

    mockUsePublicClient.mockReturnValue(mockPublicClient as any);
  });

  it("should return empty array when wallet is not connected", () => {
    mockUseWallet.mockReturnValue({
      isConnected: false,
      address: undefined,
    });

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current.events).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should return empty array when address is not available", () => {
    mockUseWallet.mockReturnValue({
      isConnected: true,
      address: undefined,
    });

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current.events).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should return empty array when publicClient is not available", () => {
    mockUsePublicClient.mockReturnValue(undefined as any);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current.events).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should fetch recent events (last 500 blocks)", async () => {
    const currentBlock = BigInt(10000);
    const fromBlock = currentBlock - BigInt(500);

    mockPublicClient.getBlockNumber.mockResolvedValue(currentBlock);
    mockPublicClient.getLogs.mockResolvedValue([]);
    mockParseEventLogs.mockReturnValue([]);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockPublicClient.getBlockNumber).toHaveBeenCalled();
    // getLogs is called for each token (DAI, USDC) and each event type (Transfer, Approval)
    // So it should be called at least once with the correct block range
    expect(mockPublicClient.getLogs).toHaveBeenCalled();
    const calls = mockPublicClient.getLogs.mock.calls;
    const hasCorrectBlockRange = calls.some((call) => {
      const args = call[0] as any;
      return args.fromBlock === fromBlock && args.toBlock === currentBlock;
    });
    expect(hasCorrectBlockRange).toBe(true);
  });

  it("should filter Transfer events by user address", async () => {
    const currentBlock = BigInt(10000);
    const mockTransferLog = {
      eventName: "Transfer" as const,
      args: {
        from: mockAddress,
        to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`,
        value: BigInt(1000000000000000000), // 1 DAI (18 decimals)
      },
      transactionHash:
        "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`,
      blockNumber: BigInt(1000),
    };

    mockPublicClient.getBlockNumber.mockResolvedValue(currentBlock);
    mockPublicClient.getLogs.mockResolvedValue([
      {
        address: "0xDAI_ADDRESS" as `0x${string}`,
        topics: [],
        data: "0x",
        blockNumber: BigInt(1000),
        transactionHash:
          "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`,
      },
    ] as any);
    mockParseEventLogs.mockReturnValue([mockTransferLog] as any);
    mockPublicClient.getBlock.mockResolvedValue({
      timestamp: BigInt(1234567890),
    } as any);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.events.length).toBeGreaterThan(0);
    const transferEvent = result.current.events.find(
      (e) => e.type === "Transfer",
    );
    expect(transferEvent).toBeDefined();
    if (transferEvent) {
      expect(transferEvent.from.toLowerCase()).toBe(mockAddress.toLowerCase());
    }
  });

  it("should detect Mint events from zero address", async () => {
    const currentBlock = BigInt(10000);
    const zeroAddress = "0x0000000000000000000000000000000000000000" as `0x${string}`;
    const mockMintLog = {
      eventName: "Transfer" as const,
      args: {
        from: zeroAddress,
        to: mockAddress,
        value: BigInt("1000000000000000000000"), // 1000 DAI (18 decimals)
      },
      transactionHash:
        "0x3333333333333333333333333333333333333333333333333333333333333333" as `0x${string}`,
      blockNumber: BigInt(1000),
    };

    mockPublicClient.getBlockNumber.mockResolvedValue(currentBlock);
    mockPublicClient.getLogs.mockResolvedValue([
      {
        address: "0xDAI_ADDRESS" as `0x${string}`,
        topics: [],
        data: "0x",
        blockNumber: BigInt(1000),
        transactionHash:
          "0x3333333333333333333333333333333333333333333333333333333333333333" as `0x${string}`,
      },
    ] as any);
    mockParseEventLogs.mockReturnValue([mockMintLog] as any);
    mockPublicClient.getBlock.mockResolvedValue({
      timestamp: BigInt(1234567890),
    } as any);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.events.length).toBeGreaterThan(0);
    const mintEvent = result.current.events.find((e) => e.type === "Mint");
    expect(mintEvent).toBeDefined();
    if (mintEvent) {
      expect(mintEvent.from.toLowerCase()).toBe(zeroAddress.toLowerCase());
      expect(mintEvent.to.toLowerCase()).toBe(mockAddress.toLowerCase());
    }
  });

  it("should filter Approval events by user address", async () => {
    const currentBlock = BigInt(10000);
    const mockApprovalLog = {
      eventName: "Approval" as const,
      args: {
        owner: mockAddress,
        spender: "0x9876543210987654321098765432109876543210" as `0x${string}`,
        value: BigInt(2000000000), // 2 USDC (6 decimals)
      },
      transactionHash:
        "0x2222222222222222222222222222222222222222222222222222222222222222" as `0x${string}`,
      blockNumber: BigInt(1001),
    };

    mockPublicClient.getBlockNumber.mockResolvedValue(currentBlock);
    mockPublicClient.getLogs.mockResolvedValue([
      {
        address: "0xUSDC_ADDRESS" as `0x${string}`,
        topics: [],
        data: "0x",
        blockNumber: BigInt(1001),
        transactionHash:
          "0x2222222222222222222222222222222222222222222222222222222222222222" as `0x${string}`,
      },
    ] as any);
    mockParseEventLogs.mockReturnValue([mockApprovalLog] as any);
    mockPublicClient.getBlock.mockResolvedValue({
      timestamp: BigInt(1234567891),
    } as any);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.events.length).toBeGreaterThan(0);
    const approvalEvent = result.current.events.find(
      (e) => e.type === "Approval",
    );
    expect(approvalEvent).toBeDefined();
    if (approvalEvent) {
      expect(approvalEvent.from.toLowerCase()).toBe(mockAddress.toLowerCase());
    }
  });

  it("should sort events by block number (newest first)", async () => {
    const currentBlock = BigInt(10000);
    const mockLogs = [
      {
        eventName: "Transfer" as const,
        args: {
          from: mockAddress,
          to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`,
          value: BigInt(1000000000000000000),
        },
        transactionHash:
          "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`,
        blockNumber: BigInt(1000),
      },
      {
        eventName: "Transfer" as const,
        args: {
          from: mockAddress,
          to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`,
          value: BigInt(2000000000000000000),
        },
        transactionHash:
          "0x2222222222222222222222222222222222222222222222222222222222222222" as `0x${string}`,
        blockNumber: BigInt(2000),
      },
    ];

    mockPublicClient.getBlockNumber.mockResolvedValue(currentBlock);
    mockPublicClient.getLogs.mockResolvedValue([] as any);
    mockParseEventLogs.mockReturnValue(mockLogs as any);
    mockPublicClient.getBlock.mockResolvedValue({
      timestamp: BigInt(1234567890),
    } as any);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.events.length).toBeGreaterThanOrEqual(2);
    // Events should be sorted by block number descending (newest first)
    const blockNumbers = result.current.events.map((e) => e.blockNumber);
    for (let i = 0; i < blockNumbers.length - 1; i++) {
      expect(blockNumbers[i] >= blockNumbers[i + 1]).toBe(true);
    }
  });

  it("should fetch timestamps for events", async () => {
    const currentBlock = BigInt(10000);
    const mockTransferLog = {
      eventName: "Transfer" as const,
      args: {
        from: mockAddress,
        to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`,
        value: BigInt(1000000000000000000),
      },
      transactionHash:
        "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`,
      blockNumber: BigInt(1000),
    };

    const mockTimestamp = BigInt(1234567890);

    mockPublicClient.getBlockNumber.mockResolvedValue(currentBlock);
    mockPublicClient.getLogs.mockResolvedValue([] as any);
    mockParseEventLogs.mockReturnValue([mockTransferLog] as any);
    mockPublicClient.getBlock.mockResolvedValue({
      timestamp: mockTimestamp,
    } as any);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockPublicClient.getBlock).toHaveBeenCalledWith({
      blockNumber: BigInt(1000),
    });

    const eventWithTimestamp = result.current.events.find(
      (e) => e.blockNumber === BigInt(1000),
    );
    expect(eventWithTimestamp?.timestamp).toBe(Number(mockTimestamp));
  });

  it("should handle errors gracefully", async () => {
    // Mock getBlockNumber to throw an error that will be caught by the outer try-catch
    mockPublicClient.getBlockNumber.mockRejectedValue(new Error("RPC Error"));

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Failed to fetch events");
  });

  it("should return empty array when not connected", () => {
    mockUseWallet.mockReturnValue({
      isConnected: false,
      address: undefined,
    });

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    expect(result.current.events).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle errors when fetching events for a token", async () => {
    const currentBlock = BigInt(10000);
    mockPublicClient.getBlockNumber.mockResolvedValue(currentBlock);
    
    // Mock getLogs to throw error for DAI Transfer, but succeed for others
    let callCount = 0;
    mockPublicClient.getLogs.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // First call (DAI Transfer) fails - will retry and eventually return empty
        return Promise.reject(new Error("Token fetch error"));
      }
      // Subsequent calls succeed
      return Promise.resolve([]);
    });
    mockParseEventLogs.mockReturnValue([]);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 15000 });

    // Should still complete without error (retries handle it)
    expect(result.current.error).toBeNull();
  });

  it("should skip blockNumber 0 when fetching timestamps", async () => {
    const currentBlock = BigInt(10000);
    const mockTransferLog = {
      eventName: "Transfer" as const,
      args: {
        from: mockAddress,
        to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`,
        value: BigInt(1000000000000000000),
      },
      transactionHash: "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`,
      blockNumber: BigInt(0), // Invalid block number
    };

    mockPublicClient.getBlockNumber.mockResolvedValue(currentBlock);
    mockPublicClient.getLogs.mockResolvedValue([] as any);
    mockParseEventLogs.mockReturnValue([mockTransferLog] as any);

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should not call getBlock for blockNumber 0
    expect(mockPublicClient.getBlock).not.toHaveBeenCalled();
  });

  it("should handle block fetching errors gracefully", async () => {
    const currentBlock = BigInt(10000);
    const mockTransferLog = {
      eventName: "Transfer" as const,
      args: {
        from: mockAddress,
        to: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as `0x${string}`,
        value: BigInt(1000000000000000000),
      },
      transactionHash: "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`,
      blockNumber: BigInt(1000),
    };

    mockPublicClient.getBlockNumber.mockResolvedValue(currentBlock);
    mockPublicClient.getLogs.mockResolvedValue([] as any);
    mockParseEventLogs.mockReturnValue([mockTransferLog] as any);
    
    // Mock getBlock to fail (will retry but eventually fail)
    mockPublicClient.getBlock.mockRejectedValue(new Error("Block fetch error"));

    const wrapper = createTestWrapper();
    const { result } = renderHook(() => useEvents(), { wrapper });

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 30000 },
    );

    // Should still return events but without timestamps
    expect(result.current.events.length).toBeGreaterThan(0);
    const event = result.current.events[0];
    expect(event.timestamp).toBeUndefined();
  }, 35000);
});
