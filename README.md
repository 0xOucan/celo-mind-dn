# 🧠 CeloMΔIND: AI-Powered DeFi Interface

## 📑 Table of Contents
- [Overview](#-overview)
- [Contract Information](#-contract-information)
- [Quick Start](#-quick-start)
- [Supported Protocols](#-supported-protocols)
- [Core Features](#-core-features)
- [Operating Modes](#-operating-modes)
- [Technical Documentation](#-technical-documentation)
- [Security](#-security)

## 🌟 Overview

CeloMΔIND is an AI-powered DeFi interface that simplifies access to the Celo blockchain ecosystem through both web and Telegram interfaces. Our platform uses advanced AI and Agent Orchestration to provide:

- 📊 Personalized investment strategies based on user preferences
- ⚖️ Delta Neutral strategies for risk management
- 📈 Real-time market insights for informed decisions
- 🤖 Optional automated portfolio management with transparent execution

## 🔗 Contract Information

### 📍 Main Contract Address
`0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45`

#### 📊 Contract Statistics
- **Network**: Celo Mainnet
- **Transaction History**: Over 90% of transactions executed by CeloMΔIND AI agent
- **View on Explorer**: [Celoscan](https://celoscan.io/address/0x9c77c6fafc1eb0821f1de12972ef0199c97c6e45)

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm v7+
- A Celo wallet with CELO tokens

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/celomind.git
cd celomind

# Install dependencies
npm install

# Create environment file (copy from example)
cp .env.example .env
# Edit .env and add your keys
# Required: OPENAI_API_KEY and WALLET_PRIVATE_KEY

# Build the project
npm run build

# Start the application
npm start
```

### Environment Setup

Required in your `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here  # Optional, for Telegram mode
```

## 🛠️ Supported Protocols

CeloMΔIND seamlessly integrates with major Celo DeFi protocols:

### AAVE
Lending/borrowing platform with full support for:
- Supply assets as collateral
- Borrow against your collateral
- Repay loans
- Withdraw supplied assets
- Monitor health factor

### ICHI
Vault strategies platform supporting:
- CELO-USDT Strategy
- CELO-USDC Strategy
- Liquidity provision and fee collection

### Mento
Stablecoin exchange supporting:
- CELO to cUSD swaps
- CELO to cEUR swaps
- Real-time price quotes

## 🔑 Core Features

### Token Operations
- Check token balances with USD conversion
- Transfer tokens between wallets
- Approve token spending for protocols

### Investment Operations
- Deposit to liquidity pools with gas optimization
- Withdraw from liquidity pools
- Supply/borrow on lending platforms
- Repay loans with minimal slippage
- Real-time position monitoring

### Swap Operations
- Price quotes with market data
- Execute swaps with slippage protection
- Configurable slippage tolerance

### Safety Features
- Pre-transaction network validation
- Balance and allowance verification
- Detailed error messages
- Transaction confirmation monitoring
- Slippage protection for all operations

## 🖥️ Operating Modes

CeloMΔIND offers three flexible operating modes:

### 💬 Chat Mode
Interactive command-line interface for direct user interaction with natural language inputs.

```bash
# Example chat session
You: check wallet portfolio
🧠 Processing...

### 💰 **Complete Portfolio Overview** 💰
**Address**: `0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45`  
**Total Portfolio Value**: **$3.47 USD**

#### 💵 **Token Balances** 💼
- 🟡 **CELO**: 1.32 ($0.66)
- 💵 **USDT**: 0.28 ($0.28)
...
```

### 🤖 Autonomous Mode
Bot operates independently, executing transactions at set intervals based on predefined strategies.

### 📱 Telegram Mode
Interface through Telegram messenger with convenient command structure:

```
/start - Initialize the bot
/menu - See all available commands
/help_aave - AAVE lending commands
/help_ichi - ICHI vaults commands
/help_mento - Mento swap commands
```

## 📚 Technical Documentation

### Protocol Examples

#### AAVE Commands
```
supply 5 USDC to aave
borrow 1 CELO from aave
repay 0.5 CELO to aave
aave dashboard
```

#### ICHI Vault Commands
```
approve 5 CELO for ichi vault
deposit 5 CELO into ichi vault strategy: CELO-USDT
withdraw all from ichi vault strategy: CELO-USDC
check ichi vault balance for CELO-USDT
```

#### Mento Swap Commands
```
get quote for swapping 1 CELO to cUSD
approve 5 CELO for mento swap
swap 1 CELO to cUSD with 0.5% slippage
swap 2 CELO to cEUR with 1% slippage
```

### Error Handling
CeloMΔIND handles various error scenarios with clear messaging:
- Insufficient balances
- Insufficient allowances
- Network mismatches
- Failed transactions
- Input validation failures
- Slippage protection alerts

## 🔐 Security

### Smart Contract Security
- ✅ Proven main contract track record
- 🔍 Continuous monitoring of all contract interactions
- 🛡️ Automated security checks before transactions

### User Security
- 🔒 Private keys stored locally (.env only)
- ✅ Explicit transaction approval required
- 🛡️ Health factor monitoring for lending positions
- 🔍 Slippage protection for all operations
- 🚨 Comprehensive error handling

### Best Practices
- 📝 Regular security audits
- 🚫 No storage of sensitive data
- 📊 Real-time position monitoring
- ⚡ Rate limiting for API calls
- 🔄 Automatic session timeouts

## 📱 Interface Examples

### Portfolio Overview
```
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
```

### Swap Example
```
📊 **Mento Swap Quote**

💱 1 🟡 CELO ➡️ 0.361129784661843345 💵 cUSD
📈 Exchange Rate: 1 CELO = 0.361130 cUSD

⚠️ Rate may fluctuate slightly. Use slippage tolerance when executing swap.
```

## 👨‍💻 Development

To extend the platform:
1. Update relevant action providers in `src/action-providers/`
2. Add new schemas in `src/schemas/`
3. Update configurations in `src/config/`
4. Test thoroughly on testnet before production deployment

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.