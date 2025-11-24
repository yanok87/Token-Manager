"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { erc20Abi, parseEventLogs, type Log } from "viem";
import { useWallet } from "@/context/WalletContext";
import { type TokenSymbol, TOKEN_ADDRESSES } from "@/lib/tokens";
import { formatTokenAmount, formatDisplayAmount } from "@/utils/format";

type EventType = "Transfer" | "Approval";

export type EventData = {
  type: EventType;
  token: TokenSymbol;
  amount: string;
  from: string;
  to: string;
  transactionHash: `0x${string}`;
  blockNumber: bigint;
  timestamp?: number;
};

export function useEvents() {
  const { isConnected, address } = useWallet();
  const publicClient = usePublicClient();

  const {
    data: events = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["events", address, isConnected],
    queryFn: async () => {
      if (!isConnected || !address || !publicClient) {
        return [];
      }

      try {
        const allEvents: EventData[] = [];
        const currentBlock = await publicClient.getBlockNumber();

        // Fetch events from last 500 blocks to stay within RPC limits
        const blockRange = BigInt(500);
        const fromBlock =
          currentBlock > blockRange ? currentBlock - blockRange : BigInt(0);
        const toBlock = currentBlock;

        // Helper function to fetch events with retry logic
        const fetchEventLogs = async (
          tokenAddress: `0x${string}`,
          eventName: "Transfer" | "Approval",
          eventInputs: Array<{ type: string; indexed: boolean; name: string }>,
        ) => {
          let retries = 3;
          let lastError: Error | null = null;

          while (retries > 0) {
            try {
              return await publicClient.getLogs({
                address: tokenAddress,
                event: {
                  type: "event",
                  name: eventName,
                  inputs: eventInputs,
                },
                fromBlock,
                toBlock,
              });
            } catch (err) {
              lastError = err instanceof Error ? err : new Error(String(err));
              retries--;
              if (retries > 0) {
                // Wait before retrying (exponential backoff: 1s, 2s, 3s)
                const delay = 1000 * (4 - retries);
                await new Promise((resolve) => setTimeout(resolve, delay));
              }
            }
          }

          // If all retries failed, log and return empty array to continue with other tokens
          console.error(
            `Failed to fetch ${eventName} logs for ${tokenAddress} after 3 retries:`,
            lastError,
          );
          return [];
        };

        // Fetch events for both tokens
        for (const [symbol, tokenAddress] of Object.entries(TOKEN_ADDRESSES)) {
          const tokenSymbol = symbol as TokenSymbol;

          try {
            // Fetch all Transfer events
            const transferLogs = await fetchEventLogs(
              tokenAddress as `0x${string}`,
              "Transfer",
              [
                { type: "address", indexed: true, name: "from" },
                { type: "address", indexed: true, name: "to" },
                { type: "uint256", indexed: false, name: "value" },
              ],
            );

            const parsedTransfers = parseEventLogs({
              abi: erc20Abi,
              logs: transferLogs as Log[],
            });

            // Filter to only events involving the user's address
            const userTransfers = parsedTransfers.filter(
              (log): log is Extract<typeof log, { eventName: "Transfer" }> =>
                log.eventName === "Transfer" &&
                "from" in log.args &&
                "to" in log.args &&
                log.args.from &&
                log.args.to &&
                (log.args.from.toLowerCase() === address.toLowerCase() ||
                  log.args.to.toLowerCase() === address.toLowerCase()),
            );

            for (const log of userTransfers) {
              if (
                "from" in log.args &&
                "to" in log.args &&
                "value" in log.args &&
                log.args.from &&
                log.args.to &&
                log.args.value
              ) {
                allEvents.push({
                  type: "Transfer",
                  token: tokenSymbol,
                  amount: formatDisplayAmount(
                    formatTokenAmount(log.args.value, tokenSymbol),
                  ),
                  from: log.args.from,
                  to: log.args.to,
                  transactionHash: log.transactionHash,
                  blockNumber: log.blockNumber || BigInt(0),
                });
              }
            }

            // Fetch Approval events
            const approvalLogs = await fetchEventLogs(
              tokenAddress as `0x${string}`,
              "Approval",
              [
                { type: "address", indexed: true, name: "owner" },
                { type: "address", indexed: true, name: "spender" },
                { type: "uint256", indexed: false, name: "value" },
              ],
            );

            const parsedApprovals = parseEventLogs({
              abi: erc20Abi,
              logs: approvalLogs as Log[],
            });

            // Filter to only approvals by the user's address
            const userApprovals = parsedApprovals.filter(
              (log): log is Extract<typeof log, { eventName: "Approval" }> =>
                log.eventName === "Approval" &&
                "owner" in log.args &&
                log.args.owner &&
                log.args.owner.toLowerCase() === address.toLowerCase(),
            );

            for (const log of userApprovals) {
              if (
                "owner" in log.args &&
                "spender" in log.args &&
                "value" in log.args &&
                log.args.owner &&
                log.args.spender &&
                log.args.value !== undefined &&
                log.args.value !== null
              ) {
                // Allow 0 values for Approval events (approving 0 revokes allowance)
                allEvents.push({
                  type: "Approval",
                  token: tokenSymbol,
                  amount: formatDisplayAmount(
                    formatTokenAmount(log.args.value, tokenSymbol),
                  ),
                  from: log.args.owner,
                  to: log.args.spender,
                  transactionHash: log.transactionHash,
                  blockNumber: log.blockNumber || BigInt(0),
                });
              }
            }
          } catch (err) {
            console.error(`Error fetching events for ${symbol}:`, err);
          }
        }

        // Sort events by block number (newest first)
        allEvents.sort((a, b) => {
          if (a.blockNumber > b.blockNumber) return -1;
          if (a.blockNumber < b.blockNumber) return 1;
          return 0;
        });

        // Fetch timestamps for unique block numbers with retry logic
        const uniqueBlockNumbers = Array.from(
          new Set(allEvents.map((e) => e.blockNumber.toString())),
        ).map((bn) => BigInt(bn));

        // Fetch block data for unique blocks to get timestamps
        const blockDataMap = new Map<string, number>();
        for (const blockNumber of uniqueBlockNumbers) {
          // Skip if blockNumber is 0 or invalid
          if (blockNumber === BigInt(0)) {
            continue;
          }

          let retries = 3;
          let success = false;

          while (retries > 0 && !success) {
            try {
              const block = await publicClient.getBlock({ blockNumber });
              if (block && block.timestamp) {
                blockDataMap.set(
                  blockNumber.toString(),
                  Number(block.timestamp),
                );
                success = true;
              }
            } catch (err) {
              retries--;
              if (retries === 0) {
                console.error(
                  `Error fetching block ${blockNumber} after 3 retries:`,
                  err,
                );
              } else {
                // Wait before retrying (exponential backoff: 1s, 2s, 3s)
                const delay = 1000 * (4 - retries);
                await new Promise((resolve) => setTimeout(resolve, delay));
              }
            }
          }
        }

        // Add timestamps to events
        const eventsWithTimestamps = allEvents.map((event) => ({
          ...event,
          timestamp: blockDataMap.get(event.blockNumber.toString()),
        }));

        return eventsWithTimestamps;
      } catch (err) {
        console.error("Error fetching events:", err);
        throw new Error("Failed to fetch events");
      }
    },
    enabled: isConnected && !!address && !!publicClient,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const error = queryError ? (queryError as Error).message : null;

  return { events, isLoading, error };
}
