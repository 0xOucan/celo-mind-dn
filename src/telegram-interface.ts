import TelegramBot from "node-telegram-bot-api";
import { HumanMessage } from "@langchain/core/messages";

interface TelegramInterfaceOptions {
  onExit: () => void;
  onKill: () => void;
}

export class TelegramInterface {
  private bot: TelegramBot;
  private agent: any;
  private config: any;
  private options: TelegramInterfaceOptions;
  private isStarted: boolean = false;

  constructor(agent: any, config: any, options: TelegramInterfaceOptions) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN must be provided!");
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.agent = agent;
    this.config = config;
    this.options = options;

    this.setupHandlers();
    console.log("Telegram bot initialized. Waiting for /start command...");
  }

  private setupHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.isStarted = true;
      console.log(
        `Telegram session started by user ${msg.from?.username || msg.from?.id}`,
      );
      this.bot.sendMessage(
        chatId,
        "👋 Hello! I am CeloMΔIND, an AI-powered DeFi agent for Celo. 🤖\n\n" +
        "🚀 Use /menu to see all available commands.\n\n" +
        "⚙️ Use /exit to return to terminal or /kill to shut down the application.",
        { parse_mode: "Markdown" }
      );
    });

    // Handle /menu command
    this.bot.onText(/\/menu/, (msg) => {
      const chatId = msg.chat.id;
      
      const walletOptions = [
        "�� **Wallet Check** - `check wallet balances`",
        "💎 **CELO Transfer** - `send 0.1 CELO to 0x123...`",
        "💵 **Token Transfer** - `send 10 cUSD to 0x456...`",
        "🔑 **Get Address** - `get wallet address`"
      ];
      
      const aaveOptions = [
        "📊 **AAVE Dashboard** - `aave dashboard`",
        "💸 **AAVE Lending** - `supply 5 CELO to aave`",
        "🏦 **AAVE Borrowing** - `borrow 2 cUSD from aave`",
        "🔄 **AAVE Withdraw** - `withdraw 1 CELO from aave`",
        "💹 **AAVE Repay** - `repay 0.5 cUSD to aave`"
      ];
      
      const ichiOptions = [
        "🌊 **ICHI Vaults** - `check ichi vault balance`",
        "📋 **List Strategies** - `list ichi vault strategies`",
        "📥 **Deposit** - `deposit 5 CELO into ichi vault strategy: CELO-USDT`",
        "📤 **Withdraw** - `withdraw 2 CELO from ichi vault strategy: CELO-USDC`",
        "💰 **Collect Fees** - `collect fees from ichi vault`"
      ];
      
      const mentoOptions = [
        "💱 **Swap Quote** - `get quote for swapping 1 CELO to cUSD`",
        "🔓 **Approve Swap** - `approve 5 CELO for mento swap`",
        "💱 **Execute Swap** - `swap 1 CELO to cUSD with 0.5% slippage`",
        "📋 **Swap Help** - `explain how mento swap works`"
      ];
      
      const otherOptions = [
        "✅ **Approve Token** - `approve 10 CELO for contract 0x123...`",
        "❓ **Help** - `help me with AAVE lending`",
        "🚪 **/exit** - Return to terminal",
        "⚠️ **/kill** - Shut down application"
      ];
      
      const menuText = `
🤖 *CeloMΔIND Assistant Menu* 🤖

💼 **WALLET COMMANDS:**
${walletOptions.join("\n")}

📈 **AAVE PROTOCOL:**
${aaveOptions.join("\n")}

🏊 **ICHI VAULTS:**
${ichiOptions.join("\n")}

💱 **MENTO SWAP:**
${mentoOptions.join("\n")}

🛠️ **OTHER COMMANDS:**
${otherOptions.join("\n")}

Copy and paste any command or type your own question!
`;
      
      this.bot.sendMessage(chatId, menuText, { parse_mode: "Markdown" });
    });

    // Handle /help command for specific features
    this.bot.onText(/\/help_mento/, (msg) => {
      const chatId = msg.chat.id;
      
      const helpText = `
💱 *Mento Swap Commands* 💱

Use these commands to swap CELO for cUSD or cEUR using Mento Protocol:

1. Get a swap quote:
\`\`\`
get quote for swapping 1 CELO to cUSD
\`\`\`
\`\`\`
get quote for swapping 1.5 CELO to cEUR
\`\`\`

2. Approve CELO for swapping:
\`\`\`
approve 5 CELO for mento swap
\`\`\`

3. Execute the swap with slippage protection:
\`\`\`
swap 1 CELO to cUSD with 0.5% slippage
\`\`\`
\`\`\`
swap 1.5 CELO to cEUR with 1% slippage
\`\`\`

⚠️ Always check quotes before swapping to ensure fair rates!
`;
      
      this.bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
    });

    // Handle /help command for specific features
    this.bot.onText(/\/help_aave/, (msg) => {
      const chatId = msg.chat.id;
      
      const helpText = `
📈 *AAVE Protocol Commands* 📈

Use these commands to interact with AAVE lending protocol:

1. View your positions:
\`\`\`
aave dashboard
\`\`\`

2. Supply assets as collateral:
\`\`\`
supply 5 CELO to aave
\`\`\`
\`\`\`
supply 10 cUSD to aave
\`\`\`

3. Borrow against your collateral:
\`\`\`
borrow 2 cUSD from aave
\`\`\`
\`\`\`
borrow 1 CELO from aave
\`\`\`

4. Repay your loans:
\`\`\`
repay 1 cUSD to aave
\`\`\`
\`\`\`
repay all CELO to aave
\`\`\`

5. Withdraw your collateral:
\`\`\`
withdraw 2 CELO from aave
\`\`\`
\`\`\`
withdraw all cUSD from aave
\`\`\`

⚠️ Always monitor your health factor to avoid liquidation!
`;
      
      this.bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
    });

    // Handle /help command for specific features
    this.bot.onText(/\/help_ichi/, (msg) => {
      const chatId = msg.chat.id;
      
      const helpText = `
🏊 *ICHI Vault Commands* 🏊

Use these commands to interact with ICHI vaults:

1. View your positions:
\`\`\`
check ichi vault balance
\`\`\`

2. See available strategies:
\`\`\`
list ichi vault strategies
\`\`\`

3. Deposit into vaults:
\`\`\`
deposit 5 CELO into ichi vault strategy: CELO-USDT
\`\`\`
\`\`\`
deposit 10 CELO into ichi vault strategy: CELO-USDC
\`\`\`

4. Withdraw from vaults:
\`\`\`
withdraw 2 CELO from ichi vault strategy: CELO-USDT
\`\`\`
\`\`\`
withdraw all from ichi vault strategy: CELO-USDC
\`\`\`

5. Collect trading fees:
\`\`\`
collect fees from ichi vault
\`\`\`

⚠️ ICHI vaults may have minimum deposit amounts!
`;
      
      this.bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
    });

    // Handle /exit command
    this.bot.onText(/\/exit/, async (msg) => {
      const chatId = msg.chat.id;
      if (this.isStarted) {
        await this.bot.sendMessage(chatId, "Goodbye! Returning to terminal...");
        console.log("Telegram session ended. Returning to terminal...");
        this.bot.stopPolling();
        this.options.onExit();
      }
    });

    // Handle /kill command
    this.bot.onText(/\/kill/, async (msg) => {
      const chatId = msg.chat.id;
      if (this.isStarted) {
        await this.bot.sendMessage(chatId, "Shutting down the application...");
        console.log("Kill command received. Shutting down...");
        this.bot.stopPolling();
        this.options.onKill();
      }
    });

    // Handle /demo command
    this.bot.onText(/\/demo/, async (msg) => {
      const chatId = msg.chat.id;
      if (!this.isStarted) {
        await this.bot.sendMessage(chatId, "Please start the bot with /start first!");
        return;
      }

      await this.bot.sendMessage(chatId, "🚀 Starting CeloMΔIND Demo Mode...\nExecuting all actions automatically with 5-second intervals.");

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

      let currentStep = 1;
      const totalSteps = demoCommands.length;

      for (const command of demoCommands) {
        try {
          await this.bot.sendMessage(chatId, `🔄 Step ${currentStep}/${totalSteps}\n🤖 Executing: ${command}`);
          
          const stream = await this.agent.stream(
            { messages: [new HumanMessage(command)] },
            this.config
          );

          let response = "";
          for await (const chunk of stream) {
            if ("agent" in chunk) {
              response = chunk.agent.messages[0].content;
            }
          }

          await this.bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
          
          if (currentStep < totalSteps) {
            await this.bot.sendMessage(chatId, "⏳ Waiting 5 seconds before next action...");
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        } catch (error) {
          console.error(`Error executing demo command '${command}':`, error);
          await this.bot.sendMessage(
            chatId,
            `⚠️ Error executing: ${command}\nContinuing with next command...`
          );
          if (currentStep < totalSteps) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
        currentStep++;
      }

      await this.bot.sendMessage(
        chatId,
        "✅ Demo completed! You've seen the main features of CeloMΔIND:\n" +
        "1. Wallet balance checking\n" +
        "2. AAVE lending and borrowing\n" +
        "3. ICHI vault strategies\n" +
        "4. Mento swaps\n\n" +
        "Use /menu to explore more commands!"
      );
    });

    // Handle all other messages
    this.bot.on("message", async (msg) => {
      if (msg.text && !msg.text.startsWith("/") && this.isStarted) {
        const chatId = msg.chat.id;
        console.log(
          `Received message from ${msg.from?.username || msg.from?.id}: ${msg.text}`,
        );

        try {
          await this.bot.sendChatAction(chatId, "typing");

          const stream = await this.agent.stream(
            { messages: [new HumanMessage(msg.text)] },
            this.config,
          );

          let response = "";
          for await (const chunk of stream) {
            if ("agent" in chunk) {
              response = chunk.agent.messages[0].content;
            }
          }

          console.log(
            `Sending response to ${msg.from?.username || msg.from?.id}: ${response}`,
          );
          await this.bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
        } catch (error) {
          console.error("Error processing message:", error);
          await this.bot.sendMessage(
            chatId,
            "Sorry, I encountered an error processing your message.",
          );
        }
      }
    });
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&");
  }
}
