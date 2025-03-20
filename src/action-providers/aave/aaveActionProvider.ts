import { z } from "zod";
import {
  ActionProvider,
  Network,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";
import { encodeFunctionData, parseUnits, formatUnits } from "viem";
import type { Hex } from "viem";
import "reflect-metadata";
import {
  ApproveTokenSchema,
  SupplySchema,
  BorrowSchema,
  RepaySchema,
  WithdrawSchema,
  ProvideTokensSchema,
  GetUserDataSchema,
} from "./schemas";
import {
  AAVE_LENDING_POOL,
  AAVE_LENDING_POOL_ABI,
  CELO_TOKEN,
  USDC_TOKEN,
  CUSD_TOKEN,
  CEUR_TOKEN,
  ERC20_ABI,
  InterestRateMode,
  AaveToken,
  NON_COLLATERAL_TOKENS,
  DEFAULT_REFERRAL_CODE,
} from "./constants";
import {
  AaveError,
  InsufficientBalanceError,
  InsufficientAllowanceError,
  WrongNetworkError,
  TransactionFailedError,
  NonCollateralTokenError,
  HealthFactorTooLowError,
} from "./errors";

/**
 * 🏦 AaveActionProvider provides actions for interacting with AAVE lending protocol on Celo
 */
export class AaveActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super("aave", []);
  }

  /**
   * 🌐 Check if we're on Celo network
   */
  private async checkNetwork(walletProvider: EvmWalletProvider): Promise<void> {
    const network = await walletProvider.getNetwork();
    // Accept both network ID and chain ID checks for Celo
    if ((!network.networkId || !network.networkId.includes("celo")) && 
        (!network.chainId || network.chainId !== "42220")) {
      throw new WrongNetworkError();
    }
  }

  /**
   * 🪙 Get token address based on the token enum
   */
  private getTokenAddress(token: AaveToken): string {
    switch (token) {
      case AaveToken.USDC:
        return USDC_TOKEN;
      case AaveToken.CUSD:
        return CUSD_TOKEN;
      case AaveToken.CEUR:
        return CEUR_TOKEN;
      case AaveToken.CELO:
        return CELO_TOKEN;
      default:
        throw new AaveError(`Unsupported token: ${token}`);
    }
  }

  /**
   * 💰 Check if user has enough token balance
   */
  private async checkTokenBalance(
    walletProvider: EvmWalletProvider,
    tokenAddress: string,
    amount: string
  ): Promise<void> {
    const address = await walletProvider.getAddress();
    const balance = await walletProvider.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    }) as bigint;

    if (balance < BigInt(amount)) {
      const tokenSymbol = await this.getTokenSymbol(walletProvider, tokenAddress);
      const formattedBalance = await this.formatTokenAmount(walletProvider, tokenAddress, balance);
      const formattedAmount = await this.formatTokenAmount(walletProvider, tokenAddress, BigInt(amount));
      
      throw new InsufficientBalanceError(
        tokenSymbol,
        formattedBalance,
        formattedAmount
      );
    }
  }

  /**
   * 🔒 Check token allowance
   */
  private async checkTokenAllowance(
    walletProvider: EvmWalletProvider,
    tokenAddress: string,
    spender: string,
    amount: string
  ): Promise<void> {
    const address = await walletProvider.getAddress();
    const allowance = await walletProvider.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [address as `0x${string}`, spender as `0x${string}`],
    }) as bigint;

    if (allowance < BigInt(amount)) {
      const tokenSymbol = await this.getTokenSymbol(walletProvider, tokenAddress);
      throw new InsufficientAllowanceError(
        tokenSymbol,
        allowance.toString(),
        amount
      );
    }
  }

  /**
   * 🌐 Get Celoscan link for transaction
   */
  private getCeloscanLink(txHash: string): string {
    return `https://celoscan.io/tx/${txHash}`;
  }

  /**
   * 💱 Format token amount with proper decimals
   */
  private async formatTokenAmount(
    walletProvider: EvmWalletProvider,
    tokenAddress: string,
    amount: bigint
  ): Promise<string> {
    try {
      const decimals = await walletProvider.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "decimals",
      }) as number;
      
      return formatUnits(amount, decimals);
    } catch (error) {
      console.error("Error formatting token amount:", error);
      return amount.toString();
    }
  }

  /**
   * 💱 Parse token amount to appropriate units based on decimals
   */
  private async parseTokenAmount(
    walletProvider: EvmWalletProvider,
    tokenAddress: string,
    amount: string
  ): Promise<bigint> {
    try {
      const decimals = await walletProvider.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "decimals",
      }) as number;
      
      return parseUnits(amount, decimals);
    } catch (error) {
      console.error("Error parsing token amount:", error);
      return BigInt(amount);
    }
  }

  /**
   * 🏷️ Get token symbol
   */
  private async getTokenSymbol(
    walletProvider: EvmWalletProvider,
    tokenAddress: string
  ): Promise<string> {
    try {
      return await walletProvider.readContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "symbol",
      }) as string;
    } catch (error) {
      console.error("Error getting token symbol:", error);
      return "Unknown";
    }
  }

  /**
   * 🔍 Check if token can be used as collateral
   */
  private checkCollateralEligibility(token: AaveToken): void {
    if (NON_COLLATERAL_TOKENS.includes(token)) {
      throw new NonCollateralTokenError(token);
    }
  }

  /**
   * 💵 Get user account data from AAVE
   */
  private async getUserAccountData(
    walletProvider: EvmWalletProvider,
    userAddress: string
  ): Promise<{
    totalCollateralETH: bigint;
    totalDebtETH: bigint;
    availableBorrowsETH: bigint;
    currentLiquidationThreshold: bigint;
    ltv: bigint;
    healthFactor: bigint;
  }> {
    const result = await walletProvider.readContract({
      address: AAVE_LENDING_POOL as `0x${string}`,
      abi: AAVE_LENDING_POOL_ABI,
      functionName: "getUserAccountData",
      args: [userAddress as `0x${string}`],
    }) as readonly [bigint, bigint, bigint, bigint, bigint, bigint];
    
    // Convert tuple to object
    return {
      totalCollateralETH: result[0],
      totalDebtETH: result[1],
      availableBorrowsETH: result[2],
      currentLiquidationThreshold: result[3],
      ltv: result[4],
      healthFactor: result[5]
    };
  }

  /**
   * 👍 Approve tokens for AAVE lending pool
   */
  @CreateAction({
    name: "approve_token_for_aave",
    description: "Approve tokens to be used by the AAVE lending pool",
    schema: ApproveTokenSchema,
  })
  async approveToken(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof ApproveTokenSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);

    const { token, amount } = args;
    const tokenAddress = this.getTokenAddress(token);
    
    // Parse amount to token units
    const parsedAmount = await this.parseTokenAmount(walletProvider, tokenAddress, amount);
    
    // Check if user has enough balance
    await this.checkTokenBalance(walletProvider, tokenAddress, parsedAmount.toString());
    
    // Create and send the approval transaction
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [AAVE_LENDING_POOL as `0x${string}`, parsedAmount],
    }) as Hex;

    try {
      const txHash = await walletProvider.sendTransaction({
        to: tokenAddress as `0x${string}`,
        data,
      });
      
      const formattedAmount = await this.formatTokenAmount(walletProvider, tokenAddress, parsedAmount);
      return `Successfully approved ${formattedAmount} ${token} tokens for AAVE lending pool. Transaction: ${this.getCeloscanLink(txHash)}`;
    } catch (error) {
      throw new TransactionFailedError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * 📥 Supply tokens to AAVE
   */
  @CreateAction({
    name: "supply_to_aave",
    description: "Supply tokens to the AAVE lending pool as collateral",
    schema: SupplySchema,
  })
  async supplyTokens(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof SupplySchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);

    const { token, amount, onBehalfOf } = args;
    const tokenAddress = this.getTokenAddress(token);
    
    // Parse amount to token units
    const parsedAmount = await this.parseTokenAmount(walletProvider, tokenAddress, amount);
    
    // Get user address
    const userAddress = await walletProvider.getAddress();
    
    // Check if user has enough balance
    await this.checkTokenBalance(walletProvider, tokenAddress, parsedAmount.toString());
    
    // Check token allowance
    await this.checkTokenAllowance(
      walletProvider,
      tokenAddress,
      AAVE_LENDING_POOL,
      parsedAmount.toString()
    );

    // Create and send the supply transaction
    const data = encodeFunctionData({
      abi: AAVE_LENDING_POOL_ABI,
      functionName: "supply",
      args: [
        tokenAddress as `0x${string}`,
        parsedAmount,
        (onBehalfOf || userAddress) as `0x${string}`,
        DEFAULT_REFERRAL_CODE,
      ],
    }) as Hex;

    try {
      const txHash = await walletProvider.sendTransaction({
        to: AAVE_LENDING_POOL as `0x${string}`,
        data,
      });
      
      const formattedAmount = await this.formatTokenAmount(walletProvider, tokenAddress, parsedAmount);
      return `Successfully supplied ${formattedAmount} ${token} to AAVE. Transaction: ${this.getCeloscanLink(txHash)}`;
    } catch (error) {
      throw new TransactionFailedError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * 🚀 Provide tokens to AAVE (approve + supply in one step)
   */
  @CreateAction({
    name: "provide_to_aave",
    description: "Approve and supply tokens to the AAVE lending pool in one operation",
    schema: ProvideTokensSchema,
  })
  async provideTokens(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof ProvideTokensSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);

    const { token, amount, onBehalfOf } = args;
    const tokenAddress = this.getTokenAddress(token);
    
    // Parse amount to token units
    const parsedAmount = await this.parseTokenAmount(walletProvider, tokenAddress, amount);
    
    // Get user address
    const userAddress = await walletProvider.getAddress();
    
    // Check if user has enough balance
    await this.checkTokenBalance(walletProvider, tokenAddress, parsedAmount.toString());
    
    // Get current allowance
    const address = await walletProvider.getAddress();
    const allowance = await walletProvider.readContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [address as `0x${string}`, AAVE_LENDING_POOL as `0x${string}`],
    }) as bigint;

    // Approve tokens if necessary
    if (allowance < parsedAmount) {
      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [AAVE_LENDING_POOL as `0x${string}`, parsedAmount],
      }) as Hex;

      try {
        const approveTxHash = await walletProvider.sendTransaction({
          to: tokenAddress as `0x${string}`,
          data: approveData,
        });
        
        console.log(`Approval transaction: ${this.getCeloscanLink(approveTxHash)}`);
      } catch (error) {
        throw new TransactionFailedError(
          `Token approval failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Create and send the supply transaction
    const supplyData = encodeFunctionData({
      abi: AAVE_LENDING_POOL_ABI,
      functionName: "supply",
      args: [
        tokenAddress as `0x${string}`,
        parsedAmount,
        (onBehalfOf || userAddress) as `0x${string}`,
        DEFAULT_REFERRAL_CODE,
      ],
    }) as Hex;

    try {
      const supplyTxHash = await walletProvider.sendTransaction({
        to: AAVE_LENDING_POOL as `0x${string}`,
        data: supplyData,
      });
      
      const formattedAmount = await this.formatTokenAmount(walletProvider, tokenAddress, parsedAmount);
      return `Successfully provided ${formattedAmount} ${token} to AAVE. Transaction: ${this.getCeloscanLink(supplyTxHash)}`;
    } catch (error) {
      throw new TransactionFailedError(
        `Supply transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * 💸 Borrow tokens from AAVE
   */
  @CreateAction({
    name: "borrow_from_aave",
    description: "Borrow tokens from the AAVE lending pool using your supplied collateral",
    schema: BorrowSchema,
  })
  async borrowTokens(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof BorrowSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);

    const { token, amount, interestRateMode, onBehalfOf } = args;
    const tokenAddress = this.getTokenAddress(token);
    
    // Parse amount to token units
    const parsedAmount = await this.parseTokenAmount(walletProvider, tokenAddress, amount);
    
    // Get user address
    const userAddress = await walletProvider.getAddress();
    
    // Check user's health factor and available borrows
    const accountData = await this.getUserAccountData(walletProvider, userAddress);
    
    if (accountData.healthFactor < BigInt(12000000000000000)) { // 1.2 with 1e18 precision
      throw new HealthFactorTooLowError(
        formatUnits(accountData.healthFactor, 18)
      );
    }

    // Create and send the borrow transaction
    const data = encodeFunctionData({
      abi: AAVE_LENDING_POOL_ABI,
      functionName: "borrow",
      args: [
        tokenAddress as `0x${string}`,
        parsedAmount,
        BigInt(interestRateMode),
        DEFAULT_REFERRAL_CODE,
        (onBehalfOf || userAddress) as `0x${string}`,
      ],
    }) as Hex;

    try {
      const txHash = await walletProvider.sendTransaction({
        to: AAVE_LENDING_POOL as `0x${string}`,
        data,
      });
      
      const formattedAmount = await this.formatTokenAmount(walletProvider, tokenAddress, parsedAmount);
      return `Successfully borrowed ${formattedAmount} ${token} from AAVE. Transaction: ${this.getCeloscanLink(txHash)}`;
    } catch (error) {
      throw new TransactionFailedError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * 💰 Repay borrowed tokens
   */
  @CreateAction({
    name: "repay_aave_loan",
    description: "Repay tokens borrowed from the AAVE lending pool",
    schema: RepaySchema,
  })
  async repayTokens(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof RepaySchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);

    const { token, amount, interestRateMode, onBehalfOf } = args;
    const tokenAddress = this.getTokenAddress(token);
    
    // Get user address
    const userAddress = await walletProvider.getAddress();
    
    // Handle full repayment case (amount = -1)
    let parsedAmount: bigint;
    if (amount === "-1") {
      parsedAmount = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    } else {
      // Parse amount to token units
      parsedAmount = await this.parseTokenAmount(walletProvider, tokenAddress, amount);
      
      // Check if user has enough balance
      await this.checkTokenBalance(walletProvider, tokenAddress, parsedAmount.toString());
    }
    
    // Check token allowance
    await this.checkTokenAllowance(
      walletProvider,
      tokenAddress,
      AAVE_LENDING_POOL,
      parsedAmount.toString()
    );

    // Create and send the repay transaction
    const data = encodeFunctionData({
      abi: AAVE_LENDING_POOL_ABI,
      functionName: "repay",
      args: [
        tokenAddress as `0x${string}`,
        parsedAmount,
        BigInt(interestRateMode),
        (onBehalfOf || userAddress) as `0x${string}`,
      ],
    }) as Hex;

    try {
      const txHash = await walletProvider.sendTransaction({
        to: AAVE_LENDING_POOL as `0x${string}`,
        data,
      });
      
      const amountText = amount === "-1" ? "all borrowed" : await this.formatTokenAmount(walletProvider, tokenAddress, parsedAmount);
      return `Successfully repaid ${amountText} ${token} to AAVE. Transaction: ${this.getCeloscanLink(txHash)}`;
    } catch (error) {
      throw new TransactionFailedError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * 📤 Withdraw tokens from AAVE
   */
  @CreateAction({
    name: "withdraw_from_aave",
    description: "Withdraw tokens previously supplied to the AAVE lending pool",
    schema: WithdrawSchema,
  })
  async withdrawTokens(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof WithdrawSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);

    const { token, amount, to } = args;
    const tokenAddress = this.getTokenAddress(token);
    
    // Get user address
    const userAddress = await walletProvider.getAddress();
    
    // Handle maximum withdrawal case (amount = -1)
    let parsedAmount: bigint;
    if (amount === "-1") {
      parsedAmount = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    } else {
      // Parse amount to token units
      parsedAmount = await this.parseTokenAmount(walletProvider, tokenAddress, amount);
    }
    
    // Check user's health factor 
    const accountData = await this.getUserAccountData(walletProvider, userAddress);
    
    if (accountData.healthFactor < BigInt(12000000000000000) && 
        amount !== "-1" && 
        accountData.totalDebtETH > BigInt(0)) { // Only check if user has debt
      throw new HealthFactorTooLowError(
        formatUnits(accountData.healthFactor, 18)
      );
    }

    // Create and send the withdraw transaction
    const data = encodeFunctionData({
      abi: AAVE_LENDING_POOL_ABI,
      functionName: "withdraw",
      args: [
        tokenAddress as `0x${string}`,
        parsedAmount,
        (to || userAddress) as `0x${string}`,
      ],
    }) as Hex;

    try {
      const txHash = await walletProvider.sendTransaction({
        to: AAVE_LENDING_POOL as `0x${string}`,
        data,
      });
      
      const amountText = amount === "-1" ? "all" : await this.formatTokenAmount(walletProvider, tokenAddress, parsedAmount);
      return `Successfully withdrew ${amountText} ${token} from AAVE. Transaction: ${this.getCeloscanLink(txHash)}`;
    } catch (error) {
      throw new TransactionFailedError(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * 💼 Get user account data
   */
  @CreateAction({
    name: "get_aave_user_data",
    description: "Get user account data from the AAVE lending pool",
    schema: GetUserDataSchema,
  })
  async getUserData(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof GetUserDataSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);

    const { address } = args;
    const userAddress = address || await walletProvider.getAddress();
    
    const accountData = await this.getUserAccountData(walletProvider, userAddress);
    
    const totalCollateral = formatUnits(accountData.totalCollateralETH, 18);
    const totalDebt = formatUnits(accountData.totalDebtETH, 18);
    const availableBorrows = formatUnits(accountData.availableBorrowsETH, 18);
    const ltv = formatUnits(accountData.ltv, 2); // LTV is typically in percentage with 2 decimals
    const healthFactor = formatUnits(accountData.healthFactor, 18);
    
    return `AAVE user data for ${userAddress}:\n` +
      `Total Collateral: ${totalCollateral} ETH\n` +
      `Total Debt: ${totalDebt} ETH\n` +
      `Available to Borrow: ${availableBorrows} ETH\n` +
      `Current LTV: ${ltv}%\n` +
      `Health Factor: ${healthFactor}`;
  }

  /**
   * 🌐 Check if network is supported
   */
  supportsNetwork = (network: Network): boolean => {
    return network.networkId?.includes("celo") || network.chainId === "42220";
  };
}

export const aaveActionProvider = () => new AaveActionProvider(); 