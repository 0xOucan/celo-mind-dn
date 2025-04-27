/**
 * Utility functions for handling blockchain transactions
 */

// Store pending transactions that can be accessed across modules
export interface PendingTransaction {
  id: string;
  to: string;
  value: string;
  data?: string;
  status: 'pending' | 'signed' | 'rejected' | 'completed';
  hash?: string;
  timestamp: number;
  metadata?: {
    source: string;
    walletAddress: string;
    requiresSignature: boolean;
    dataSize: number;
    dataType: string;
  };
}

// Global store for pending transactions - can be imported by other modules
export const pendingTransactions: PendingTransaction[] = [];

/**
 * Creates a pending transaction record and adds it to the global pendingTransactions array
 * 
 * @param to Target address
 * @param value Transaction value
 * @param data Optional transaction data
 * @param walletAddress Optional wallet address (for frontend wallet tracking)
 * @returns Transaction ID
 */
export const createPendingTransaction = (
  to: string, 
  value: string, 
  data?: string,
  walletAddress?: string
): string => {
  const txId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Ensure addresses are properly formatted
  const formattedTo = to.startsWith('0x') ? to : `0x${to}`;
  
  // Format transaction value to ensure it's valid
  let formattedValue = value || '0';
  if (formattedValue.startsWith('0x')) {
    // Value is already in hex, keep as is
  } else {
    // Try to parse as number and convert to BigInt string
    try {
      // If it has decimal points, it needs to be converted to wei
      if (formattedValue.includes('.')) {
        const valueInEther = parseFloat(formattedValue);
        // Convert to wei (1 ether = 10^18 wei)
        formattedValue = (BigInt(Math.floor(valueInEther * 10**18))).toString();
      } else {
        // Parse as BigInt directly if no decimal
        formattedValue = BigInt(formattedValue).toString();
      }
    } catch (error) {
      console.error('Error formatting transaction value:', error);
      formattedValue = '0';
    }
  }
  
  // Format the data field properly
  let formattedData = data || undefined;
  if (formattedData && !formattedData.startsWith('0x')) {
    formattedData = `0x${formattedData}`;
  }

  // Create transaction object
  const pendingTx: PendingTransaction = {
    id: txId,
    to: formattedTo,
    value: formattedValue,
    data: formattedData,
    status: 'pending',
    timestamp: Date.now(),
    // Add additional metadata for better tracking
    metadata: {
      source: walletAddress ? 'frontend-wallet' : 'backend-wallet',
      walletAddress: walletAddress || formattedTo,
      requiresSignature: !!walletAddress,
      dataSize: formattedData ? formattedData.length : 0,
      dataType: formattedData ? 
        (formattedData.startsWith('0x6') ? 'contract-call' : 
         formattedData.startsWith('0xa9') ? 'token-approval' : 'unknown') 
        : 'native-transfer'
    }
  };
  
  // Add to global pending transactions
  pendingTransactions.push(pendingTx);
  
  console.log(`✅ Transaction created with ID: ${txId}`);
  if (walletAddress) {
    console.log(`⏳ Waiting for wallet signature from ${walletAddress}...`);
  }
  
  return txId;
};

/**
 * Update the status of a pending transaction
 * 
 * @param txId Transaction ID
 * @param status New status
 * @param txHash Optional transaction hash (for completed transactions)
 * @returns Updated transaction or undefined if not found
 */
export function updateTransactionStatus(
  txId: string, 
  status: 'pending' | 'signed' | 'rejected' | 'completed',
  txHash?: string
): PendingTransaction | undefined {
  const index = pendingTransactions.findIndex(tx => tx.id === txId);
  if (index === -1) return undefined;
  
  pendingTransactions[index].status = status;
  if (txHash) {
    pendingTransactions[index].hash = txHash;
  }
  
  return pendingTransactions[index];
}

/**
 * Get all pending transactions
 * 
 * @param status Optional status filter
 * @returns Array of pending transactions
 */
export function getTransactions(status?: 'pending' | 'signed' | 'rejected' | 'completed'): PendingTransaction[] {
  if (status) {
    return pendingTransactions.filter(tx => tx.status === status);
  }
  return [...pendingTransactions];
}

/**
 * Get transaction by ID
 * 
 * @param txId Transaction ID
 * @returns Transaction or undefined if not found
 */
export function getTransactionById(txId: string): PendingTransaction | undefined {
  return pendingTransactions.find(tx => tx.id === txId);
}

/**
 * Format transaction value to ether (from wei)
 * 
 * @param value Transaction value in wei
 * @returns Formatted value in ether
 */
export function formatValueToEther(value: string): string {
  try {
    const valueBigInt = BigInt(value);
    return (Number(valueBigInt) / 10**18).toFixed(6);
  } catch (error) {
    console.error('Error formatting value to ether:', error);
    return '0';
  }
} 