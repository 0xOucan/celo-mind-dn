import {
  AgentKit,
  walletActionProvider,
  erc20ActionProvider,
  ViemWalletProvider,
} from "@coinbase/agentkit";

import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as readline from "readline";
import { TelegramInterface } from "./telegram-interface";
import "reflect-metadata";
import { ichiVaultActionProvider } from "./action-providers/ichi-vault";
import { aaveActionProvider } from "./action-providers/aave";
import { createPublicClient, http } from 'viem';
import { celo } from 'viem/chains';
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient } from "viem";
import { balanceCheckerActionProvider } from "./action-providers/balance-checker";
import { mentoSwapActionProvider } from "./action-providers/mento-swap";
import { createPendingTransaction, pendingTransactions } from "./utils/transaction-utils";

dotenv.config();

// Interface type defined in transaction-utils module
import type { PendingTransaction } from './utils/transaction-utils';

/**
 * Validates that required environment variables are set
 */
function validateEnvironment(): void {
  const missingVars: string[] = [];

  const requiredVars = [
    "OPENAI_API_KEY",
    "WALLET_PRIVATE_KEY"
  ];
  
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }

  console.log("Environment validated successfully");
}

validateEnvironment();

/**
 * Select network interactively
 */
async function selectNetwork(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nSelect network:");
  console.log("1. Celo");

  const answer = await new Promise<string>((resolve) => {
    rl.question("Press 1 to continue with Celo: ", resolve);
  });
  
  rl.close();

  if (answer.trim() === "1") {
    return "celo";
  }
  
  console.log("Invalid choice, defaulting to Celo");
  return "celo";
}

/**
 * Initialize the agent with CDP Agentkit
 *
 * @param options Optional parameters for non-interactive initialization
 * @returns Agent executor and config
 */
export async function initializeAgent(options?: { network?: string, nonInteractive?: boolean, walletAddress?: string }) {
  try {
    console.log("Initializing agent...");

    // Select network either interactively or from provided option
    const selectedNetwork = options?.nonInteractive 
      ? (options.network || "celo") 
      : await selectNetwork();
      
    console.log(`Selected network: ${selectedNetwork}`);

    const selectedChain = celo;

    // Create wallet provider
    let walletProvider;
    let connectedWalletAddress = options?.walletAddress;
    
    // Always use the environment private key for now, but track if we have a frontend wallet connected
    let privateKey = process.env.WALLET_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("Wallet private key not found in environment variables");
    }

    // Ensure private key has 0x prefix
    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`;
    }

    // Validate private key format
    if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
      throw new Error("Invalid private key format. Must be a 0x-prefixed 32-byte hex string (64 characters after 0x)");
    }

    // Create Viem account and client
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    
    const transport = http(selectedChain.rpcUrls.default.http[0], {
      batch: true,
      fetchOptions: {},
      retryCount: 3,
      retryDelay: 100,
      timeout: 30_000,
    });

    const client = createWalletClient({
      account,
      chain: selectedChain,
      transport,
    });

    // Create Viem wallet provider with gas multipliers for better transaction handling
    walletProvider = new ViemWalletProvider(client, {
      gasLimitMultiplier: 1.2,
      feePerGasMultiplier: 1.1
    });
    
    // If we have a connected wallet from the frontend, use it for reference
    if (connectedWalletAddress) {
      console.log(`Connected wallet from frontend: ${connectedWalletAddress}`);
      
      // Make sure the address is valid
      if (!/^0x[0-9a-fA-F]{40}$/.test(connectedWalletAddress)) {
        console.warn(`Invalid wallet address format: ${connectedWalletAddress}. Using backend wallet instead.`);
      } else {
        console.log(`Patching wallet provider methods to use connected wallet: ${connectedWalletAddress}`);
        
        // 1. Patch nativeTransfer
        const origNativeTransfer = walletProvider.nativeTransfer.bind(walletProvider);
        walletProvider.nativeTransfer = async (to: `0x${string}`, value: string): Promise<`0x${string}`> => {
          console.log(`Intercepting nativeTransfer: to=${to}, value=${value}`);
          // Use the imported utility function
          const txId = createPendingTransaction(to, value, undefined, connectedWalletAddress);
          return `0x${txId.replace('tx-', '')}` as `0x${string}`;
        };
        
        // 2. Patch sendTransaction
        const origSendTx = walletProvider.sendTransaction.bind(walletProvider);
        walletProvider.sendTransaction = async (tx: any): Promise<`0x${string}`> => {
          console.log(`Intercepting sendTransaction:`, JSON.stringify(tx, null, 2));
          // Use the imported utility function
          const txId = createPendingTransaction(
            tx.to, 
            tx.value ? tx.value.toString() : '0',
            tx.data,
            connectedWalletAddress
          );
          return `0x${txId.replace('tx-', '')}` as `0x${string}`;
        };
        
        // 3. Patch getAddress
        const origGetAddress = walletProvider.getAddress.bind(walletProvider);
        walletProvider.getAddress = (): string => {
          console.log(`Returning connected wallet address: ${connectedWalletAddress}`);
          return connectedWalletAddress;
        };
        
        // 4. Patch readContract (still use original but log)
        const origReadContract = walletProvider.readContract.bind(walletProvider);
        walletProvider.readContract = async (params: any) => {
          console.log(`Reading contract for connected wallet ${connectedWalletAddress}`);
          return origReadContract(params);
        };
        
        console.log("Wallet provider methods patched successfully");
      }
    }

    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });

    console.log("LLM initialized");

    // Initialize AgentKit with action providers
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        // Keep these core providers
        walletActionProvider(),
        erc20ActionProvider(),
        
        // ACTIVE providers for CeloMΔIND
        ichiVaultActionProvider(),
        aaveActionProvider(),
        balanceCheckerActionProvider(),
        mentoSwapActionProvider(),
      ],
    });

    const tools = await getLangChainTools(agentkit);
    const memory = new MemorySaver();
    const agentConfig = {
      configurable: { thread_id: "CDP AgentKit Chatbot Example!" },
    };

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are CeloMΔIND, an AI-powered DeFi agent that helps users interact with the Celo blockchain ecosystem.
        Your goal is to provide personalized investment strategies, real-time market insights, and automated portfolio management.
        
        Current Network: ${selectedNetwork === "base-mainnet" ? "Base Mainnet" : 
                          selectedNetwork === "celo" ? "Celo" : 
                          selectedNetwork === "alfajores" ? "Celo Alfajores (Testnet)" :
                          selectedNetwork} 
                          
        Current User Wallet: ${connectedWalletAddress || "Using default wallet"}

        💰 Available Functionality 💰
        
        🔹 Token Balance Checker:
        - Check balances of all tokens in your wallet with accurate USD values
        - View specific token balances including CELO, cUSD, cEUR, and USDC
        - Get a detailed breakdown of your total portfolio value
        - Commands: 'check wallet balances', 'check token balance', 'check CELO balance'
        
        🔹 AAVE Lending Protocol on Celo:
        - Supply assets as collateral (CELO, USDC)
        - Borrow assets against your collateral
        - Repay loans and withdraw collateral
        - Monitor your health factor and account data
        - View comprehensive position dashboard
        - Commands: 'supply to aave', 'borrow from aave', 'repay aave loan', 'withdraw from aave', 'aave dashboard'
        
        🔹 ICHI Vault Strategies:
        - Deposit assets into yield-generating vaults
        - Withdraw funds from vaults
        - Check available vault strategies and stats
        - Commands: 'check vault strategies', 'deposit in vault', 'withdraw from vault'
        
        🔹 Mento Swap:
        - Swap between CELO, cUSD, and cEUR tokens
        - Swap CELO to stablecoins (cUSD/cEUR) and stablecoins to CELO
        - Get real-time price quotes
        - Execute swaps with slippage protection
        - Commands: 'swap CELO to cUSD', 'swap cUSD to CELO', 'get quote for swapping', 'approve tokens for swap'
        
        🔹 Basic Commands:
        - Check token allowances: 'check token allowance'
        - Get wallet address: 'get wallet address'
        
        ${connectedWalletAddress ? `
        ⚠️ Important Wallet Guidance:
        - The user has connected their wallet with address ${connectedWalletAddress}
        - For transactions like swaps, token approvals, or lending actions, inform the user that they will need to confirm these actions in their wallet
        - When a transaction is needed, mention that their wallet will prompt them to sign the transaction
        - Emphasize the importance of reviewing transaction details before signing
        ` : ''}

        ⚠️ Important Notes:
        - Always monitor your balances and health factors when using AAVE
        - ICHI Vaults may have deposit/withdrawal fees and minimum amounts
        - All USD values are approximations based on current market prices
        - Mento swaps may have slippage; use the slippageTolerance parameter

        First Steps:
        1) Greet the user and introduce yourself as CeloMΔIND.
        2) Check that the user is on the right network.
        3) Recommend checking their wallet balances.
        4) Inform them about AAVE, ICHI vault strategies, and Mento swaps that are available.
        5) Always explain briefly what each protocol does when first mentioned.
        
        ${connectedWalletAddress ? `
        If the user requests a swap or transaction:
        1) Always process their request directly
        2) Don't ask permission or suggest checking balances first unless there's a clear need
        3) Provide the exact output of the transaction after it's processed
        4) Don't send follow-up messages about checking transaction status
        ` : ''}
      `,
    });

    console.log("Agent initialization complete");
    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

/**
 * Run the agent autonomously with specified intervals
 */
async function runAutonomousMode(agent: any, config: any, interval = 10) {
  console.log("Starting autonomous mode...");

  while (true) {
    try {
      const thought =
        "Be creative and do something interesting on the blockchain. " +
        "Choose an action or set of actions and execute it that highlights your abilities.";

      const stream = await agent.stream(
        { messages: [new HumanMessage(thought)] },
        config,
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }

      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
}

/**
 * Run demo mode with predefined commands
 */
async function runDemoMode(agent: any, config: any) {
  console.log("\n🚀 Starting CeloMΔIND Demo Mode...\n");

  const demoCommands = [
    "check wallet balances",
    "approve 0.01 USDC for aave",
    "supply 0.01 USDC to aave",
    "borrow 0.01 CELO from aave",
    "aave dashboard",
    "repay 0.01 CELO to aave",
    "withdraw 0.01 USDC from aave",
    "approve 0.01 CELO for ichi vault",
    "deposit 0.01 CELO into ichi vault strategy: CELO-USDC",
    "deposit 0.01 CELO into ichi vault strategy: CELO-USDT",
    "check ichi vault balance",
    "approve 0.01 CELO for mento swap",
    "swap 0.01 CELO to cUSD with 0.5% slippage",
    "swap 0.01 CELO to cEUR with 0.5% slippage",
    "check wallet balances"
  ];

  for (const command of demoCommands) {
    try {
      console.log(`\n🤖 Executing: ${command}`);
      
      const stream = await agent.stream(
        { messages: [new HumanMessage(command)] },
        config
      );

      let finalResponse = "";
      for await (const chunk of stream) {
        if ("agent" in chunk) {
          finalResponse = chunk.agent.messages[0].content;
        }
      }
      
      console.log(finalResponse);
      // Add a small delay between commands
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error executing demo command '${command}':`, error);
      console.log(`⚠️ Error executing: ${command}\nContinuing with next command...`);
    }
  }

  console.log("\n✅ Demo completed! You've seen the main features of CeloMΔIND:");
  console.log("1. Wallet balance checking");
  console.log("2. AAVE lending and borrowing");
  console.log("3. ICHI vault strategies");
  console.log("4. Mento swaps");
  console.log("\nType 'menu' to explore more commands!");
}

/**
 * Run the agent interactively based on user input
 */
async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end or 'demo' to run demo mode.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      if (userInput.toLowerCase() === "demo") {
        await runDemoMode(agent, config);
        continue;
      }

      let finalResponse = "";
      const stream = await agent.stream(
        { messages: [new HumanMessage(userInput)] },
        config,
      );

      // Show a minimal loading indicator
      process.stdout.write("Processing...");
      
      for await (const chunk of stream) {
        // Clear the loading indicator
        process.stdout.write("\r" + " ".repeat(12) + "\r");
        
        if ("agent" in chunk) {
          finalResponse = chunk.agent.messages[0].content;
        }
      }
      
      console.log(finalResponse);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Run the Telegram interface mode
 */
async function runTelegramMode(agent: any, config: any) {
  console.log("Starting Telegram mode... Waiting for /start command");

  return new Promise<void>((resolve) => {
    const telegram = new TelegramInterface(agent, config, {
      onExit: () => {
        console.log("Exiting Telegram mode...");
        resolve();
      },
      onKill: () => {
        console.log("Kill command received. Shutting down...");
        process.exit(0);
      },
    });
  });
}

/**
 * Choose whether to run in autonomous, chat, or telegram mode
 */
async function chooseMode(): Promise<"chat" | "auto" | "telegram"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat      - Interactive chat mode");
    console.log("2. telegram  - Telegram bot mode");
    console.log("3. auto      - Autonomous action mode");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    rl.close();

    if (choice === "1" || choice === "chat") {
      return "chat";
    } else if (choice === "2" || choice === "telegram") {
      return "telegram";
    } else if (choice === "3" || choice === "auto") {
      return "auto";
    }
    console.log("Invalid choice. Please try again.");
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    console.log("Starting initialization...");
    const { agent, config } = await initializeAgent();
    console.log("Agent initialized successfully");

    while (true) {
      const mode = await chooseMode();
      console.log(`Selected mode: ${mode}`);

      if (mode === "chat") {
        await runChatMode(agent, config);
      } else if (mode === "telegram") {
        await runTelegramMode(agent, config);
      } else {
        await runAutonomousMode(agent, config);
      }

      // After any mode exits, we'll loop back to mode selection
      console.log("\nReturning to mode selection...");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Fatal error:", error.message);
    }
    process.exit(1);
  }
}

main();
