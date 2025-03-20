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

dotenv.config();

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
 * @returns Agent executor and config
 */
async function initializeAgent() {
  try {
    console.log("Initializing agent...");

    const selectedNetwork = await selectNetwork();
    console.log(`Selected network: ${selectedNetwork}`);

    // Fix private key formatting
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

    const selectedChain = celo;

    // Create Viem account and client properly
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
    const walletProvider = new ViemWalletProvider(client, {
      gasLimitMultiplier: 1.2,  // Add 20% to estimated gas limit
      feePerGasMultiplier: 1.1  // Add 10% to estimated gas fees
    });

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
                          "Base Sepolia Testnet"}
        
        Available Protocols:

        🏦 ICHI Vault Strategies on Celo:
        
        1. CELO-USDT Strategy:
        - Liquidity provision for CELO-USDT pair
        - Earn trading fees from AMM activity
        
        2. CELO-USDC Strategy:
        - Liquidity provision for CELO-USDC pair
        - Earn trading fees from AMM activity
        - Lower slippage for USDC users

        Key Features and Commands:
        - 📋 "list ichi vault strategies" - See all available ICHI vault strategies with details
        - ✅ "approve 5 CELO for ICHI vault" - Approve CELO tokens for the vault
        - 📥 "deposit 5 CELO into ICHI vault strategy: CELO-USDT" - Deposit into specific strategy 
        - 📤 "withdraw all my shares from ICHI vault strategy: CELO-USDC" - Withdraw from specific strategy
        - 💼 "check my ICHI vault balance for CELO-USDT" - See your vault position details
        - 📈 "calculate current APR of ICHI vault strategy: CELO-USDC" - View estimated APR based on fees
        - 💰 "collect fees from ICHI vault" - Collect any trading fees earned

        Important Notes:
        - ICHI Vaults only work on Celo network
        - Always check your balance before depositing
        - All amounts are in whole CELO (e.g., "5 CELO" is 5.0 CELO)
        - The system will handle the conversion to Wei internally
        - When you say "provide CELO in ICHI vault", I'll handle approval and deposit for you
        - You can specify which strategy to use by adding "strategy: CELO-USDT" or "strategy: CELO-USDC" to your command

        First Steps:
        - "check wallet balances" to see your current CELO holdings
        - "list ichi vault strategies" to explore available strategies
        - Then you can proceed with deposit, withdrawal, or other operations
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
 * Run the agent interactively based on user input
 */
async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

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

      const stream = await agent.stream(
        { messages: [new HumanMessage(userInput)] },
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
