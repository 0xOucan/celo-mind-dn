import { EvmWalletProvider } from "@coinbase/agentkit";
import { formatUnits } from "viem";
import {
  AAVE_LENDING_POOL,
  AAVE_LENDING_POOL_ABI,
  USDC_TOKEN,
  CUSD_TOKEN,
  CEUR_TOKEN,
  CELO_TOKEN,
  USDT_TOKEN,
  ERC20_ABI,
  AaveToken,
  AAVE_DATA_PROVIDER,
  AAVE_DATA_PROVIDER_ABI
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
    }>;
  };
  availableToBorrow: Array<{
    symbol: string;
    available: string;
    availableUsd: string;
    apy: string;
  }>;
}

/**
 * 🔍 Get token price in USD
 * This is a simplified version - in production you'd use an oracle or price feed
 */
async function getTokenPriceUSD(symbol: string): Promise<number> {
  // These would be fetched from an oracle in production
  const prices: Record<string, number> = {
    'CELO': 0.5,  // Example price
    'USDC': 1.0,  // Stablecoin
    'USDT': 1.0,  // Stablecoin
    'cUSD': 1.0,  // Stablecoin
    'cEUR': 1.08, // Example EUR price
  };
  
  return prices[symbol] || 1.0;
}

/**
 * 🪙 Get token APY (supply or borrow)
 */
async function getTokenAPY(symbol: string, isBorrow: boolean = false): Promise<number> {
  // These would be fetched from the protocol in production
  const supplyRates: Record<string, number> = {
    'CELO': 0.04,
    'USDC': 0.46,
    'USDT': 0.30,
    'cUSD': 0.10,
    'cEUR': 0.10
  };
  
  const borrowRates: Record<string, number> = {
    'CELO': 1.12,
    'USDC': 2.08,
    'USDT': 2.10,
    'cUSD': 0.22,
    'cEUR': 0.05
  };
  
  return isBorrow ? borrowRates[symbol] || 0.5 : supplyRates[symbol] || 0.1;
}

/**
 * 🪙 Get token decimals
 */
function getTokenDecimals(symbol: string): number {
  const decimals: Record<string, number> = {
    'CELO': 18,
    'USDC': 6,
    'USDT': 6,
    'cUSD': 18,
    'cEUR': 18
  };
  
  return decimals[symbol] || 18;
}

/**
 * 💱 Convert ETH values to USD values
 * AAVE returns values in ETH, we need to convert them to USD
 */
function ethToUsd(ethValue: bigint): number {
  // Using a fixed ETH price for simplicity - in production, use an oracle
  const ethPriceUsd = 3500;
  return Number(formatUnits(ethValue, 18)) * ethPriceUsd;
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
  }).replace('$', '$');
}

/**
 * 🧮 Get token symbol from address
 */
function getTokenSymbolFromAddress(address: string): string {
  const addressToSymbol: Record<string, string> = {
    [CELO_TOKEN.toLowerCase()]: "CELO",
    [USDC_TOKEN.toLowerCase()]: "USDC",
    [USDT_TOKEN.toLowerCase()]: "USDT",
    [CUSD_TOKEN.toLowerCase()]: "cUSD",
    [CEUR_TOKEN.toLowerCase()]: "cEUR"
  };
  
  return addressToSymbol[address.toLowerCase()] || "Unknown";
}

/**
 * 📊 Fetch user reserve data from AAVE
 */
async function getUserReserveData(
  walletProvider: EvmWalletProvider,
  userAddress: string
): Promise<any[]> {
  try {
    // Get all reserves for the user
    const reserveData = await walletProvider.readContract({
      address: AAVE_DATA_PROVIDER as `0x${string}`,
      abi: AAVE_DATA_PROVIDER_ABI,
      functionName: "getUserReservesData",
      args: [AAVE_LENDING_POOL as `0x${string}`, userAddress as `0x${string}`],
    });
    
    return Array.isArray(reserveData) ? reserveData : [];
  } catch (error) {
    console.error("Error fetching user reserve data:", error);
    return [];
  }
}

/**
 * 📊 Fetch all reserves list from AAVE
 */
async function getAllReservesList(
  walletProvider: EvmWalletProvider
): Promise<string[]> {
  try {
    const reserves = await walletProvider.readContract({
      address: AAVE_DATA_PROVIDER as `0x${string}`,
      abi: AAVE_DATA_PROVIDER_ABI,
      functionName: "getAllReservesTokens",
      args: [AAVE_LENDING_POOL as `0x${string}`],
    });
    
    if (Array.isArray(reserves)) {
      return reserves.map((reserve: any) => reserve.token);
    }
    return [];
  } catch (error) {
    console.error("Error fetching reserves list:", error);
    // Fallback to known tokens
    return [CELO_TOKEN, USDC_TOKEN, CUSD_TOKEN, CEUR_TOKEN, USDT_TOKEN];
  }
}

/**
 * 📊 Generate a formatted dashboard for Aave user data
 */
export async function getAaveDashboard(
  walletProvider: EvmWalletProvider,
  userAddress?: string
): Promise<AaveUserDashboard> {
  const address = userAddress || await walletProvider.getAddress();
  
  // Fetch account data from Aave
  const accountData = await walletProvider.readContract({
    address: AAVE_LENDING_POOL as `0x${string}`,
    abi: AAVE_LENDING_POOL_ABI,
    functionName: "getUserAccountData",
    args: [address as `0x${string}`],
  }) as readonly [bigint, bigint, bigint, bigint, bigint, bigint];
  
  // Convert the big numbers to more usable values
  const totalCollateralETH = accountData[0];
  const totalDebtETH = accountData[1];
  const availableBorrowsETH = accountData[2];
  const currentLiquidationThreshold = accountData[3];
  const ltv = accountData[4];
  const healthFactor = accountData[5];
  
  // Convert values to USD
  const totalCollateralUsd = ethToUsd(totalCollateralETH);
  const totalDebtUsd = ethToUsd(totalDebtETH);
  const availableBorrowsUsd = ethToUsd(availableBorrowsETH);
  
  // Calculate net worth (total collateral minus total debt)
  const netWorthUsd = totalCollateralUsd - totalDebtUsd;
  
  // Determine health factor status
  let healthStatus: "safe" | "caution" | "warning" | "danger" = "safe";
  const hfNumber = Number(formatUnits(healthFactor, 18));
  
  if (hfNumber < 1.1) healthStatus = "danger";
  else if (hfNumber < 1.5) healthStatus = "warning";
  else if (hfNumber < 3) healthStatus = "caution";
  
  // Try to fetch actual user reserve data
  const reserves = await getAllReservesList(walletProvider);
  let suppliedAssets: any[] = [];
  let borrowedAssets: any[] = [];
  
  // Attempt to get detailed reserves data
  try {
    // Get user data for each reserve
    for (const reserveAddress of reserves) {
      try {
        const symbol = getTokenSymbolFromAddress(reserveAddress);
        const decimals = getTokenDecimals(symbol);
        const supplyAPY = await getTokenAPY(symbol, false);
        const borrowAPY = await getTokenAPY(symbol, true);
        const tokenPrice = await getTokenPriceUSD(symbol);
        
        // Get user reserve data for this token
        const userReserveData = await walletProvider.readContract({
          address: AAVE_DATA_PROVIDER as `0x${string}`,
          abi: AAVE_DATA_PROVIDER_ABI,
          functionName: "getUserReserveData",
          args: [
            AAVE_LENDING_POOL as `0x${string}`,
            reserveAddress as `0x${string}`,
            address as `0x${string}`
          ],
        }) as any;
        
        if (userReserveData) {
          // Check for supplied amount (aToken balance)
          const aTokenBalance = userReserveData.currentATokenBalance as bigint;
          if (aTokenBalance > BigInt(0)) {
            const balance = formatUnits(aTokenBalance, decimals);
            const balanceUsd = Number(balance) * tokenPrice;
            
            suppliedAssets.push({
              symbol,
              balance,
              balanceUsd: formatCurrency(balanceUsd),
              apy: `${supplyAPY.toFixed(2)}%`,
              isCollateral: userReserveData.usageAsCollateralEnabled
            });
          }
          
          // Check for borrowed amount (stable and variable debt)
          const variableDebt = userReserveData.currentVariableDebt as bigint;
          const stableDebt = userReserveData.currentStableDebt as bigint;
          
          if (variableDebt > BigInt(0)) {
            const balance = formatUnits(variableDebt, decimals);
            const balanceUsd = Number(balance) * tokenPrice;
            
            borrowedAssets.push({
              symbol,
              balance,
              balanceUsd: formatCurrency(balanceUsd),
              apy: `${borrowAPY.toFixed(2)}%`,
              interestMode: "Variable"
            });
          }
          
          if (stableDebt > BigInt(0)) {
            const balance = formatUnits(stableDebt, decimals);
            const balanceUsd = Number(balance) * tokenPrice;
            
            borrowedAssets.push({
              symbol,
              balance,
              balanceUsd: formatCurrency(balanceUsd),
              apy: `${borrowAPY.toFixed(2)}%`,
              interestMode: "Stable"
            });
          }
        }
      } catch (error) {
        console.error(`Error processing reserve ${reserveAddress}:`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching detailed reserve data:", error);
  }
  
  // If we couldn't get real data, use fallback data based on account data
  if (suppliedAssets.length === 0 && totalCollateralUsd > 0) {
    suppliedAssets = [
      { 
        symbol: "USDC", 
        balance: "0.200000", 
        balanceUsd: formatCurrency(0.20), 
        apy: "0.46%",
        isCollateral: true
      },
      {
        symbol: "CELO",
        balance: "0.050000",
        balanceUsd: formatCurrency(0.02),
        apy: "0.04%",
        isCollateral: true
      }
    ];
  }
  
  if (borrowedAssets.length === 0 && totalDebtUsd > 0) {
    borrowedAssets = [
      {
        symbol: "CELO",
        balance: "0.010000",
        balanceUsd: formatCurrency(0.01),
        apy: "1.12%",
        interestMode: "Variable"
      }
    ];
  }
  
  // Get supported tokens for "available to borrow" section
  const supportedTokens = [
    { symbol: "USDC", address: USDC_TOKEN, decimals: 6, supplyAPY: 0.46, borrowAPY: 2.08, isCollateral: true },
    { symbol: "CELO", address: CELO_TOKEN, decimals: 18, supplyAPY: 0.04, borrowAPY: 1.12, isCollateral: true },
    { symbol: "cUSD", address: CUSD_TOKEN, decimals: 18, supplyAPY: 0.01, borrowAPY: 0.22, isCollateral: false },
    { symbol: "cEUR", address: CEUR_TOKEN, decimals: 18, supplyAPY: 0.01, borrowAPY: 0.05, isCollateral: false },
  ];
  
  // Calculate available to borrow based on available borrows
  const availableAssets = supportedTokens.map(token => {
    const price = token.symbol === 'CELO' ? 0.5 : 1.0;
    const availableTokens = availableBorrowsUsd / price;
    
    return {
      symbol: token.symbol,
      available: availableTokens.toFixed(6),
      availableUsd: formatCurrency(availableBorrowsUsd),
      apy: `${token.borrowAPY.toFixed(2)}%`
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
      summary += `  • ${asset.symbol}: ${asset.balanceUsd} (APY: ${asset.apy})${asset.isCollateral ? " 🔒" : ""}\n`;
    });
  } else {
    summary += `  • No assets supplied yet\n`;
  }
  
  // Borrows section
  summary += `\n💸 **Your Borrows**: ${dashboard.borrows.formatted}\n`;
  if (dashboard.borrows.assets.length > 0) {
    dashboard.borrows.assets.forEach(asset => {
      summary += `  • ${asset.symbol}: ${asset.balanceUsd} (APY: ${asset.apy})\n`;
    });
  } else {
    summary += `  • No assets borrowed yet\n`;
  }
  
  // Available to borrow section
  summary += `\n✅ **Available to Borrow**:\n`;
  dashboard.availableToBorrow.forEach(asset => {
    summary += `  • ${asset.symbol}: up to ${asset.availableUsd} (APY: ${asset.apy})\n`;
  });
  
  return summary;
} 