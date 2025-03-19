// 🛑 Base error class for ICHI vault
export class IchiVaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IchiVaultError';
  }
}

// 💸 Error for insufficient balance
export class InsufficientBalanceError extends IchiVaultError {
  constructor(token: string, balance: string, required: string) {
    super(`Insufficient ${token} balance. You have ${balance} but need ${required}`);
    this.name = 'InsufficientBalanceError';
  }
}

// 🔒 Error for insufficient allowance
export class InsufficientAllowanceError extends IchiVaultError {
  constructor(token: string, allowance: string, required: string) {
    super(`Insufficient ${token} allowance. Current allowance is ${allowance} but need ${required}`);
    this.name = 'InsufficientAllowanceError';
  }
}

// 🌐 Error for wrong network
export class WrongNetworkError extends IchiVaultError {
  constructor() {
    super("ICHI vaults on this action provider are configured for Celo. Please switch your network to Celo.");
    this.name = 'WrongNetworkError';
  }
}

// ❌ Error for failed transactions
export class TransactionFailedError extends IchiVaultError {
  constructor(message: string) {
    super(`Transaction failed: ${message}`);
    this.name = 'TransactionFailedError';
  }
} 