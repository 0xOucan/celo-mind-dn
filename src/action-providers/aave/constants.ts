// 🏦 AAVE Protocol Contract Addresses on Celo
export const AAVE_LENDING_POOL = "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402";
export const CELO_TOKEN = "0x471EcE3750Da237f93B8E339c536989b8978a438";
export const USDC_TOKEN = "0xceba9300f2b948710d2653dd7b07f33a8b32118c";
export const CUSD_TOKEN = "0x765de816845861e75a25fca122bb6898b8b1282a";
export const CEUR_TOKEN = "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73";

// 🔄 AAVE Lending Pool ABI
export const AAVE_LENDING_POOL_ABI = [
  // Supply function
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" },
      { internalType: "uint16", name: "referralCode", type: "uint16" }
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Borrow function
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interestRateMode", type: "uint256" },
      { internalType: "uint16", name: "referralCode", type: "uint16" },
      { internalType: "address", name: "onBehalfOf", type: "address" }
    ],
    name: "borrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Repay function
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "interestRateMode", type: "uint256" },
      { internalType: "address", name: "onBehalfOf", type: "address" }
    ],
    name: "repay",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Withdraw function
  {
    inputs: [
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "to", type: "address" }
    ],
    name: "withdraw",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  // Get user account data
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserAccountData",
    outputs: [
      { internalType: "uint256", name: "totalCollateralETH", type: "uint256" },
      { internalType: "uint256", name: "totalDebtETH", type: "uint256" },
      { internalType: "uint256", name: "availableBorrowsETH", type: "uint256" },
      { internalType: "uint256", name: "currentLiquidationThreshold", type: "uint256" },
      { internalType: "uint256", name: "ltv", type: "uint256" },
      { internalType: "uint256", name: "healthFactor", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

// 💰 ERC20 Token ABI
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
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
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
] as const;

// 📊 Interest Rate Mode
export enum InterestRateMode {
  NONE = 0,
  STABLE = 1,
  VARIABLE = 2
}

// 🪙 Supported Tokens for AAVE on Celo
export enum AaveToken {
  USDC = "USDC",
  CUSD = "cUSD",
  CEUR = "cEUR",
  CELO = "CELO"
}

// 🚫 Tokens not available as collateral
export const NON_COLLATERAL_TOKENS = [
  AaveToken.CUSD,
  AaveToken.CEUR
];

// 📄 Default referral code (0 in most cases)
export const DEFAULT_REFERRAL_CODE = 0; 