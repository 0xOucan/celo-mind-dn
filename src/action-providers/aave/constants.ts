// 🏦 AAVE Protocol Contract Addresses on Celo
export const AAVE_LENDING_POOL = "0x3E59A31363E2ad014dcbc521c4a0d5757d9f3402";
export const CELO_TOKEN = "0x471EcE3750Da237f93B8E339c536989b8978a438";
export const USDC_TOKEN = "0xceba9300f2b948710d2653dd7b07f33a8b32118c";
export const CUSD_TOKEN = "0x765de816845861e75a25fca122bb6898b8b1282a";
export const CEUR_TOKEN = "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73";
export const USDT_TOKEN = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e"; // Tether USD on Celo
export const AAVE_DATA_PROVIDER = "0x7B8Bb8321612D5d6eDc3FCCFF5E7ec2DB5C6d9E2"; // AAVE Protocol Data Provider

// 🔄 AAVE Data Provider ABI
export const AAVE_DATA_PROVIDER_ABI = [
  // Get all reserves tokens
  {
    inputs: [{ internalType: "address", name: "lendingPool", type: "address" }],
    name: "getAllReservesTokens",
    outputs: [
      {
        components: [
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "address", name: "token", type: "address" }
        ],
        internalType: "struct AaveProtocolDataProvider.TokenData[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Get user reserve data
  {
    inputs: [
      { internalType: "address", name: "lendingPool", type: "address" },
      { internalType: "address", name: "asset", type: "address" },
      { internalType: "address", name: "user", type: "address" }
    ],
    name: "getUserReserveData",
    outputs: [
      { internalType: "uint256", name: "currentATokenBalance", type: "uint256" },
      { internalType: "uint256", name: "currentStableDebt", type: "uint256" },
      { internalType: "uint256", name: "currentVariableDebt", type: "uint256" },
      { internalType: "uint256", name: "principalStableDebt", type: "uint256" },
      { internalType: "uint256", name: "scaledVariableDebt", type: "uint256" },
      { internalType: "uint256", name: "stableBorrowRate", type: "uint256" },
      { internalType: "uint256", name: "liquidityRate", type: "uint256" },
      { internalType: "uint40", name: "stableRateLastUpdated", type: "uint40" },
      { internalType: "bool", name: "usageAsCollateralEnabled", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  // Get user reserves data
  {
    inputs: [
      { internalType: "address", name: "lendingPool", type: "address" },
      { internalType: "address", name: "user", type: "address" }
    ],
    name: "getUserReservesData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "asset", type: "address" },
          { internalType: "uint256", name: "currentATokenBalance", type: "uint256" },
          { internalType: "uint256", name: "currentStableDebt", type: "uint256" },
          { internalType: "uint256", name: "currentVariableDebt", type: "uint256" },
          { internalType: "uint256", name: "principalStableDebt", type: "uint256" },
          { internalType: "uint256", name: "scaledVariableDebt", type: "uint256" },
          { internalType: "uint256", name: "stableBorrowRate", type: "uint256" },
          { internalType: "uint256", name: "liquidityRate", type: "uint256" },
          { internalType: "uint40", name: "stableRateLastUpdated", type: "uint40" },
          { internalType: "bool", name: "usageAsCollateralEnabled", type: "bool" }
        ],
        internalType: "struct AaveProtocolDataProvider.UserReserveData[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

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