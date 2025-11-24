import { renderHook } from "@testing-library/react";
import { useAccount } from "wagmi";
import { WalletProvider, useWallet } from "../WalletContext";

// Mock wagmi
jest.mock("wagmi");

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>;

describe("WalletContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide wallet state from useAccount", () => {
    const mockAddress =
      "0x1234567890123456789012345678901234567890" as `0x${string}`;
    mockUseAccount.mockReturnValue({
      address: mockAddress,
      isConnected: true,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WalletProvider>{children}</WalletProvider>
    );

    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.address).toBe(mockAddress);
    expect(result.current.isConnected).toBe(true);
  });

  it("should provide disconnected state", () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WalletProvider>{children}</WalletProvider>
    );

    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.address).toBeUndefined();
    expect(result.current.isConnected).toBe(false);
  });

  it("should throw error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useWallet());
    }).toThrow("useWallet must be used within a WalletProvider");

    consoleSpy.mockRestore();
  });

  it("should provide correct address when connected", () => {
    const mockAddress =
      "0x1111111111111111111111111111111111111111" as `0x${string}`;

    mockUseAccount.mockReturnValue({
      address: mockAddress,
      isConnected: true,
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WalletProvider>{children}</WalletProvider>
    );

    const { result } = renderHook(() => useWallet(), { wrapper });

    expect(result.current.address).toBe(mockAddress);
    expect(result.current.isConnected).toBe(true);
  });
});
