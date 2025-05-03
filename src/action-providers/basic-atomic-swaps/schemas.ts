import { z } from 'zod';

/**
 * Schema for checking balances across chains
 */
export const CheckMultiChainBalanceSchema = z.object({
  address: z.string().optional().describe("Optional: The address to check balances for. Default is the connected wallet"),
  includeUSD: z.boolean().optional().default(true).describe("Whether to include USD values in the response"),
  chain: z.enum(['base', 'arbitrum', 'all']).default('all').describe("Chain to check balances on. Default is 'all'"),
});

export type CheckMultiChainBalanceParams = z.infer<typeof CheckMultiChainBalanceSchema>;

/**
 * Schema for checking specific token balance on a chain
 */
export const CheckTokenBalanceSchema = z.object({
  address: z.string().optional().describe("Optional: The address to check balance for. Default is the connected wallet"),
  tokenAddress: z.string().describe("The address of the token to check"),
  chain: z.enum(['base', 'arbitrum']).describe("Chain to check balance on"),
});

export type CheckTokenBalanceParams = z.infer<typeof CheckTokenBalanceSchema>;

/**
 * Schema for providing liquidity
 */
export const ProvideLiquiditySchema = z.object({
  amount: z.string().min(1).describe("Amount of tokens to provide as liquidity"),
  tokenSymbol: z.enum(['XOC']).describe("Token symbol to provide (currently only XOC is supported)"),
  chain: z.enum(['base']).default('base').describe("Chain to provide liquidity on (currently only base is supported)"),
});

export type ProvideLiquidityParams = z.infer<typeof ProvideLiquiditySchema>;

/**
 * Schema for atomic swaps between chains
 */
export const AtomicSwapSchema = z.object({
  sourceChain: z.enum(['base', 'arbitrum']).describe("Source chain for the swap"),
  targetChain: z.enum(['base', 'arbitrum']).describe("Target chain for the swap"),
  sourceToken: z.string().describe("Token symbol on the source chain"),
  targetToken: z.string().describe("Token symbol on the target chain"),
  amount: z.string().min(1).describe("Amount to swap (in source token units)"),
  recipientAddress: z.string().optional().describe("Optional: Recipient address on the target chain. Defaults to the sender's address"),
});

export type AtomicSwapParams = z.infer<typeof AtomicSwapSchema>;

/**
 * Schema for XOC to MXNB swap
 */
export const XocToMxnbSwapSchema = z.object({
  amount: z.string().min(1).describe("Amount of XOC to swap for MXNB"),
  recipientAddress: z.string().optional().describe("Optional: Recipient address for MXNB. Defaults to the sender's address"),
});

export type XocToMxnbSwapParams = z.infer<typeof XocToMxnbSwapSchema>;

/**
 * Schema for MXNB to XOC swap
 */
export const MxnbToXocSwapSchema = z.object({
  amount: z.string().min(1).describe("Amount of MXNB to swap for XOC"),
  recipientAddress: z.string().optional().describe("Optional: Recipient address for XOC. Defaults to the sender's address"),
});

export type MxnbToXocSwapParams = z.infer<typeof MxnbToXocSwapSchema>;

/**
 * Schema for receiving a swap receipt
 */
export const SwapReceiptSchema = z.object({
  transactionId: z.string().optional().describe("Transaction ID of the swap (optional, will use latest if not provided)"),
});

export type SwapReceiptParams = z.infer<typeof SwapReceiptSchema>;

/**
 * Schema for swap result
 */
export const SwapResultSchema = z.object({
  swapId: z.string(),
  sourceChain: z.enum(['base', 'arbitrum']),
  targetChain: z.enum(['base', 'arbitrum']),
  sourceAmount: z.string(),
  sourceToken: z.string(),
  targetAmount: z.string(),
  targetToken: z.string(),
  senderAddress: z.string(),
  recipientAddress: z.string(),
  sourceTxHash: z.string().optional(),
  targetTxHash: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']),
  timestamp: z.number(),
});

export type SwapResult = z.infer<typeof SwapResultSchema>; 