export class MentoSwapError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'MentoSwapError';
    }
  }
  
  export class InsufficientAllowanceError extends MentoSwapError {
    constructor() {
      super('Insufficient token allowance');
    }
  }
  
export class InvalidTokenError extends MentoSwapError {
  constructor(token: string) {
    super(`Invalid token: ${token}`);
  }
}

export class WrongNetworkError extends MentoSwapError {
  constructor() {
    super("This MentoSwap action provider is configured for Celo. Please switch your network to Celo.");
    this.name = 'WrongNetworkError';
  }
}

export class InsufficientBalanceError extends MentoSwapError {
  constructor(token: string, available: string, required: string) {
    super(`Insufficient ${token} balance. Available: ${available}, Required: ${required}`);
    this.name = 'InsufficientBalanceError';
  }
}
