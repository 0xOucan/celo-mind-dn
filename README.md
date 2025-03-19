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

### 🏦 ICHI Vault on Celo
- Liquidity provision for CELO-USDT pair
- Earn trading fees from AMM activity
- Features:
  - ✅ Approve CELO tokens for the vault
  - 📥 Deposit CELO into the vault to receive LP tokens
  - 📤 Withdraw CELO and USDT from the vault
  - 💼 Check vault balance and token values
  - 📈 View estimated APR based on fees
  - 💰 Collect trading fees


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
```
OPENAI_API_KEY=your_openai_api_key_here
NETWORK_ID=your_network_id_here
NETWORK_ID_2=your_secondary_network_id_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here
```

## 📜 License

MIT
