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
        "👛 **Wallet Check** - Check your wallet balances",
        "💎 **CELO Transfer** - Send CELO to another wallet",
        "💵 **Token Transfer** - Send tokens to another wallet",
        "🔑 **Get Address** - Show your wallet address"
      ];
      
      const aaveOptions = [
        "📊 **AAVE Dashboard** - View your lending/borrowing positions",
        "💸 **AAVE Lending** - Supply assets to AAVE for interest",
        "�� **AAVE Borrowing** - Borrow assets against your collateral",
        "🔄 **AAVE Withdraw** - Withdraw your supplied assets",
        "💹 **AAVE Repay** - Repay your borrowed assets"
      ];
      
      const ichiOptions = [
        "🌊 **ICHI Vaults** - Check your liquidity positions",
        "📋 **List Strategies** - See available ICHI vault strategies",
        "📥 **Deposit** - Add liquidity to ICHI vaults",
        "📤 **Withdraw** - Remove liquidity from ICHI vaults",
        "💰 **Collect Fees** - Harvest trading fees from your positions"
      ];
      
      const otherOptions = [
        "💱 **Swap Tokens** - Exchange one token for another",
        "✅ **Approve Token** - Authorize tokens for transactions",
        "❓ **Help** - Get assistance with commands",
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

🛠️ **OTHER COMMANDS:**
${otherOptions.join("\n")}

Type any command or ask me a question!
`;
      
      this.bot.sendMessage(chatId, menuText, { parse_mode: "Markdown" });
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
          await this.bot.sendMessage(chatId, response);
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
