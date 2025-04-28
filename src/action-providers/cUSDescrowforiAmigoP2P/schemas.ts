import { z } from 'zod';

/**
 * Schema for creating a selling order
 */
export const CreateSellingOrderSchema = z.object({
  amount: z.string().min(1),
  memo: z.string().optional(),
});

export type CreateSellingOrderParams = z.infer<typeof CreateSellingOrderSchema>;

/**
 * Schema for processing a buying order with QR code
 */
export const ProcessBuyingOrderSchema = z.object({
  qrCode: z.string().min(1).describe("The OXXO Spin QR code content as a string"),
  buyerWalletAddress: z.string().optional().describe("The wallet address of the buyer (optional, defaults to predefined address)"),
});

export type ProcessBuyingOrderParams = z.infer<typeof ProcessBuyingOrderSchema>;

/**
 * Schema for order result
 */
export const OrderResultSchema = z.object({
  orderId: z.string(),
  amount: z.string(),
  timestamp: z.number(),
  txHash: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
});

export type OrderResult = z.infer<typeof OrderResultSchema>; 