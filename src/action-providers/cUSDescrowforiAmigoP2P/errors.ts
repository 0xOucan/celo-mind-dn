/**
 * Base error class for cUSDescrowforiAmigoP2P action provider
 */
export class CUSDEscrowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CUSDEscrowError';
  }
}

/**
 * Error when a wrong network is detected
 */
export class WrongNetworkError extends CUSDEscrowError {
  constructor() {
    super('This action provider is configured for the Celo network. Please switch your network to Celo.');
    this.name = 'WrongNetworkError';
  }
}

/**
 * Error for insufficient balance
 */
export class InsufficientBalanceError extends CUSDEscrowError {
  constructor(balance: string, requiredAmount: string) {
    super(`Insufficient cUSD balance. You have ${balance} cUSD but need at least ${requiredAmount} cUSD.`);
    this.name = 'InsufficientBalanceError';
  }
}

/**
 * Error for invalid order amount
 */
export class InvalidOrderAmountError extends CUSDEscrowError {
  constructor(amount: string, minAmount: string, maxAmount: string) {
    super(`Invalid order amount: ${amount} cUSD. Amount must be between ${minAmount} and ${maxAmount} cUSD.`);
    this.name = 'InvalidOrderAmountError';
  }
}

/**
 * Error for transaction failure
 */
export class TransactionFailedError extends CUSDEscrowError {
  constructor(details?: string) {
    super(`Transaction failed. ${details || ''}`);
    this.name = 'TransactionFailedError';
  }
}

/**
 * Error for invalid QR code format
 */
export class InvalidQRCodeError extends CUSDEscrowError {
  constructor(details?: string) {
    super(`Invalid QR code format. ${details || 'The QR code could not be parsed.'}`);
    this.name = 'InvalidQRCodeError';
  }
}

/**
 * Error for expired QR code
 */
export class ExpiredQRCodeError extends CUSDEscrowError {
  constructor(expDate?: string) {
    super(`This QR code has expired${expDate ? ` on ${expDate}` : ''}.`);
    this.name = 'ExpiredQRCodeError';
  }
}

/**
 * Error for insufficient escrow balance
 */
export class InsufficientEscrowBalanceError extends CUSDEscrowError {
  constructor(balance: string, requiredAmount: string) {
    super(`Insufficient balance in escrow wallet. Available: ${balance} cUSD, Required: ${requiredAmount} cUSD.`);
    this.name = 'InsufficientEscrowBalanceError';
  }
} 