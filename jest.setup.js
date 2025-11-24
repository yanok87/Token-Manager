// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock wagmi hooks
jest.mock("wagmi", () => ({
  useAccount: jest.fn(),
  useChainId: jest.fn(),
  useSwitchChain: jest.fn(),
  useWriteContract: jest.fn(),
  useWaitForTransactionReceipt: jest.fn(),
  useReadContract: jest.fn(),
  usePublicClient: jest.fn(),
}));

// Mock @rainbow-me/rainbowkit
jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: () => <div data-testid="connect-button">Connect Wallet</div>,
  getDefaultConfig: jest.fn(),
}));

// Mock @tanstack/react-query
jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    QueryClientProvider: ({ children }) => children,
    useQueryClient: jest.fn(),
  };
});
