// Network configurations
export const BASE_CHAIN_ID = '8453';
export const ARBITRUM_CHAIN_ID = '42161';

// Chain explorer URLs
export const BASESCAN_TX_URL = 'https://basescan.org/tx/';
export const BASESCAN_ADDRESS_URL = 'https://basescan.org/address/';
export const ARBISCAN_TX_URL = 'https://arbiscan.io/tx/';
export const ARBISCAN_ADDRESS_URL = 'https://arbiscan.io/address/';

// Token addresses
export const XOC_TOKEN_ADDRESS = "0xa411c9Aa00E020e4f88Bc19996d29c5B7ADB4ACf"; // XOC on Base
export const MXNB_TOKEN_ADDRESS = "0xF197FFC28c23E0309B5559e7a166f2c6164C80aA"; // MXNB on Arbitrum

// Escrow wallet address (fallback to env var)
export const ESCROW_WALLET_ADDRESS = process.env.WALLET_ADDRESS || "0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45";

// Token decimals for formatting
export const XOC_DECIMALS = 18; // Assuming XOC has 18 decimals like most ERC20s
export const MXNB_DECIMALS = 6; // MXNB has 6 decimals as per spec

// Default fee percentage for swaps (0.5%)
export const SWAP_FEE_PERCENTAGE = 0.5;

// Conversion rate (assuming 1:1 pairing with Mexican Peso)
export const XOC_TO_MXNB_RATE = 1.0;

// Gas multipliers
export const GAS_LIMIT_MULTIPLIER = 1.2;
export const FEE_PER_GAS_MULTIPLIER = 1.1;

// Maximum swap amount in USD
export const MAX_SWAP_AMOUNT_USD = 1000;

// Transaction status
export const TX_STATUS = {
  PENDING: 'pending',
  SIGNED: 'signed',
  REJECTED: 'rejected',
  COMPLETED: 'completed'
} as const;

// Token prices fallback (when price feed is not available)
export const TOKEN_PRICES_USD = {
  ETH_BASE: 3000.0,
  ETH_ARBITRUM: 3000.0,
  XOC: 1.0, 
  MXNB: 1.0,
} as const;

// Standard ERC20 ABI for common functions
export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Token mappings for multi-chain balances
export const TRACKED_TOKENS = {
  BASE: [
    {
      symbol: "ETH",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Placeholder for native ETH
      decimals: 18,
      isNative: true,
      price: TOKEN_PRICES_USD.ETH_BASE,
      icon: "💠",
    },
    {
      symbol: "XOC",
      address: XOC_TOKEN_ADDRESS,
      decimals: XOC_DECIMALS,
      isNative: false,
      price: TOKEN_PRICES_USD.XOC,
      icon: "MX",
    },
  ],
  ARBITRUM: [
    {
      symbol: "ETH",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // Placeholder for native ETH
      decimals: 18,
      isNative: true,
      price: TOKEN_PRICES_USD.ETH_ARBITRUM,
      icon: "💠",
    },
    {
      symbol: "MXNB",
      address: MXNB_TOKEN_ADDRESS,
      decimals: MXNB_DECIMALS,
      isNative: false,
      price: TOKEN_PRICES_USD.MXNB,
      icon: "MX",
    },
  ],
}; 