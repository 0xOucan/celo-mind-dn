import { formatUnits, parseUnits } from 'viem';
import { SwapResult } from './schemas';
import { createPublicClient, http } from 'viem';
import { base, arbitrum } from 'viem/chains';
import { BASESCAN_TX_URL, ARBISCAN_TX_URL, SWAP_FEE_PERCENTAGE } from './constants';

/**
 * Format an amount with the given number of decimals
 */
export function formatAmount(amount: bigint | string, decimals: number): string {
  if (typeof amount === 'string') {
    // If the amount is already a string, parse it first
    try {
      return formatUnits(parseUnits(amount, decimals), decimals);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0';
    }
  }
  return formatUnits(amount, decimals);
}

/**
 * Generate a block explorer URL for a transaction
 */
export function getExplorerLink(chain: 'base' | 'arbitrum', txHash: string): string {
  if (chain === 'base') {
    return `${BASESCAN_TX_URL}${txHash}`;
  } else {
    return `${ARBISCAN_TX_URL}${txHash}`;
  }
}

/**
 * Get a transaction link for the command response
 */
export function getTransactionTextLink(chain: 'base' | 'arbitrum', txHash: string): string {
  const baseUrl = chain === 'base' ? BASESCAN_TX_URL : ARBISCAN_TX_URL;
  return `[View transaction on ${chain === 'base' ? 'BaseScan' : 'Arbiscan'}](${baseUrl}${txHash})`;
}

/**
 * Apply the swap fee to an amount
 */
export function applySwapFee(amount: string, decimals: number): string {
  const parsedAmount = parseFloat(amount);
  const fee = parsedAmount * (SWAP_FEE_PERCENTAGE / 100);
  const amountAfterFee = parsedAmount - fee;
  return amountAfterFee.toFixed(decimals);
}

/**
 * Create a swap ID
 */
export function createSwapId(): string {
  return `swap-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Record a new swap in the swap history
 */
export const swapHistory: SwapResult[] = [];

export function recordSwap(swap: SwapResult): SwapResult {
  swapHistory.push(swap);
  return swap;
}

/**
 * Get a swap by ID
 */
export function getSwapById(swapId: string): SwapResult | undefined {
  return swapHistory.find(swap => swap.swapId === swapId);
}

/**
 * Get the most recent swap
 */
export function getMostRecentSwap(): SwapResult | undefined {
  if (swapHistory.length === 0) {
    return undefined;
  }
  return swapHistory[swapHistory.length - 1];
}

/**
 * Update a swap's status and transaction hashes
 */
export function updateSwapStatus(
  swapId: string,
  status: 'pending' | 'completed' | 'failed',
  sourceTxHash?: string,
  targetTxHash?: string
): SwapResult | undefined {
  const swapIndex = swapHistory.findIndex(swap => swap.swapId === swapId);
  
  if (swapIndex === -1) {
    return undefined;
  }
  
  const updatedSwap = {
    ...swapHistory[swapIndex],
    status,
    ...(sourceTxHash ? { sourceTxHash } : {}),
    ...(targetTxHash ? { targetTxHash } : {})
  };
  
  swapHistory[swapIndex] = updatedSwap;
  return updatedSwap;
}

/**
 * Create viem public clients for different chains
 */
export const chainClients = {
  base: createPublicClient({
    chain: base,
    transport: http(base.rpcUrls.default.http[0]),
  }),
  arbitrum: createPublicClient({
    chain: arbitrum,
    transport: http(arbitrum.rpcUrls.default.http[0]),
  }),
}; 