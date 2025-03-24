import { z } from "zod";
import {
  ActionProvider,
  Network,
  CreateAction,
  EvmWalletProvider,
} from "@coinbase/agentkit";
import { 
  parseEther, 
  formatEther, 
  formatUnits,
  encodeFunctionData,
  type PublicClient, 
  type WalletClient 
} from 'viem';
import "reflect-metadata";
import { SwapParamsSchema, SwapQuoteSchema } from './schemas';
import { 
  MENTO_BROKER_ADDRESS, 
  CELO_TOKEN_ADDRESS, 
  CUSD_TOKEN_ADDRESS, 
  CEUR_TOKEN_ADDRESS,
  EXCHANGE_PROVIDER,
  EXCHANGE_IDS,
  SUPPORTED_TOKENS 
} from './constants';
import { 
  MentoSwapError, 
  InsufficientAllowanceError,
  InvalidTokenError,
  WrongNetworkError,
  InsufficientBalanceError
} from './errors';

// ABI for token interactions
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "spender",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "increaseAllowance",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ABI for Mento Broker interactions
const MENTO_BROKER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "exchangeProvider",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "exchangeId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountOutMin",
        "type": "uint256"
      }
    ],
    "name": "swapIn",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "exchangeProvider",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "exchangeId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      }
    ],
    "name": "getAmountOut",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * 💱 MentoSwapActionProvider provides actions for swapping CELO tokens to cUSD and cEUR
 * through the Mento Labs broker
 */
export class MentoSwapActionProvider extends ActionProvider<EvmWalletProvider> {
  constructor() {
    super("mento-swap", []);
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
   * 🔍 Get token addresses based on token symbols
   */
  private getTokenAddress(token: string): `0x${string}` {
    switch (token) {
      case 'CELO':
        return CELO_TOKEN_ADDRESS as `0x${string}`;
      case 'cUSD':
        return CUSD_TOKEN_ADDRESS as `0x${string}`;
      case 'cEUR':
        return CEUR_TOKEN_ADDRESS as `0x${string}`;
      default:
        throw new InvalidTokenError(token);
    }
  }

  /**
   * 🔄 Get exchange ID for the token pair
   */
  private getExchangeId(fromToken: string, toToken: string): `0x${string}` {
    if (fromToken === 'CELO' && toToken === 'cUSD') {
      return EXCHANGE_IDS.CELO_CUSD as `0x${string}`;
    } else if (fromToken === 'CELO' && toToken === 'cEUR') {
      return EXCHANGE_IDS.CELO_CEUR as `0x${string}`;
    } else {
      throw new Error(`Unsupported token pair: ${fromToken} to ${toToken}`);
    }
  }

  /**
   * 🔎 Check token allowance for the broker contract
   */
  private async checkAllowance(
    walletProvider: EvmWalletProvider,
    tokenAddress: `0x${string}`,
    walletAddress: `0x${string}`,
    amount: bigint
  ): Promise<boolean> {
    const allowance = await walletProvider.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [walletAddress, MENTO_BROKER_ADDRESS as `0x${string}`]
    }) as bigint;
    
    return allowance >= amount;
  }
  
  /**
   * 💰 Check if user has enough CELO balance
   */
  private async checkCeloBalance(
    walletProvider: EvmWalletProvider,
    amount: bigint
  ): Promise<void> {
    const address = await walletProvider.getAddress();
    const balance = await walletProvider.readContract({
      address: CELO_TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`]
    }) as bigint;

    if (balance < amount) {
      throw new InsufficientBalanceError(
        'CELO',
        formatEther(balance),
        formatEther(amount)
      );
    }
  }
  
  /**
   * ✅ Approve token spending by the broker contract
   */
  @CreateAction({
    name: "approve_token",
    description: "Approve CELO tokens to be spent by the Mento swap protocol",
    schema: SwapParamsSchema,
  })
  async approveToken(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof SwapParamsSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const { fromToken, amount } = args;
    
    if (fromToken !== 'CELO') {
      throw new Error("Currently only CELO token approvals are supported");
    }
    
    const fromTokenAddress = this.getTokenAddress(fromToken);
    const amountBigInt = parseEther(amount);
    const account = await walletProvider.getAddress();
    
    // Check if approval is needed
    const hasAllowance = await this.checkAllowance(
      walletProvider, 
      fromTokenAddress, 
      account as `0x${string}`, 
      amountBigInt
    );
    
    if (hasAllowance) {
      return `✅ ${fromToken} already approved for the Mento Broker`;
    }
    
    // Approve token
    const hash = await walletProvider.sendTransaction({
      to: fromTokenAddress,
      data: encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'increaseAllowance',
        args: [MENTO_BROKER_ADDRESS as `0x${string}`, amountBigInt]
      })
    });
    
    return `✅ Transaction Successful!\n\n🔓 Approved ${amount} ${fromToken} for Mento Broker\n🔗 Transaction: https://celoscan.io/tx/${hash}`;
  }
  
  /**
   * 📊 Get a quote for the swap
   */
  @CreateAction({
    name: "get_swap_quote",
    description: "Get a quote for swapping CELO to cUSD or cEUR",
    schema: SwapParamsSchema,
  })
  async getSwapQuote(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof SwapParamsSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const { fromToken, toToken, amount } = args;
    
    if (fromToken !== 'CELO') {
      throw new Error("Currently only CELO token swaps are supported");
    }
    
    if (toToken !== 'cUSD' && toToken !== 'cEUR') {
      throw new Error("Can only swap to cUSD or cEUR");
    }
    
    const fromTokenAddress = this.getTokenAddress(fromToken);
    const toTokenAddress = this.getTokenAddress(toToken);
    const exchangeId = this.getExchangeId(fromToken, toToken);
    const amountBigInt = parseEther(amount);
    
    // Get expected output amount
    const expectedOutput = await walletProvider.readContract({
      address: MENTO_BROKER_ADDRESS as `0x${string}`,
      abi: MENTO_BROKER_ABI,
      functionName: 'getAmountOut',
      args: [
        EXCHANGE_PROVIDER as `0x${string}`,
        exchangeId,
        fromTokenAddress,
        toTokenAddress,
        amountBigInt
      ]
    }) as bigint;
    
    // Format the output amount
    const formattedOutput = formatUnits(expectedOutput, 18);
    const exchangeRate = Number(formattedOutput) / Number(amount);
    
    return `📊 **Mento Swap Quote**\n\n💱 ${amount} ${fromToken === 'CELO' ? '🟡 CELO' : fromToken} ➡️ ${formattedOutput} ${toToken === 'cUSD' ? '💵 cUSD' : '💶 cEUR'}\n📈 Exchange Rate: 1 ${fromToken} = ${exchangeRate.toFixed(6)} ${toToken}\n\n⚠️ Rate may fluctuate slightly. Use slippage tolerance when executing swap.`;
  }
  
  /**
   * 💱 Execute the swap transaction
   */
  @CreateAction({
    name: "execute_swap",
    description: "Swap CELO tokens for cUSD or cEUR using Mento Protocol",
    schema: SwapParamsSchema,
  })
  async executeSwap(
    walletProvider: EvmWalletProvider,
    args: z.infer<typeof SwapParamsSchema>
  ): Promise<string> {
    await this.checkNetwork(walletProvider);
    
    const { fromToken, toToken, amount, slippageTolerance } = args;
    
    if (fromToken !== 'CELO') {
      throw new Error("Currently only CELO token swaps are supported");
    }
    
    if (toToken !== 'cUSD' && toToken !== 'cEUR') {
      throw new Error("Can only swap to cUSD or cEUR");
    }
    
    const fromTokenAddress = this.getTokenAddress(fromToken);
    const toTokenAddress = this.getTokenAddress(toToken);
    const exchangeId = this.getExchangeId(fromToken, toToken);
    const amountBigInt = parseEther(amount);
    const account = await walletProvider.getAddress();
    
    // Check balance
    await this.checkCeloBalance(walletProvider, amountBigInt);
    
    // Check allowance
    const hasAllowance = await this.checkAllowance(
      walletProvider, 
      fromTokenAddress, 
      account as `0x${string}`, 
      amountBigInt
    );
    
    if (!hasAllowance) {
      throw new InsufficientAllowanceError();
    }
    
    // Get expected output amount
    const expectedOutput = await walletProvider.readContract({
      address: MENTO_BROKER_ADDRESS as `0x${string}`,
      abi: MENTO_BROKER_ABI,
      functionName: 'getAmountOut',
      args: [
        EXCHANGE_PROVIDER as `0x${string}`,
        exchangeId,
        fromTokenAddress,
        toTokenAddress,
        amountBigInt
      ]
    }) as bigint;
    
    // Calculate minimum output based on slippage tolerance
    const slippageFactor = 1 - (slippageTolerance / 100);
    const minOutput = BigInt(Math.floor(Number(expectedOutput) * slippageFactor));
    
    // Execute the swap
    const hash = await walletProvider.sendTransaction({
      to: MENTO_BROKER_ADDRESS as `0x${string}`,
      data: encodeFunctionData({
        abi: MENTO_BROKER_ABI,
        functionName: 'swapIn',
        args: [
          EXCHANGE_PROVIDER as `0x${string}`,
          exchangeId,
          fromTokenAddress,
          toTokenAddress,
          amountBigInt,
          minOutput
        ]
      })
    });
    
    const formattedOutput = formatUnits(expectedOutput, 18);
    
    return `✅ **Swap Successful!**\n\n💱 Swapped ${amount} ${fromToken === 'CELO' ? '🟡 CELO' : fromToken} for ${formattedOutput} ${toToken === 'cUSD' ? '💵 cUSD' : '💶 cEUR'}\n🛡️ Slippage Protection: ${slippageTolerance}%\n🔗 Transaction: https://celoscan.io/tx/${hash}`;
  }

  supportsNetwork = (network: Network): boolean => {
    return network.networkId?.includes("celo") || network.chainId === "42220";
  };
}

/**
 * 🏭 Factory function for creating a MentoSwapActionProvider instance
 */
export const mentoSwapActionProvider = () => new MentoSwapActionProvider();