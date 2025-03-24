# 🧠 CeloMΔIND: AI-Powered DeFi Interface


## 🌟 Overview

CeloMΔIND is an AI-powered DeFi web and telegram interface that simplifies access to the Celo blockchain ecosystem. Our platform uses AI and Agent Orchestration to provide users with:

- 📊 Personalized investment strategies
- ⚖️ Delta Neutral strategies
- 📈 Real-time market insights
- 🤖 Optional automated portfolio management

## 🚀 Mission

Our mission is to democratize access to DeFi by providing a simple, intuitive, and AI-powered interface that empowers users to make informed investment decisions. We aim to bridge the gap between traditional finance and DeFi, enabling a new generation of investors to participate in the Celo blockchain ecosystem. By leveraging AI Agents orchestration, we strive to create a more efficient, transparent, and inclusive financial system that benefits all users.

## 🔍 Problem

The current DeFi landscape is complex and overwhelming, with numerous platforms, protocols, and investment options available. This complexity creates a significant barrier to entry for new users, who often struggle to understand the intricacies of DeFi and make informed investment decisions. Additionally, existing DeFi platforms often require users to manually manage their portfolios, which can be time-consuming and prone to errors.

## 💡 Solution

CeloMΔIND addresses these challenges by providing a web and telegram interface to the Celo blockchain ecosystem. Our AI-powered platform offers:

- 🤖 **Personalized investment strategies**: Our AI agents analyze user preferences and market data to provide tailored investment recommendations
- 📊 **Real-time market insights**: Get instant market data and analysis for informed investment decisions
- ⚙️ **Automated portfolio management**: Eliminate manual intervention and reduce the risk of errors

## 🛠️ Supported Protocols

aave
ichi
mento



### 💰 Token Balance Checker

#### Core Features:
- Check balances of all tokens in your wallet
- View specific token balances with USD values
- Calculate total portfolio value
- Track token prices in real-time
- Visual representation with emojis and formatting

#### Supported Tokens:
- CELO (native token)
- USDC
- cUSD
- cEUR

#### Key Benefits:
- 💹 Real-time USD value conversion
- 📊 Portfolio overview with total valuation
- 🔍 Specific token balance queries
- 🚀 Fast and efficient balance retrieval
- 📱 Mobile-friendly output formatting

### 🏦 AAVE Lending Protocol on Celo

#### Core Features:
- Supply tokens as collateral (USDC, CELO)
- Borrow against your collateral
- Repay borrowed positions
- Withdraw collateral
- Monitor health factor
- View account data
- 📊 Interactive dashboard with real-time position data

#### Dashboard Features:
- Net worth calculation (supplies - borrows)
- Real-time health factor monitoring with risk indicators
- APY tracking for supplied and borrowed assets
- Borrow power utilization metrics
- Available assets to borrow with current rates
- Collateral usage visualization

#### Supported Tokens:
- CELO
- USDC
- cUSD
- cEUR

### 🏦 ICHI Vault Strategies on Celo

#### 1. CELO-USDT Strategy
- Liquidity provision for CELO-USDT pair
- Earn trading fees from AMM activity
- Lower impermanent loss risk

#### 2. CELO-USDC Strategy
- Liquidity provision for CELO-USDC pair
- Enhanced stability with USDC backing
- Optimized for USDC users

#### Common Features:
- ✅ Approve CELO tokens for the vault
- 📥 Deposit CELO into the vault to receive LP tokens
- 📤 Withdraw CELO and stablecoins from the vault
- 💼 Check vault balance and token values
- 📈 View estimated APR based on fees
- 💰 Collect trading fees

### 💱 Mento Swap Protocol

#### Core Features:
- Swap CELO for cUSD stablecoins
- Swap CELO for cEUR stablecoins
- Get real-time price quotes
- Execute swaps with slippage protection
- Approve tokens for swapping

#### Key Benefits:
- 🔒 Safe token approvals with clear confirmations
- 📊 Transparent price quotes before swapping
- 🛡️ Slippage protection to prevent unfavorable trades
- 💸 Competitive rates for stablecoin swaps
- 🔄 Seamless integration with Mento protocol
- 📱 Mobile-friendly output formatting with emojis

#### Supported Tokens:
- CELO (from)
- cUSD (to)
- cEUR (to)

### 📊 APR Calculation System (In Development)

Our APR calculation implements a multi-layered approach:

1. **Official Analytics Contract**
   - Primary source for 7-day APR data
   - Direct integration with ICHI Vault Analytics
   - Real-time fee collection tracking

2. **Trading Activity Analysis**
   - Volume-based calculations
   - Daily fee rate: 0.05% per trade
   - Volume:TVL ratio monitoring
   - 7-day rolling average

3. **Fallback Mechanism**
   - Dashboard-verified APR values
   - Historical performance metrics
   - Conservative estimation model

Current focus areas:
- Improving accuracy of volume predictions
- Enhancing fee collection tracking
- Implementing cross-strategy APR comparisons
- Developing historical APR trends analysis

## 🖥️ Operating Modes

The CeloMΔIND interface supports three operating modes:

1. **💬 Chat Mode**: Interactive command-line interface for direct user interaction
2. **🤖 Autonomous Mode**: Bot operates independently, executing transactions at set intervals
3. **📱 Telegram Mode**: Interface through Telegram messenger

## 🌐 Network Support

- Celo Mainnet

## 🔑 Core Features

### 💰 Token Operations
- Check token balances
- Transfer tokens
- Approve token spending

### 📊 Investment Operations
- Deposit to liquidity pools
- Withdraw from liquidity pools
- Supply to lending platforms
- Borrow from lending platforms 
- Repay loans
- Monitor positions
- Track and collect fees

### 💱 Swap Operations
- Get price quotes
- Swap CELO for stablecoins
- Configure slippage tolerance
- Approve tokens for swapping

### 🛡️ Safety Features
- Network validation before transactions
- Balance and allowance checks
- Detailed error messages
- Transaction confirmation waiting
- Custom error handling for common scenarios
- Slippage protection for swaps

## ⚠️ Error Handling

CeloMΔIND handles various error scenarios:
- 💸 Insufficient balances
- 🔒 Insufficient allowances
- 🌐 Network mismatches
- ❌ Failed transactions
- ⚠️ Invalid input validation
- 📉 Excessive slippage protection

## 👨‍💻 Development

To add new features or modify existing ones:
1. Update the relevant action provider in `src/action-providers/`
2. Add new schemas if needed
3. Update the constants and error handlers
4. Test thoroughly on testnet first

## 🔧 Environment Setup

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key for the AI agent
- `WALLET_PRIVATE_KEY`: Your Celo wallet private key
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token (optional, for Telegram mode)

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or higher
- npm v7 or higher
- A Celo wallet with CELO tokens

### 📦 Installation
1. Clone the repository:
```bash
git clone https://github.com/yourusername/celomind.git
cd celomind
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here  # Optional, for Telegram mode
```

4. Build the project:
```bash
npm run build
```

5. Start the application:
```bash
npm start
```

### 🎮 Usage

After starting the application, you'll be prompted to:
1. Select a network (Celo)
2. Choose an operating mode:
   - 💬 **Chat mode**: Interactive CLI
   - 📱 **Telegram mode**: Telegram bot interface
   - 🤖 **Auto mode**: Autonomous operation

#### 💬 Chat Mode Commands
Once in chat mode, you can use the following commands:
- `menu` - Show available commands
- `wallet check` - Check your wallet balance
- `aave dashboard` - View your AAVE positions
- `ichi vault` - Check ICHI vault strategies
- `swap 1 CELO to cUSD` - Use Mento to swap tokens

#### 📱 Telegram Commands
Start the Telegram bot with `/start` and use `/menu` to see all available commands. Additional specialized help commands include:
- `/help_aave` - Detailed AAVE lending commands
- `/help_ichi` - Detailed ICHI vaults commands  
- `/help_mento` - Detailed Mento swap commands
- `/exit` - Return to terminal
- `/kill` - Shutdown application

#### 🧠 Terminal Example
```
$ npm start

> celomind@1.0.0 start
> node dist/index.js

🤖 Welcome to CeloMΔIND - AI-Powered DeFi Interface 🤖

📊 Select network:
1. Celo
> 1

🔄 Initializing... Connected to Celo network!

🤖 Select operating mode:
1. 💬 Chat mode (Interactive CLI)
2. 📱 Telegram mode (Bot interface)
3. 🤖 Auto mode (Autonomous)
> 1

💬 Chat mode activated. Type 'menu' to see available commands.

You: check wallet portfolio
🧠 Processing...

### 💰 **Complete Portfolio Overview** 💰
**Address**: `0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45`  
**Total Portfolio Value**: **$3.47 USD**

#### 💵 **Token Balances** 💼
- 🟡 **CELO**: 1.32 ($0.66)
- 💵 **USDT**: 0.28 ($0.28)
- 💲 **cUSD**: 0.06 ($0.06)
- 💶 **cEUR**: 0.03 ($0.03)
- 💵 **USDC**: 0.01 ($0.01)

#### 🌊 **ICHI Vault Positions** 🏦
- **Total Value**: **$1.59 USD** ✨
  - **CELO-USDT Vault**: $0.84 USD 💎
  - **CELO-USDC Vault**: $0.75 USD 💎

#### 📊 **AAVE User Dashboard** 📈
- **Net Worth**: **$0.84 USD** 💹
- **Total Collateral**: $0.20 USD 🔐
- **Total Debt**: $0.01 USD 💸
- **Available to Borrow**: $0.15 USD 🏦
- **Current Borrow Power Used**: 6.67% 📉
- **Health Factor**: 41.73 🟢 (Your position is extremely safe!)

You: get quote for swapping 1 CELO to cUSD
🧠 Processing...

📊 **Mento Swap Quote**

💱 1 🟡 CELO ➡️ 0.361129784661843345 💵 cUSD
📈 Exchange Rate: 1 CELO = 0.361130 cUSD

⚠️ Rate may fluctuate slightly. Use slippage tolerance when executing swap.

You: swap 1 CELO to cUSD with 0.5% slippage
🧠 Processing...

✅ **Swap Successful!**

💱 Swapped 1 🟡 CELO for 0.361129784661843345 💵 cUSD
🛡️ Slippage Protection: 0.5%
🔗 Transaction: https://celoscan.io/tx/0x9d41be6353a70a92307e45eef165fdb4b46174afb4552d97567139de5e24bf43

You: menu
🧠 Processing...

🤖 CeloMΔIND Assistant Menu 🤖

💼 WALLET COMMANDS:
1. 👛 Wallet Check - Check your wallet balances
2. 💎 CELO Transfer - Send CELO to another wallet
3. 💵 Token Transfer - Send tokens to another wallet
4. 🔑 Get Address - Show your wallet address

📈 AAVE PROTOCOL:
5. 📊 AAVE Dashboard - View your lending/borrowing positions
6. 💸 AAVE Lending - Supply assets to AAVE for interest
7. 🏦 AAVE Borrowing - Borrow assets against your collateral
8. 🔄 AAVE Withdraw - Withdraw your supplied assets
9. 💹 AAVE Repay - Repay your borrowed assets

🏊 ICHI VAULTS:
10. 🌊 ICHI Vaults - Check your liquidity positions
11. 📋 List Strategies - See available ICHI vault strategies
12. 📥 Deposit - Add liquidity to ICHI vaults
13. 📤 Withdraw - Remove liquidity from ICHI vaults
14. 💰 Collect Fees - Harvest trading fees from your positions

💱 MENTO SWAP:
15. 💱 Swap Quote - Get price quote for swapping tokens
16. 🔓 Approve Swap - Authorize tokens for swapping
17. 💱 Execute Swap - Exchange CELO for stablecoins
18. 📋 Swap Help - Learn how Mento swaps work

🛠️ OTHER COMMANDS:
19. ✅ Approve Token - Authorize tokens for transactions
20. ❓ Help - Get assistance with commands
21. 🚪 Exit - Return to terminal
22. ⚠️ Kill - Shut down application

You: exit
🧠 Processing...

👋 Thank you for using CeloMΔIND! Exiting application...

#### 🌊 ICHI Vault Examples
```
approve 5 CELO for ichi vault
deposit 5 CELO into ichi vault strategy: CELO-USDT
withdraw all from ichi vault strategy: CELO-USDC
check ichi vault balance for CELO-USDT
```

#### 📊 AAVE Examples
```
supply 5 USDC to aave
borrow 1 CELO from aave
repay 0.5 CELO to aave
```

#### 💱 Mento Swap Examples
```
get quote for swapping 1 CELO to cUSD
approve 5 CELO for mento swap
swap 1 CELO to cUSD with 0.5% slippage
swap 2 CELO to cEUR with 1% slippage
```

## 🔐 Security

- 🔒 Private keys are stored locally in .env
- ✅ All transactions require explicit approval
- 🛡️ Health factor monitoring for lending positions
- 🔍 Slippage protection for vault operations
- 🚨 Error handling for failed transactions
- 🌐 Network validation before transactions