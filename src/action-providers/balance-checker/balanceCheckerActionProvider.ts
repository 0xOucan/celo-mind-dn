import { z } from "zod";
import {
  ActionProvider,
  Network,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";
import { formatUnits } from "viem";
import "reflect-metadata";
import {
  CheckBalanceSchema,
  CheckTokenBalanceSchema,
  CheckNativeBalanceSchema,
} from "./schemas";
import {
  ERC20_ABI,
  TRACKED_TOKENS,
  TOKEN_DECIMALS,
  TOKEN_SYMBOLS,
  TOKEN_PRICES_USD,
} from "./constants";

// 💰 Interface for token balance with USD value
interface TokenBalance {
  symbol: string;
  address: string;
  balance: string;
  balanceFormatted: string;
  balanceUsd: string;
  decimals: number;
  isNative: boolean;
  icon: string;
}

/**
 * 💰 BalanceCheckerActionProvider provides actions for checking token balances on Celo
 */
export class BalanceCheckerActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super("balance-checker", []);
  }

  /**
   * 🌐 Check if we're on Celo network
   */
  private async checkNetwork(walletProvider: EvmWalletProvider): Promise<void> {
    const network = await walletProvider.getNetwork();
    // Accept both network ID and chain ID checks for Celo
    if ((!network.networkId || !network.networkId.includes("celo")) && 
        (!network.chainId || network.chainId !== "42220")) {
      throw new Error("This action provider is configured for Celo. Please switch your network to Celo.");
    }
  }

  /**
   * 🔍 Get balance of a specific token
   */
  private async getTokenBalance(
    walletProvider: EvmWalletProvider,
    tokenAddress: string,
    walletAddress: string
  ): Promise<bigint> {
    try {
      const balance = await walletProvider.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress as `0x${string}`],
      }) as bigint;
      
      return balance;
    } catch (error) {
      console.error(`Error getting balance for token ${tokenAddress}:`, error);
      return BigInt(0);
    }
  }

  /**
   * 💰 Format token balance with proper decimals
   */
  private formatTokenBalance(
    balance: bigint,
    decimals: number
  ): string {
    return formatUnits(balance, decimals);
  }

  /**
   * 💲 Convert token amount to USD value
   */
  private getUsdValue(
    formattedBalance: string,
    tokenAddress: string
  ): string {
    // Use type assertion to handle the string index access
    const price = TOKEN_PRICES_USD[tokenAddress as keyof typeof TOKEN_PRICES_USD] || 0;
    const usdValue = Number(formattedBalance) * price;
    return usdValue.toFixed(2);
  }

  /**
   * 💰 Get balances for all tracked tokens
   */
  private async getAllTokenBalances(
    walletProvider: EvmWalletProvider,
    walletAddress: string,
    includeUSD: boolean = true
  ): Promise<TokenBalance[]> {
    const result: TokenBalance[] = [];
    
    // Get native CELO balance
    const nativeBalance = await walletProvider.getBalance();
    const nativeToken = TRACKED_TOKENS.find(t => t.isNative);
    
    if (nativeToken) {
      const formattedBalance = this.formatTokenBalance(nativeBalance, nativeToken.decimals);
      const balanceUsd = includeUSD ? 
        this.getUsdValue(formattedBalance, nativeToken.address) : 
        "0.00";
      
      result.push({
        symbol: nativeToken.symbol,
        address: nativeToken.address,
        balance: nativeBalance.toString(),
        balanceFormatted: formattedBalance,
        balanceUsd: `$${balanceUsd}`,
        decimals: nativeToken.decimals,
        isNative: true,
        icon: nativeToken.icon
      });
    }
    
    // Get balances for all non-native tokens
    const tokenPromises = TRACKED_TOKENS
      .filter(token => !token.isNative)
      .map(async (token) => {
        const balance = await this.getTokenBalance(
          walletProvider, 
          token.address, 
          walletAddress
        );
        
        if (balance > BigInt(0)) {
          const formattedBalance = this.formatTokenBalance(balance, token.decimals);
          const balanceUsd = includeUSD ? 
            this.getUsdValue(formattedBalance, token.address) : 
            "0.00";
          
          result.push({
            symbol: token.symbol,
            address: token.address,
            balance: balance.toString(),
            balanceFormatted: formattedBalance,
            balanceUsd: `$${balanceUsd}`,
            decimals: token.decimals,
            isNative: false,
            icon: token.icon
          });
        }
      });
    
    await Promise.all(tokenPromises);
    
    // Sort by USD value, highest first
    return result.sort((a, b) => {
      const aValue = Number(a.balanceUsd.replace('$', ''));
      const bValue = Number(b.balanceUsd.replace('$', ''));
      return bValue - aValue;
    });
  }

  /**
   * 📊 Check wallet balances
   */
  @CreateAction({
    name: "check_wallet_balances",
    description: "Check balances of all tracked tokens in a wallet",
    schema: CheckBalanceSchema,
  })
  async checkWalletBalances(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof CheckBalanceSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const { address, includeUSD = true } = args;
    const walletAddress = address || await walletProvider.getAddress();
    
    const balances = await this.getAllTokenBalances(
      walletProvider,
      walletAddress,
      includeUSD
    );
    
    if (balances.length === 0) {
      return `No token balances found for wallet address ${walletAddress}.`;
    }
    
    // Calculate total USD value
    const totalUsdValue = balances.reduce((sum, token) => {
      return sum + Number(token.balanceUsd.replace('$', ''));
    }, 0);
    
    // Format the output
    let result = `💰 **Wallet Balances** 💰\n\n`;
    result += `**Address**: \`${walletAddress}\`\n`;
    result += `**Total Value**: $${totalUsdValue.toFixed(2)} USD\n\n`;
    
    balances.forEach((token) => {
      result += `${token.icon} **${token.symbol}**: ${token.balanceFormatted} ${includeUSD ? `(${token.balanceUsd})` : ''}\n`;
    });
    
    return result;
  }

  /**
   * 🪙 Check specific token balance
   */
  @CreateAction({
    name: "check_token_balance",
    description: "Check balance of a specific token in a wallet",
    schema: CheckTokenBalanceSchema,
  })
  async checkTokenBalance(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof CheckTokenBalanceSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const { address, tokenAddress } = args;
    const walletAddress = address || await walletProvider.getAddress();
    
    // Get token details
    const tokenInfo = TRACKED_TOKENS.find(t => t.address.toLowerCase() === tokenAddress.toLowerCase());
    if (!tokenInfo) {
      return `Token with address ${tokenAddress} is not in the tracked tokens list.`;
    }
    
    // Get token balance
    const balance = tokenInfo.isNative ?
      await walletProvider.getBalance() :
      await this.getTokenBalance(walletProvider, tokenAddress, walletAddress);
    
    const formattedBalance = this.formatTokenBalance(balance, tokenInfo.decimals);
    const balanceUsd = this.getUsdValue(formattedBalance, tokenAddress);
    
    return `${tokenInfo.icon} **${tokenInfo.symbol}** Balance for ${walletAddress}:\n` +
      `Balance: ${formattedBalance} ${tokenInfo.symbol}\n` +
      `Value: $${balanceUsd} USD`;
  }

  /**
   * 🪙 Check native balance (CELO)
   */
  @CreateAction({
    name: "check_native_balance",
    description: "Check CELO balance of a wallet",
    schema: CheckNativeBalanceSchema,
  })
  async checkNativeBalance(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof CheckNativeBalanceSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const { address } = args;
    const walletAddress = address || await walletProvider.getAddress();
    
    // Get native token details
    const nativeToken = TRACKED_TOKENS.find(t => t.isNative);
    if (!nativeToken) {
      return `Native token information not found.`;
    }
    
    // Get native token balance
    const balance = await walletProvider.getBalance();
    const formattedBalance = this.formatTokenBalance(balance, nativeToken.decimals);
    const balanceUsd = this.getUsdValue(formattedBalance, nativeToken.address);
    
    return `${nativeToken.icon} **${nativeToken.symbol}** Balance for ${walletAddress}:\n` +
      `Balance: ${formattedBalance} ${nativeToken.symbol}\n` +
      `Value: $${balanceUsd} USD`;
  }

  /**
   * 🌐 Check if network is supported
   */
  supportsNetwork = (network: Network): boolean => {
    return network.networkId?.includes("celo") || network.chainId === "42220";
  };
}

export const balanceCheckerActionProvider = () => new BalanceCheckerActionProvider(); 