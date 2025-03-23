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
- Monitor positions
- Track and collect fees

### 🛡️ Safety Features
- Network validation before transactions
- Balance and allowance checks
- Detailed error messages
- Transaction confirmation waiting
- Custom error handling for common scenarios

## ⚠️ Error Handling

CeloMΔIND handles various error scenarios:
- 💸 Insufficient balances
- 🔒 Insufficient allowances
- 🌐 Network mismatches
- ❌ Failed transactions
- ⚠️ Invalid input validation

## 👨‍💻 Development

To add new features or modify existing ones:
1. Update the relevant action provider in `src/action-providers/`
2. Add new schemas if needed
3. Update the constants and error handlers
4. Test thoroughly on testnet first

## 🔧 Environment Setup

Required environment variables:

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

#### 📱 Telegram Commands
Start the Telegram bot with `/start` and use `/menu` to see all available commands, including:
- `/aave dashboard` - View your AAVE lending positions
- `/check wallet balances` - Check token balances
- `/ichi list strategies` - See available ICHI vault strategies
- `/menu` - Display all commands
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

You: check my ichi vaults
🧠 Processing...

## 🏦 Your ICHI Vault Positions 🏦

### 🏦 ICHI CELO-USDT Vault Position 💎

**Pool Assets**: USDT/CELO 🔄
- 🟡 CELO: 5.2 CELO ($3.43 USD)
- 💲 USDT: 3.45 USDT ($3.45 USD)

**Current Value**: $6.88 USD 💰
**APR**: ≈3-5% 📈 ⚡

---

### 🏦 ICHI CELO-USDC Vault Position 💎

**Pool Assets**: USDC/CELO 🔄
- 🟡 CELO: 8.1 CELO ($5.35 USD)
- 💵 USDC: 5.42 USDC ($5.42 USD)

**Current Value**: $10.77 USD 💰
**APR**: ≈3-5% 📈 ⚡

### 💡 Vault Management Options:
- 📥 Deposit more: `deposit 5 CELO to ichi vault strategy: CELO-USDT`
- 📤 Withdraw funds: `withdraw all from ichi vault strategy: CELO-USDC`
- 💰 Collect fees: `collect fees from ichi vault`

You: aave dashboard
🧠 Processing...

📊 AAVE Dashboard for 0x1234...5678 📊

💰 Net Worth: $35.50 USD

🏦 Your Collateral:
- 🟡 CELO: 45.5 CELO ($30.00 USD) at 1.05% APY
- 💵 USDC: 20.0 USDC ($20.00 USD) at 2.30% APY
Total Collateral: $50.00 USD

💸 Your Borrowings:
- 💲 USDT: 14.5 USDT ($14.50 USD) at 3.80% APY
Total Debt: $14.50 USD

📈 Health Factor: 2.75 ✅
(Safe zone: above 1.0)

🛡️ Liquidation at: $22.40 USD of borrowed value

💪 Borrowing Power:
- Used: 27.2%
- Available: 72.8% ($36.50 USD)

⚙️ Available Actions:
- 💰 Supply more collateral
- 🏦 Borrow more
- 💸 Repay debt
- 🔄 Withdraw collateral

You: repay 5 USDT to aave
🧠 Processing...

⏳ Preparing to repay 5 USDT to AAVE...
✅ Transaction confirmed!

Transaction successful:
- Repaid: 5 USDT
- Remaining debt: 9.5 USDT
- New health factor: 3.21 ✅
- Transaction hash: 0x123...abc
- Explorer link: https://explorer.celo.org/tx/0x123...abc

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

🛠️ OTHER COMMANDS:
15. 💱 Swap Tokens - Exchange one token for another
16. ✅ Approve Token - Authorize tokens for transactions
17. ❓ Help - Get assistance with commands
18. 🚪 Exit - Return to terminal
19. ⚠️ Kill - Shut down application

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

## 🔐 Security

- 🔒 Private keys are stored locally in .env
- ✅ All transactions require explicit approval
- 🛡️ Health factor monitoring for lending positions
- 🔍 Slippage protection for vault operations
- 🚨 Error handling for failed transactions
- 🌐 Network validation before transactions