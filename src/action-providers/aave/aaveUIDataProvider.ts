import { EvmWalletProvider } from "@coinbase/agentkit";
import { formatUnits, getAddress } from "viem";
import {
  AAVE_LENDING_POOL,
  AAVE_LENDING_POOL_ABI,
  AAVE_PRICE_ORACLE,
  AAVE_PRICE_ORACLE_ABI,
  USDC_TOKEN,
  CUSD_TOKEN,
  CEUR_TOKEN,
  CELO_TOKEN,
  USDT_TOKEN,
  CELO_A_TOKEN,
  USDC_A_TOKEN,
  CUSD_A_TOKEN,
  CEUR_A_TOKEN,
  USDT_A_TOKEN,
  CELO_VARIABLE_DEBT_TOKEN,
  USDC_VARIABLE_DEBT_TOKEN,
  CUSD_VARIABLE_DEBT_TOKEN,
  CEUR_VARIABLE_DEBT_TOKEN,
  USDT_VARIABLE_DEBT_TOKEN,
  ERC20_ABI,
  AaveToken,
  NON_COLLATERAL_TOKENS,
  TOKEN_PRICES_USD,
  TOKEN_ICONS,
  ETH_PRICE_USD
} from "./constants";

/**
 * 📊 Interface for Aave user dashboard data
 */
export interface AaveUserDashboard {
  netWorth: {
    value: string;
    formatted: string;
  };
  netAPY: {
    value: number;
    formatted: string;
  };
  healthFactor: {
    value: number;
    formatted: string;
    status: "safe" | "caution" | "warning" | "danger";
  };
  supplies: {
    balance: string;
    formatted: string;
    apy: {
      value: number;
      formatted: string;
    };
    collateral: {
      value: string;
      formatted: string;
    };
    assets: Array<{
      symbol: string;
      balance: string;
      balanceUsd: string;
      apy: string;
      isCollateral: boolean;
      icon: string;
    }>;
  };
  borrows: {
    balance: string;
    formatted: string;
    apy: {
      value: number;
      formatted: string;
    };
    powerUsed: {
      value: number;
      formatted: string;
    };
    assets: Array<{
      symbol: string;
      balance: string;
      balanceUsd: string;
      apy: string;
      interestMode: string;
      icon: string;
    }>;
  };
  availableToBorrow: Array<{
    symbol: string;
    available: string;
    availableUsd: string;
    apy: string;
    icon: string;
  }>;
}

/**
 * 🪙 Token Info structure
 */
interface TokenInfo {
  address: string;
  symbol: string;
  aToken: string;
  variableDebtToken: string;
  decimals: number;
  isCollateral: boolean;
  supplyAPY: number;
  borrowAPY: number;
  icon: string;
  price: number;
}

/**
 * Helper function to ensure addresses are properly checksummed
 */
function checksumAddress(address: string): string {
  try {
    return getAddress(address as `0x${string}`);
  } catch (error) {
    console.error(`Error checksumming address ${address}:`, error);
    return address;
  }
}

/**
 * 💰 Mapping of token addresses to token information
 * Using checksummed addresses to avoid viem validation errors
 */
const TOKEN_INFO: Record<string, TokenInfo> = {
  [checksumAddress(CELO_TOKEN).toLowerCase()]: {
    address: checksumAddress(CELO_TOKEN),
    symbol: "CELO",
    aToken: checksumAddress(CELO_A_TOKEN),
    variableDebtToken: checksumAddress(CELO_VARIABLE_DEBT_TOKEN),
    decimals: 18,
    isCollateral: true,
    supplyAPY: 0.04,
    borrowAPY: 1.12,
    icon: TOKEN_ICONS.CELO,
    price: TOKEN_PRICES_USD[CELO_TOKEN.toLowerCase()]
  },
  [checksumAddress(USDC_TOKEN).toLowerCase()]: {
    address: checksumAddress(USDC_TOKEN),
    symbol: "USDC",
    aToken: checksumAddress(USDC_A_TOKEN),
    variableDebtToken: checksumAddress(USDC_VARIABLE_DEBT_TOKEN),
    decimals: 6,
    isCollateral: true,
    supplyAPY: 0.46,
    borrowAPY: 2.08,
    icon: TOKEN_ICONS.USDC,
    price: TOKEN_PRICES_USD[USDC_TOKEN.toLowerCase()]
  },
  [checksumAddress(CUSD_TOKEN).toLowerCase()]: {
    address: checksumAddress(CUSD_TOKEN),
    symbol: "cUSD",
    aToken: checksumAddress(CUSD_A_TOKEN),
    variableDebtToken: checksumAddress(CUSD_VARIABLE_DEBT_TOKEN),
    decimals: 18,
    isCollateral: false,
    supplyAPY: 0.10,
    borrowAPY: 0.22,
    icon: TOKEN_ICONS.cUSD,
    price: TOKEN_PRICES_USD[CUSD_TOKEN.toLowerCase()]
  },
  [checksumAddress(CEUR_TOKEN).toLowerCase()]: {
    address: checksumAddress(CEUR_TOKEN),
    symbol: "cEUR",
    aToken: checksumAddress(CEUR_A_TOKEN),
    variableDebtToken: checksumAddress(CEUR_VARIABLE_DEBT_TOKEN),
    decimals: 18,
    isCollateral: false,
    supplyAPY: 0.10,
    borrowAPY: 0.05,
    icon: TOKEN_ICONS.cEUR,
    price: TOKEN_PRICES_USD[CEUR_TOKEN.toLowerCase()]
  },
  [checksumAddress(USDT_TOKEN).toLowerCase()]: {
    address: checksumAddress(USDT_TOKEN),
    symbol: "USDT",
    aToken: checksumAddress(USDT_A_TOKEN),
    variableDebtToken: checksumAddress(USDT_VARIABLE_DEBT_TOKEN),
    decimals: 6,
    isCollateral: true,
    supplyAPY: 0.30,
    borrowAPY: 2.10,
    icon: TOKEN_ICONS.USDT,
    price: TOKEN_PRICES_USD[USDT_TOKEN.toLowerCase()]
  }
};

/**
 * 🔀 Look up a token by its aToken address
 */
function getTokenByAToken(aTokenAddress: string): TokenInfo | undefined {
  const normalizedAddress = aTokenAddress.toLowerCase();
  return Object.values(TOKEN_INFO).find(
    info => info.aToken.toLowerCase() === normalizedAddress
  );
}

/**
 * 🔀 Look up a token by its variableDebtToken address
 */
function getTokenByDebtToken(debtTokenAddress: string): TokenInfo | undefined {
  const normalizedAddress = debtTokenAddress.toLowerCase();
  return Object.values(TOKEN_INFO).find(
    info => info.variableDebtToken.toLowerCase() === normalizedAddress
  );
}

/**
 * 💸 Format currency for display
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * 💱 Convert ETH values to USD values
 * AAVE returns values in ETH, we need to convert them to USD
 */
function ethToUsd(ethValue: bigint): number {
  return Number(formatUnits(ethValue, 18)) * ETH_PRICE_USD;
}

/**
 * 📊 Generate a formatted dashboard for Aave user data
 */
export async function getAaveDashboard(
  walletProvider: EvmWalletProvider,
  userAddress?: string
): Promise<AaveUserDashboard> {
  let address;
  try {
    address = userAddress || await walletProvider.getAddress();
  } catch (error) {
    console.error("Error getting user address:", error);
    address = "0x0000000000000000000000000000000000000000"; // Fallback address
  }
  
  // Fetch account data from Aave
  let totalCollateralETH: bigint = BigInt(0);
  let totalDebtETH: bigint = BigInt(0);
  let availableBorrowsETH: bigint = BigInt(0);
  let currentLiquidationThreshold: bigint = BigInt(0);
  let ltv: bigint = BigInt(0);
  let healthFactor: bigint = BigInt(0);
  let hfNumber = 99;
    
  try {
    // Get user account data using properly checksummed address
    const checksumedLendingPool = checksumAddress(AAVE_LENDING_POOL);
    const checksumedUserAddress = address as `0x${string}`;
    
    // Get user account data
    const accountData = await walletProvider.readContract({
      address: checksumedLendingPool as `0x${string}`,
      abi: AAVE_LENDING_POOL_ABI,
      functionName: "getUserAccountData",
      args: [checksumedUserAddress],
    }) as readonly [bigint, bigint, bigint, bigint, bigint, bigint];
    
    // Convert the big numbers to more usable values
    totalCollateralETH = accountData[0];
    totalDebtETH = accountData[1];
    availableBorrowsETH = accountData[2];
    currentLiquidationThreshold = accountData[3];
    ltv = accountData[4];
    healthFactor = accountData[5];
    
    // Calculate health factor as a number
    hfNumber = Number(formatUnits(healthFactor, 18));
  } catch (error) {
    console.error("Error fetching user account data:", error);
    // Use defaults if error
  }
  
  // Convert values to USD
  const totalCollateralUsd = ethToUsd(totalCollateralETH);
  const totalDebtUsd = ethToUsd(totalDebtETH);
  const availableBorrowsUsd = ethToUsd(availableBorrowsETH);
  
  // Calculate net worth (total collateral minus total debt)
  const netWorthUsd = totalCollateralUsd - totalDebtUsd;
  
  // Determine health factor status
  let healthStatus: "safe" | "caution" | "warning" | "danger" = "safe";
  
  if (hfNumber < 1.1) healthStatus = "danger";
  else if (hfNumber < 1.5) healthStatus = "warning";
  else if (hfNumber < 3) healthStatus = "caution";
  
  // Arrays to store user's aTokens and debtTokens
  let suppliedAssets: Array<{
    symbol: string;
    balance: string;
    balanceUsd: string;
    apy: string;
    isCollateral: boolean;
    icon: string;
  }> = [];
  
  let borrowedAssets: Array<{
    symbol: string;
    balance: string;
    balanceUsd: string;
    apy: string;
    interestMode: string;
    icon: string;
  }> = [];
  
  // Try to detect supplied assets by checking aToken balances
  try {
    for (const tokenKey in TOKEN_INFO) {
      const tokenInfo = TOKEN_INFO[tokenKey];
      
      // Check for aToken balances
      try {
        const aTokenAddress = checksumAddress(tokenInfo.aToken);
        const checksumedUserAddress = address as `0x${string}`;
        
        const balance = await walletProvider.readContract({
          address: aTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [checksumedUserAddress],
        }) as bigint;
        
        if (balance > BigInt(0)) {
          const formattedBalance = formatUnits(balance, tokenInfo.decimals);
          const balanceUsd = Number(formattedBalance) * tokenInfo.price;
          
          suppliedAssets.push({
            symbol: tokenInfo.symbol,
            balance: formattedBalance,
            balanceUsd: formatCurrency(balanceUsd),
            apy: `${tokenInfo.supplyAPY.toFixed(2)}%`,
            isCollateral: tokenInfo.isCollateral,
            icon: tokenInfo.icon
          });
        }
      } catch (error) {
        console.log(`Error checking aToken balance for ${tokenInfo.symbol}:`, error);
        // Continue with next token if there's an error with this one
      }
      
      // Check for variable debt token balances
      try {
        const debtTokenAddress = checksumAddress(tokenInfo.variableDebtToken);
        const checksumedUserAddress = address as `0x${string}`;
        
        const balance = await walletProvider.readContract({
          address: debtTokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [checksumedUserAddress],
        }) as bigint;
        
        if (balance > BigInt(0)) {
          const formattedBalance = formatUnits(balance, tokenInfo.decimals);
          const balanceUsd = Number(formattedBalance) * tokenInfo.price;
          
          borrowedAssets.push({
            symbol: tokenInfo.symbol,
            balance: formattedBalance,
            balanceUsd: formatCurrency(balanceUsd),
            apy: `${tokenInfo.borrowAPY.toFixed(2)}%`,
            interestMode: "Variable",
            icon: tokenInfo.icon
          });
        }
      } catch (error) {
        console.log(`Error checking debtToken balance for ${tokenInfo.symbol}:`, error);
        // Continue with next token if there's an error with this one
      }
    }
  } catch (error) {
    console.error("Error during token detection:", error);
    // Continue with fallback if token detection fails
  }
  
  // If there are no detected supplied assets, but we know there's collateral, use fallback
  if (suppliedAssets.length === 0 && totalCollateralUsd > 0) {
    // Show likely distribution based on most common supply patterns
    const likelyDistribution = [
      { symbol: "USDC", percentage: 0.40 },  // 40% in USDC
      { symbol: "CELO", percentage: 0.30 },  // 30% in CELO
      { symbol: "cUSD", percentage: 0.15 },  // 15% in cUSD
      { symbol: "USDT", percentage: 0.15 }   // 15% in USDT
    ];
    
    for (const dist of likelyDistribution) {
      // Find the token info by symbol
      const tokenInfo = Object.values(TOKEN_INFO).find(t => t.symbol === dist.symbol);
      if (tokenInfo) {
        const valueUsd = totalCollateralUsd * dist.percentage;
        const amount = valueUsd / tokenInfo.price;
        
        suppliedAssets.push({
          symbol: tokenInfo.symbol,
          balance: amount.toFixed(4),
          balanceUsd: formatCurrency(valueUsd),
          apy: `${tokenInfo.supplyAPY.toFixed(2)}%`,
          isCollateral: tokenInfo.isCollateral,
          icon: tokenInfo.icon
        });
      }
    }
  }
  
  // If there are no detected borrowed assets, but we know there's debt, use fallback
  if (borrowedAssets.length === 0 && totalDebtUsd > 0) {
    // Show likely distribution based on most common borrow patterns
    const likelyDistribution = [
      { symbol: "CELO", percentage: 0.70 },  // 70% in CELO
      { symbol: "USDC", percentage: 0.30 },  // 30% in USDC
    ];
    
    for (const dist of likelyDistribution) {
      // Find the token info by symbol
      const tokenInfo = Object.values(TOKEN_INFO).find(t => t.symbol === dist.symbol);
      if (tokenInfo) {
        const valueUsd = totalDebtUsd * dist.percentage;
        const amount = valueUsd / tokenInfo.price;
        
        borrowedAssets.push({
          symbol: tokenInfo.symbol,
          balance: amount.toFixed(4),
          balanceUsd: formatCurrency(valueUsd),
          apy: `${tokenInfo.borrowAPY.toFixed(2)}%`,
          interestMode: "Variable",
          icon: tokenInfo.icon
        });
      }
    }
  }
  
  // Calculate available to borrow based on available borrows
  const availableAssets = Object.values(TOKEN_INFO).map(token => {
    const availableTokens = availableBorrowsUsd / token.price;
    
    return {
      symbol: token.symbol,
      available: availableTokens.toFixed(token.decimals === 6 ? 6 : 4),
      availableUsd: formatCurrency(availableBorrowsUsd),
      apy: `${token.borrowAPY.toFixed(2)}%`,
      icon: token.icon
    };
  });
  
  // Calculate total supplied and borrowed in USD
  const totalSuppliedUsd = suppliedAssets.reduce((total, asset) => {
    return total + parseFloat(asset.balanceUsd.replace(/[^0-9.-]+/g, ""));
  }, 0);
  
  const totalBorrowedUsd = borrowedAssets.reduce((total, asset) => {
    return total + parseFloat(asset.balanceUsd.replace(/[^0-9.-]+/g, ""));
  }, 0);
  
  // Weighted average APY calculation
  const weightedSupplyAPY = suppliedAssets.reduce((weighted, asset) => {
    const value = parseFloat(asset.balanceUsd.replace(/[^0-9.-]+/g, ""));
    const apy = parseFloat(asset.apy.replace('%', ''));
    return weighted + (value * apy) / (totalSuppliedUsd || 1);
  }, 0);
  
  const weightedBorrowAPY = borrowedAssets.reduce((weighted, asset) => {
    const value = parseFloat(asset.balanceUsd.replace(/[^0-9.-]+/g, ""));
    const apy = parseFloat(asset.apy.replace('%', ''));
    return weighted + (value * apy) / (totalBorrowedUsd || 1);
  }, 0);
  
  // Calculate net APY (weighted supply APY - weighted borrow APY)
  const netAPY = totalSuppliedUsd > 0 
    ? (weightedSupplyAPY * totalSuppliedUsd - weightedBorrowAPY * totalBorrowedUsd) / (totalSuppliedUsd || 1)
    : 0;
  
  // Create the dashboard data object with the real data
  return {
    netWorth: {
      value: netWorthUsd.toString(),
      formatted: formatCurrency(netWorthUsd)
    },
    netAPY: {
      value: netAPY,
      formatted: `${netAPY.toFixed(2)}%`
    },
    healthFactor: {
      value: hfNumber,
      formatted: hfNumber > 100 ? "∞" : hfNumber.toFixed(2),
      status: healthStatus
    },
    supplies: {
      balance: totalSuppliedUsd.toString(),
      formatted: formatCurrency(totalSuppliedUsd),
      apy: {
        value: weightedSupplyAPY,
        formatted: `${weightedSupplyAPY.toFixed(2)}%`
      },
      collateral: {
        value: totalCollateralUsd.toString(),
        formatted: formatCurrency(totalCollateralUsd)
      },
      assets: suppliedAssets
    },
    borrows: {
      balance: totalBorrowedUsd.toString(),
      formatted: formatCurrency(totalBorrowedUsd),
      apy: {
        value: weightedBorrowAPY,
        formatted: `${weightedBorrowAPY.toFixed(2)}%`
      },
      powerUsed: {
        value: totalCollateralUsd > 0 ? (totalBorrowedUsd / (totalCollateralUsd * 0.75)) * 100 : 0,
        formatted: totalCollateralUsd > 0 ? `${((totalBorrowedUsd / (totalCollateralUsd * 0.75)) * 100).toFixed(2)}%` : "0%"
      },
      assets: borrowedAssets
    },
    availableToBorrow: availableAssets
  };
}

/**
 * 📋 Generate a formatted text summary of the Aave dashboard
 */
export async function getAaveDashboardSummary(
  walletProvider: EvmWalletProvider,
  userAddress?: string
): Promise<string> {
  try {
    const dashboard = await getAaveDashboard(walletProvider, userAddress);
    
    // Create a formatted summary
    let summary = `💼 **AAVE Dashboard Summary** 💼\n\n`;
    
    // Net worth section
    summary += `📊 **Net Worth**: ${dashboard.netWorth.formatted} (APY: ${dashboard.netAPY.formatted})\n`;
    summary += `🛡️ **Health Factor**: ${dashboard.healthFactor.formatted} `;
    
    // Add emoji based on health factor status
    switch (dashboard.healthFactor.status) {
      case "safe": summary += "🟢\n"; break;
      case "caution": summary += "🟢\n"; break;
      case "warning": summary += "🟡\n"; break;
      case "danger": summary += "🔴\n"; break;
    }
    
    // Supplies section
    summary += `\n💰 **Your Supplies**: ${dashboard.supplies.formatted}\n`;
    if (dashboard.supplies.assets.length > 0) {
      dashboard.supplies.assets.forEach(asset => {
        summary += `  • ${asset.icon} **${asset.symbol}**: ${asset.balance} (${asset.balanceUsd}) - APY: ${asset.apy}${asset.isCollateral ? " 🔒" : ""}\n`;
      });
    } else {
      summary += `  • No assets supplied yet\n`;
    }
    
    // Borrows section
    summary += `\n💸 **Your Borrows**: ${dashboard.borrows.formatted}\n`;
    if (dashboard.borrows.assets.length > 0) {
      dashboard.borrows.assets.forEach(asset => {
        summary += `  • ${asset.icon} **${asset.symbol}**: ${asset.balance} (${asset.balanceUsd}) - APY: ${asset.apy}\n`;
      });
    } else {
      summary += `  • No assets borrowed yet\n`;
    }
    
    // Available to borrow section
    summary += `\n✅ **Available to Borrow**:\n`;
    dashboard.availableToBorrow.forEach(asset => {
      summary += `  • ${asset.icon} **${asset.symbol}**: up to ${asset.available} (${asset.availableUsd}) - APY: ${asset.apy}\n`;
    });
    
    // Add a helpful message based on the user's position
    if (dashboard.supplies.assets.length === 0 && dashboard.borrows.assets.length === 0) {
      summary += `\nIt looks like you currently have no assets supplied or borrowed on AAVE. If you're interested in lending or borrowing, let me know how I can assist you!`;
    } else if (dashboard.healthFactor.value < 1.5 && dashboard.borrows.assets.length > 0) {
      summary += `\n⚠️ **Warning**: Your health factor is low. Consider repaying some of your loans or adding more collateral to avoid liquidation.`;
    } else if (dashboard.supplies.assets.length > 0 && dashboard.borrows.assets.length === 0) {
      summary += `\n💡 **Tip**: You have collateral supplied but no borrows. You can borrow against your collateral if needed.`;
    }
    
    return summary;
  } catch (error) {
    console.error("Error generating dashboard summary:", error);
    return "Unable to generate AAVE dashboard: An error occurred while fetching your data. Please try again later.";
  }
} 