# 🧠 MictlAI: AI-Powered Cross-Chain Bridge

## 📑 Table of Contents
- [Overview](#-overview)
- [Recent Improvements](#-recent-improvements)
- [Contract Information](#-contract-information)
- [Quick Start](#-quick-start)
- [Supported Networks](#-supported-networks)
- [Core Features](#-core-features)
- [Operating Modes](#-operating-modes)
- [API Server](#-api-server)
- [Web Interface](#-web-interface)
- [Technical Documentation](#-technical-documentation)
- [Security](#-security)
- [Resources](#-resources)

## 🌟 Overview

MictlAI is an AI-powered cross-chain bridge that connects the Base and Arbitrum networks through both web and Telegram interfaces. Our platform uses advanced AI and Agent Orchestration to provide:

- 🌉 Seamless cross-chain transfers between Base and Arbitrum
- ⚛️ Bidirectional atomic swaps for trustless token exchanges
- 📈 Real-time market insights for informed decisions
- 🤖 Intelligent AI assistance for navigating blockchain interoperability

## 🚀 Recent Improvements

We've implemented several significant improvements to our platform:

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

## 🔗 Contract Information

### 📍 Network Contracts
- **Base Network**: `0xabc123...` (XOC token contract)
- **Arbitrum Network**: `0xdef456...` (MXNB token contract)

#### 📊 Contract Statistics
- **Networks**: Base and Arbitrum
- **Transaction Types**: Cross-chain atomic swaps, token transfers
- **View on Explorers**: [BaseScan](https://basescan.org), [ArbiScan](https://arbiscan.io)

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- npm v7+
- A browser extension wallet (MetaMask, Rabby, etc.) connected to Base or Arbitrum networks

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

The project includes comprehensive unit tests:

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

## 🛠️ Supported Networks

MictlAI seamlessly connects multiple blockchain networks:

### Base
- Transfer XOC tokens to Arbitrum
- Receive MXNB tokens from Arbitrum
- Monitor transaction status across chains

### Arbitrum
- Transfer MXNB tokens to Base
- Receive XOC tokens from Base
- Verify cross-chain transactions

## 🔑 Core Features

### Cross-Chain Operations
- Initiate cross-chain transfers with atomic swap security
- Monitor transaction status across both networks
- Verify transaction completion with explorer links

### Token Operations
- Check token balances with USD conversion
- Transfer tokens between wallets on the same network
- Approve token spending for cross-chain operations

### Bridge Operations
- Initiate atomic swaps between networks
- Verify transaction completion on both sides
- Recover from failed transactions with safety mechanisms

### Safety Features
- Pre-transaction network validation
- Balance and allowance verification
- Detailed error messages
- Transaction confirmation monitoring
- Cross-chain verification for all operations

## 🖥️ Operating Modes

MictlAI offers three flexible operating modes:

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
- 🟡 **XOC**: 1.32 ($0.66)
- 💵 **MXNB**: 0.28 ($0.28)
...
```

### 🤖 Autonomous Mode
Bot operates independently, executing transactions at set intervals based on predefined strategies.

### 📱 Telegram Mode
Interface through Telegram messenger with convenient command structure:

```
/start - Initialize the bot
/menu - See all available commands
/help_bridge - Bridge operation commands
/help_base - Base network commands
/help_arbitrum - Arbitrum network commands
```

## 🔌 API Server

MictlAI includes a built-in API server that exposes the AI agent functionality via REST endpoints, enabling integration with the web interface and other applications.

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

The API server powers the [MictlAI Web Interface](https://github.com/0xOucan/celo-mind-web), allowing users to interact with the AI agent through a modern web UI. The backend handles:

- Natural language processing of user commands
- Blockchain transaction creation
- Wallet integration
- Cross-chain operations between Base and Arbitrum

## 🌐 Web Interface

MictlAI has a companion web interface available at [MictlAI Web](https://github.com/0xOucan/celo-mind-web) that provides:

- 💬 Interactive AI chat interface for cross-chain commands
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

#### Bridge Commands
```
transfer 5 XOC from Base to Arbitrum
transfer 10 MXNB from Arbitrum to Base
check status of transaction 0x123...
view balance on Base
view balance on Arbitrum
```

#### Base Network Commands
```
approve 5 XOC for bridge
check XOC balance on Base
get quote for bridging 1 XOC to Arbitrum
view pending transactions on Base
```

#### Arbitrum Network Commands
```
approve 5 MXNB for bridge
check MXNB balance on Arbitrum
get quote for bridging 1 MXNB to Base
view pending transactions on Arbitrum
```

### Error Handling
MictlAI handles various error scenarios with clear messaging:
- Insufficient balances
- Insufficient allowances
- Network mismatches
- Failed transactions
- Input validation failures
- Cross-chain verification failures

## 🔐 Security

### Smart Contract Security
- ✅ Proven contract track record
- 🔍 Continuous monitoring of all contract interactions
- 🛡️ Automated security checks before transactions

### User Security
- 🔒 No private key storage for web users - browser wallets only
- ✅ Explicit transaction approval required through wallet
- 🛡️ Cross-chain transaction verification
- 🔍 Clear transaction status monitoring
- 🚨 Comprehensive error handling
- 🔐 Network validation to ensure correct network connection

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
- 📊 Real-time transaction monitoring
- ⚡ Rate limiting for API calls
- 🔄 Automatic session timeouts
- 🧪 Comprehensive unit testing for critical components

## 📱 Interface Examples

### Portfolio Overview
```
### 💰 **Complete Portfolio Overview** 💰
**Address**: `0x9c77c6fafc1eb0821F1De12972Ef0199C97C6e45`  
**Total Portfolio Value**: **$3.47 USD**

#### 💵 **Token Balances on Base** 💼
- 🟡 **XOC**: 1.32 ($0.66)

#### 💵 **Token Balances on Arbitrum** 💼
- 💵 **MXNB**: 0.28 ($0.28)

#### 🌉 **Pending Bridge Transactions** 🏦
- **Base → Arbitrum**: Transferring 0.5 XOC (In Progress)
- **Arbitrum → Base**: Transferring 0.2 MXNB (Completed)
```

### Bridge Quote Example
```
📊 **Bridge Quote**

💱 1 XOC ➡️ 0.361129784661843345 MXNB
📈 Exchange Rate: 1 XOC = 0.361130 MXNB

⚠️ Rate may fluctuate slightly. Cross-chain transaction will take 5-15 minutes to complete.
```

## 👨‍💻 Development

To extend the platform:
1. Update relevant action providers in `src/action-providers/`
2. Add new schemas in `src/schemas/`
3. Update configurations in `src/config/`
4. Test thoroughly on testnets before production deployment

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
- **Backend (MictlAI DN)**: [https://github.com/0xOucan/celo-mind-dn](https://github.com/0xOucan/celo-mind-dn)
- **Frontend (MictlAI Web)**: [https://github.com/0xOucan/celo-mind-web](https://github.com/0xOucan/celo-mind-web)

### Contact & Social
- **Twitter**: [@0xoucan](https://x.com/0xoucan)

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.