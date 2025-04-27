# 🧠 CeloMΔIND: AI-Powered DeFi Interface

## 📑 Table of Contents
- [Overview](#-overview)
- [Recent Improvements](#-recent-improvements)
- [Contract Information](#-contract-information)
- [Quick Start](#-quick-start)
- [Supported Protocols](#-supported-protocols)
- [Core Features](#-core-features)
- [Operating Modes](#-operating-modes)
- [API Server](#-api-server)
- [Web Interface](#-web-interface)
- [Technical Documentation](#-technical-documentation)
- [Security](#-security)
- [Resources](#-resources)

## 🌟 Overview

CeloMΔIND is an AI-powered DeFi interface that simplifies access to the Celo blockchain ecosystem through both web and Telegram interfaces. Our platform uses advanced AI and Agent Orchestration to provide:

- 📊 Personalized investment strategies based on user preferences
- ⚖️ Delta Neutral strategies for risk management
- 📈 Real-time market insights for informed decisions
- 🤖 Optional automated portfolio management with transparent execution

## 🚀 Recent Improvements

Based on feedback from the [Celo Proof-of-Ship](https://github.com/celo-org/Proof-of-Ship/blob/main/2/reports/projects/CeloMind.md) program, we've implemented several significant improvements:

### 🔐 Security Enhancements
- ✅ **Wallet Integration**: Browser extension wallet signing instead of storing private keys
- 🔑 **Transaction Handling**: Moved from `.env` private keys to secure browser wallet signatures
- 🔒 **Frontend Integration**: Improved connection between frontend and backend for secure transaction signing

### 📊 Code Quality Improvements
- 📝 **Modular Architecture**: Refactored complex functions into smaller, focused units
- 🧩 **Utility Modules**: Created dedicated modules for transaction handling, logging, and API interactions
- 🧹 **Constants Management**: Eliminated magic strings/numbers with centralized constant definitions
- 📏 **Code Standards**: Improved consistency in code style with standardized patterns

### 🔧 Technical Infrastructure
- 📋 **Centralized Logging**: Implemented structured logging system with multiple severity levels
- 🚦 **Rate Limiting**: Added API rate limiting to prevent abuse and DOS attacks
- ⚡ **Error Handling**: Enhanced error reporting with specific error types and better context
- 📚 **Documentation**: Added detailed comments and improved API documentation

### 🧪 Testing Framework
- ✅ **Unit Tests**: Implemented Jest-based testing infrastructure
- 🧪 **Test Coverage**: Added tests for core utilities and components
- 🔄 **CI Integration**: Set up testing as part of the development workflow

These improvements address the key recommendations from the Celo Proof-of-Ship report while maintaining compatibility with the existing frontend.

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
- A browser extension wallet (MetaMask, Rabby, etc.) connected to the Celo network

### Installation

```bash
# Clone both repositories
git clone https://github.com/0xOucan/celo-mind-dn.git
git clone https://github.com/0xOucan/celo-mind-web.git

# Use the launch script to start both services
cp celo-mind-dn/launch.sh ./
chmod +x launch.sh
./launch.sh
```

### Environment Setup

Required in your `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
WALLET_PRIVATE_KEY=your_wallet_private_key_here  # Only needed for CLI/Telegram modes
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here  # Optional, for Telegram mode
```

> **Security Update**: With the latest version, private keys are no longer required for the web interface. All transactions are now signed directly using your browser extension wallet, significantly improving security.

### Running Tests

The project now includes comprehensive unit tests:

```bash
# Run all tests
npm test

# Run tests with watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Test coverage targets have been set to ensure code quality:
- Functions: 70%
- Branches: 70%
- Lines: 70%
- Statements: 70%

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
- cUSD to CELO swaps
- cEUR to CELO swaps
- Real-time price quotes with slippage protection

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
- Support for all Mento swap pairs (CELO⟷cUSD, CELO⟷cEUR)

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

## 🔌 API Server

CeloMΔIND includes a built-in API server that exposes the AI agent functionality via REST endpoints, enabling integration with the web interface and other applications.

### API Architecture

The API server is implemented in `src/api-server.ts` and provides:

- **Express Backend**: Lightweight and fast Node.js server
- **CORS Support**: Cross-origin requests for frontend integration
- **Streaming Responses**: Real-time updates during AI processing
- **Error Handling**: Robust error reporting for debugging
- **Wallet Connection**: Secure connection of browser extension wallets
- **Transaction Management**: Pending transaction tracking and status updates
- **Agent Caching**: Efficient agent reuse with expiration for performance

### Technical Improvements

Recent technical improvements to the API server include:

- **Rate Limiting**: Protection against API abuse with configurable rate windows
- **Centralized Logging**: Structured logging with different severity levels
- **Transaction Management**: Dedicated utilities for better transaction reliability
- **Error Handling**: Enhanced error context and reporting
- **API Documentation**: Improved endpoint documentation
- **Code Structure**: Modular organization with better maintainability

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agent/chat` | POST | Process natural language commands through the AI agent |
| `/api/wallet/connect` | POST | Connect a browser extension wallet address |
| `/api/transactions/pending` | GET | Retrieve pending transactions that need wallet signatures |
| `/api/transactions/:txId/update` | POST | Update transaction status after signing |
| `/api/health` | GET | Health check endpoint for monitoring |

### Starting the API Server

```bash
# Start the API server
npm run api

# Or to run in production with PM2
npm run api:prod
```

### Integration with Frontend

The API server powers the [CeloMΔIND Web Interface](https://github.com/0xOucan/celo-mind-web), allowing users to interact with the AI agent through a modern web UI. The backend handles:

- Natural language processing of user commands
- Blockchain transaction creation
- Wallet integration
- Protocol interactions (AAVE, ICHI, Mento)

## 🌐 Web Interface

CeloMΔIND has a companion web interface available at [celo-mind-web](https://github.com/0xOucan/celo-mind-web) that provides:

- 💬 Interactive AI chat interface for DeFi commands
- 💰 Real-time wallet balance tracking with USD conversion
- 🌓 Light/Dark theme toggle with system preference detection
- 📱 Responsive design for desktop and mobile
- 🔒 Browser extension wallet integration (MetaMask, Rabby, etc.)
- 🔄 Transaction monitoring and signing directly from your wallet

### Connection Setup

To connect the web interface to the backend, use the included launch script:

```bash
# In the root directory
./launch.sh
```

This script:
1. Starts the API server on port 4000
2. Starts the frontend server on port 5173
3. Handles dependency installation
4. Monitors both processes

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
swap 0.5 cUSD to CELO
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
- 🔒 No private key storage for web users - browser wallets only
- ✅ Explicit transaction approval required through wallet
- 🛡️ Health factor monitoring for lending positions
- 🔍 Slippage protection for all operations
- 🚨 Comprehensive error handling
- 🔐 Network validation to ensure Celo network connection

### Enhanced Backend Security
- 🔑 Secure transaction management with dedicated transaction utilities
- 📋 Centralized logging system for monitoring and troubleshooting
- 🚦 API rate limiting to prevent abuse and denial-of-service attacks
- 🛑 Improved input validation across all endpoints
- 🧩 Modular error handling with context-rich errors
- 🔒 Transaction status management with verification

### Best Practices
- 📝 Regular security audits
- 🚫 No storage of sensitive data
- 📊 Real-time position monitoring
- ⚡ Rate limiting for API calls
- 🔄 Automatic session timeouts
- 🧪 Comprehensive unit testing for critical components

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

### Code Architecture Improvements
The project now features improved code architecture:

- **Utility Modules**: 
  - `transaction-utils.ts`: Centralized transaction handling
  - `logger.ts`: Structured logging system
  - `rate-limiter.ts`: API rate limiting

- **Testing**: 
  - Jest-based testing framework
  - Unit tests for core functionality
  - TypeScript-friendly test configuration

- **Error Handling**:
  - Specific error types for different scenarios
  - Context-rich error messages
  - Error logging for better troubleshooting

## 🔗 Resources

### Repository Links
- **Backend (CeloMΔIND DN)**: [https://github.com/0xOucan/celo-mind-dn](https://github.com/0xOucan/celo-mind-dn)
- **Frontend (CeloMΔIND Web)**: [https://github.com/0xOucan/celo-mind-web](https://github.com/0xOucan/celo-mind-web)

### Contact & Social
- **Twitter**: [@0xoucan](https://x.com/0xoucan)

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.