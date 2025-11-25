# Token Manager - Frontend Blockchain Challenge

A React/Next.js application for managing ERC20 tokens (DAI and USDC) on the Sepolia testnet. Features wallet connection, token minting, approval, transfer, and event history tracking.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Web3 wallet (MetaMask, WalletConnect-compatible wallets)
- Sepolia testnet ETH (get from [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia))

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:

   ```bash
   cd frontend-blockchain-challenge
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env.local` file in the root directory:

   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
   ```

   **Example** (use your own Project ID):

   ```bash
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=1fff63a7e5eda775c50b9800bd255afd
   ```

   To get your own WalletConnect Project ID:
   - Visit [Reown Cloud](https://cloud.reown.com/) (formerly WalletConnect Cloud)
   - Sign up or log in
   - Create a new project
   - Copy your Project ID

4. **Start the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend-blockchain-challenge/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page (minting & balances)
│   └── transactions/      # Transactions page (approve/transfer & events)
├── components/            # React components
│   ├── ApproveTransfer.tsx    # Approve and transfer functionality
│   ├── EventTable.tsx         # Event history table
│   ├── MintTokens.tsx         # Token minting
│   ├── TokenBalances.tsx      # Token balance display
│   └── NetworkWarning.tsx     # Network detection and switching
├── context/               # React Context providers
│   └── WalletContext.tsx  # Wallet connection state management
├── hooks/                 # Custom React hooks
│   └── useEvents.ts       # Event fetching hook
├── lib/                   # Configuration and utilities
│   ├── wagmiConfig.ts     # Wagmi/RainbowKit configuration
│   └── tokens.ts          # Token addresses and constants
├── utils/                 # Utility functions
│   ├── format.ts          # Number and address formatting
│   └── transaction.ts     # Transaction error handling
└── theme/                 # Material-UI theme configuration
```

## 🏗️ Key Decisions & Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **State Management**: React Context API (`WalletContext`) for wallet state
- **Blockchain Libraries**:
  - `wagmi` v2 for Ethereum interactions
  - `viem` for low-level blockchain utilities
- **Wallet Integration**: RainbowKit for wallet connection UI
- **UI Framework**: Material-UI (MUI) with custom theme
- **Data Fetching**: TanStack Query (React Query) for caching and refetching
- **Testing**:
  - Jest + React Testing Library for unit tests
  - Cypress for E2E tests

### Architecture Decisions

1. **React Context over Zustand**:
   - Chose Context API for simplicity and to meet challenge requirements
   - `WalletContext` manages connection state and address
   - Token balances and allowances fetched directly in components using `wagmi` hooks

2. **Next.js App Router**:
   - Modern Next.js routing with App Router
   - Two main pages: home (minting) and transactions (approve/transfer)
   - Pages are client components (marked with `"use client"`) due to wallet interactions and React hooks
   - Root layout is a server component for optimal performance

3. **TanStack Query for Events**:
   - Automatic caching and refetching of blockchain events
   - Retry logic with exponential backoff for RPC errors (implemented in `hooks/useEvents.ts`)
   - Query invalidation after transactions to update UI

4. **Error Handling**:
   - Custom error messages for user rejections and common errors
   - Retry logic for transient RPC failures (in `hooks/useEvents.ts`: 3 retries with exponential backoff)
   - Graceful degradation when RPC calls fail (returns empty arrays, continues processing other tokens/blocks)

5. **Event Fetching Strategy**:
   - Fetches last 500 blocks (recent events only)
   - Filters events by user address (transfers to/from, approvals by)
   - Fetches block timestamps for date display
   - Automatic refetching after transactions

6. **UI/UX Enhancements**:
   - Loading states with animated text
   - Success/error alerts with Etherscan links
   - Responsive design with Material-UI Grid
   - Client-side date formatting to prevent hydration mismatches

## 🎯 Features

### Core Features

- ✅ **Wallet Connection**: Connect via MetaMask, WalletConnect, or other RainbowKit-supported wallets
- ✅ **Network Detection**: Automatically detects Sepolia network and prompts to switch if on wrong network
- ✅ **Token Balances**: Displays DAI and USDC balances with proper decimal formatting
- ✅ **Mint Tokens**: Mint test DAI and USDC tokens for testing
- ✅ **Approve Tokens**: Approve a spender to use your tokens
- ✅ **Transfer Tokens**: Transfer tokens to any address
- ✅ **Event History**: Table showing Transfer and Approval events with pagination
- ✅ **Transaction Links**: Direct links to Etherscan for all transactions

### Bonus Features

- ✅ **Unit Tests**: Comprehensive Jest tests for components, hooks, and utilities
- ✅ **E2E Tests**: Cypress tests for key user workflows
- ✅ **Responsive Design**: Mobile-friendly layout with Material-UI
- ✅ **Loading States**: Animated loading indicators
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Retry Logic**: Automatic retries for failed RPC calls

## 📖 Usage Guide

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the header
2. Select your preferred wallet (MetaMask, WalletConnect, etc.)
3. Approve the connection in your wallet
4. Ensure you're on Sepolia testnet (the app will prompt you to switch if needed)

### Minting Test Tokens

1. On the home page, you'll see mint buttons for DAI and USDC
2. Click "MINT" for the token you want
3. Approve the transaction in your wallet
4. Wait for confirmation - your balance will update automatically

### Approving Tokens

1. Navigate to the "Transactions" page
2. Enter the amount you want to approve
3. Enter the spender address (the contract/address that will spend your tokens)
4. Click "APPROVE"
5. Confirm the transaction in your wallet

### Transferring Tokens

1. On the "Transactions" page
2. Enter the amount to transfer
3. Enter the recipient address
4. Click "TRANSFER"
5. Confirm the transaction in your wallet

### Viewing Event History

1. Navigate to the "Transactions" page
2. Scroll down to see the "Events History" table
3. Events are automatically fetched and updated after transactions
4. Use pagination to navigate through events
5. Click transaction hashes to view on Etherscan

## 🧪 Testing

### Unit Tests

Run unit tests with Jest:

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests

Run Cypress tests:

```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open

# Run all tests in headless mode
npm run cypress:run

# Or use the alias
npm run e2e
```

**Note**: Make sure your dev server is running (`npm run dev`) before running E2E tests.

## 🔧 Configuration

### Environment Variables

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect Project ID (required for mobile wallet connections)

### Token Contracts (Sepolia Testnet)

- **DAI**: `0x1D70D57ccD2798323232B2dD027B3aBcA5C00091` (18 decimals)
- **USDC**: `0xC891481A0AaC630F4D89744ccD2C7D2C4215FD47` (6 decimals)

### Supported Networks

- **Sepolia Testnet** (required)
- **Mainnet** (configured but not required)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are formatted correctly (without changing them)
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run cypress:open` - Open Cypress Test Runner
- `npm run cypress:run` - Run Cypress tests headlessly

### Code Quality

- **ESLint**: Configured with Next.js and Prettier
  - Run `npm run lint` to check for linting errors
- **Prettier**: Code formatting
  - Run `npm run format` to automatically format all files
  - Run `npm run format:check` to check formatting without making changes
  - Configuration: semicolons enabled, trailing commas, 80 char width, 2 space tabs
- **TypeScript**: Full type safety

## 🐛 Troubleshooting

### Wallet Connection Issues

- Ensure you're using a supported wallet (MetaMask, WalletConnect, etc.)
- Check that your wallet is unlocked
- Try disconnecting and reconnecting

### Network Issues

- The app requires Sepolia testnet
- If you're on the wrong network, the app will prompt you to switch
- Make sure you have Sepolia ETH for gas fees

### RPC Errors

- The app includes retry logic for transient RPC errors
- If errors persist, check your internet connection
- Some RPC providers have rate limits - the app will retry automatically

### Events Not Showing

- Events are fetched from the last 500 blocks
- New events appear automatically after transactions
- If events don't appear, wait a few seconds and refresh

## 📝 Notes

- This app is designed for **Sepolia testnet only**
- Test tokens can be minted freely for testing purposes
- All transactions are on testnet - no real value is at risk
- Event fetching is limited to recent events (last ~1.5 hours) for performance

Deployed project on Vercel: https://token-manager-iota.vercel.app/


---

