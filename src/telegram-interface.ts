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
        "Hello! I am CeloMΔIND, an AI-powered DeFi agent for Celo. Use /menu to see all available commands.\n\n" +
        "Use /exit to return to terminal or /kill to shut down the application.",
        { parse_mode: "Markdown" }
      );
    });

    // Handle /menu command
    this.bot.onText(/\/menu/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(
        chatId,
        `*🏦 AAVE Protocol Commands:*
\`supply 100 USDC to aave\` - Supply USDC as collateral
\`borrow 50 CELO from aave\` - Borrow CELO using your collateral
\`repay 25 CELO to aave\` - Repay borrowed CELO
\`withdraw 50 USDC from aave\` - Withdraw your supplied collateral
\`check aave health factor\` - View your position's health
\`get aave user data\` - Get detailed account information

*🏦 ICHI Vault Commands:*
\`list ichi vault strategies\` - View all available strategies
\`approve 5 CELO for ichi vault\` - Approve CELO for vault use
\`deposit 5 CELO into ichi vault strategy: CELO-USDT\` - Deposit into USDT strategy
\`withdraw all from ichi vault strategy: CELO-USDC\` - Withdraw from USDC strategy
\`check ichi vault balance for CELO-USDT\` - Check your position
\`calculate apr for ichi vault strategy: CELO-USDC\` - View estimated returns
\`collect fees from ichi vault\` - Collect earned trading fees

*💰 General Commands:*
\`check wallet balance\` - View your token balances
\`check token allowance\` - Check token approvals
\`/start\` - Start the bot
\`/menu\` - Show this menu
\`/exit\` - Return to terminal
\`/kill\` - Shutdown application

*Note:* All amounts should be specified in whole tokens (e.g., "5 CELO" is 5.0 CELO)`,
        { parse_mode: "Markdown" }
      );
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
              response += chunk.agent.messages[0].content;
            } else if ("tools" in chunk) {
              response += chunk.tools.messages[0].content;
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
}
