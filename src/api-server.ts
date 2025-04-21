// @ts-nocheck - Temporarily disable TypeScript checking for this file
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { HumanMessage } from "@langchain/core/messages";
import * as dotenv from "dotenv";
import { initializeAgent, pendingTransactions } from "./chatbot";

dotenv.config();

// Store connected wallet address globally for use across requests
let connectedWalletAddress: string | null = null;

// Cache agent instances by wallet address
const agentCache: Record<string, { agent: any, config: any, timestamp: number }> = {};
// Cache expiration time (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000;

// Store transaction notifications that need to be delivered to the client
const transactionNotifications: Record<string, { message: string, delivered: boolean }> = {};

/**
 * Get or create an agent for the current wallet address
 */
async function getOrCreateAgent(walletAddress: string | null) {
  // Create a cache key - either the wallet address or "default" for no wallet
  const cacheKey = walletAddress || "default";
  const now = Date.now();
  
  // Check if we have a cached agent and it's not expired
  if (
    agentCache[cacheKey] && 
    now - agentCache[cacheKey].timestamp < CACHE_EXPIRATION_MS
  ) {
    console.log(`Using cached agent for ${cacheKey}`);
    return {
      agent: agentCache[cacheKey].agent,
      config: agentCache[cacheKey].config
    };
  }
  
  // Initialize a new agent
  console.log(`Creating new agent for ${cacheKey}`);
  const { agent, config } = await initializeAgent({ 
    network: "celo", 
    nonInteractive: true,
    walletAddress: walletAddress
  });
  
  // Cache the new agent
  agentCache[cacheKey] = {
    agent,
    config,
    timestamp: now
  };
  
  return { agent, config };
}

/**
 * Create a transaction notification message based on transaction data
 */
function createTransactionNotification(tx: PendingTransaction): string {
  // Base URL for Celoscan (use environment variable or default to mainnet)
  const celoscanUrl = process.env.CELOSCAN_URL || 'https://celoscan.io';
  
  // Create a formatted link if we have a transaction hash - make sure it's a valid hash format
  const txLink = (tx.hash && tx.hash.startsWith('0x') && tx.hash.length === 66) ? 
    `${celoscanUrl}/tx/${tx.hash}` : 
    '';
  
  const { metadata } = tx;
  
  // Default message parts
  let action = 'processed';
  let asset = metadata?.token || 'tokens';
  let amount = metadata?.amount || '';
  let operation = '';
  
  // Build different messages based on transaction type
  if (metadata?.dataType === 'token-approval') {
    action = 'approved';
    // For approvals, mention the spender
    if (metadata.spender) {
      if (tx.status === 'pending') {
        return `⏳ IMPORTANT: Please check your browser extension wallet to approve ${amount} ${asset} for ${metadata.spender}. The transaction requires your signature.`;
      } else if (tx.status === 'submitted') {
        return `🔄 Your approval for ${amount} ${asset} is being processed. ${txLink ? `[View on Celoscan](${txLink})` : 'You can track it in the Transactions panel.'}`;
      } else if (tx.status === 'confirmed') {
        return `✅ ${amount} ${asset} has been approved for ${metadata.spender}. ${txLink ? `[View on Celoscan](${txLink})` : ''}`;
      } else if (tx.status === 'failed') {
        return `❌ Failed to approve ${amount} ${asset} for ${metadata.spender}. ${txLink ? `[View on Celoscan](${txLink})` : ''} Please try again or check your wallet for details.`;
      } else if (tx.status === 'rejected') {
        return `🚫 You rejected the approval for ${amount} ${asset}. No changes were made to your wallet.`;
      }
    }
  } else if (metadata?.dataType === 'token-swap' || metadata?.dataType === 'mento-operation') {
    action = 'swapped';
    // For swaps, include from/to tokens
    const fromToken = metadata.fromToken || asset;
    const toToken = metadata.toToken || 'another token';
    
    if (tx.status === 'pending') {
        return `⏳ ACTION REQUIRED: Please check your browser extension wallet to swap ${amount} ${fromToken} to ${toToken}. You must sign the transaction in your wallet.`;
    } else if (tx.status === 'submitted') {
      return `🔄 Your swap of ${amount} ${fromToken} to ${toToken} is being processed. ${txLink ? `[View on Celoscan](${txLink})` : 'You can track it in the Transactions panel.'}`;
    } else if (tx.status === 'confirmed') {
      return `✅ Successfully swapped ${amount} ${fromToken} to ${toToken}. ${txLink ? `[View on Celoscan](${txLink})` : ''}`;
    } else if (tx.status === 'failed') {
      return `❌ Failed to swap ${amount} ${fromToken} to ${toToken}. ${txLink ? `[View on Celoscan](${txLink})` : ''} Please try again or check your wallet for details.`;
    } else if (tx.status === 'rejected') {
      return `🚫 You rejected the swap of ${amount} ${fromToken} to ${toToken}. No changes were made to your wallet.`;
    }
  } else if (metadata?.dataType === 'aave-operation') {
    // For AAVE operations, use the specific operation type
    operation = metadata.operation || '';
    
    if (operation === 'supply') {
      if (tx.status === 'pending') {
        return `⏳ ACTION REQUIRED: Please check your browser extension wallet to supply ${amount} ${asset} to AAVE. The transaction is waiting for your signature.`;
      } else if (tx.status === 'submitted') {
        return `🔄 Your supply of ${amount} ${asset} to AAVE is being processed. ${txLink ? `[View on Celoscan](${txLink})` : 'You can track it in the Transactions panel.'}`;
      } else if (tx.status === 'confirmed') {
        return `✅ Successfully supplied ${amount} ${asset} to AAVE. ${txLink ? `[View on Celoscan](${txLink})` : ''}`;
      } else if (tx.status === 'failed') {
        return `❌ Failed to supply ${amount} ${asset} to AAVE. ${txLink ? `[View on Celoscan](${txLink})` : ''} Please try again or check your wallet for details.`;
      } else if (tx.status === 'rejected') {
        return `🚫 You rejected supplying ${amount} ${asset} to AAVE. No changes were made to your wallet.`;
      }
    } else if (operation === 'withdraw') {
      if (tx.status === 'pending') {
        return `⏳ Please check your browser extension wallet to withdraw ${amount} ${asset} from AAVE. The transaction is waiting for your signature.`;
      } else if (tx.status === 'submitted') {
        return `🔄 Your withdrawal of ${amount} ${asset} from AAVE is being processed. ${txLink ? `[View on Celoscan](${txLink})` : 'You can track it in the Transactions panel.'}`;
      } else if (tx.status === 'confirmed') {
        return `✅ Successfully withdrawn ${amount} ${asset} from AAVE. ${txLink ? `[View on Celoscan](${txLink})` : ''}`;
      } else if (tx.status === 'failed') {
        return `❌ Failed to withdraw ${amount} ${asset} from AAVE. ${txLink ? `[View on Celoscan](${txLink})` : ''} Please try again or check your wallet for details.`;
      } else if (tx.status === 'rejected') {
        return `🚫 You rejected withdrawing ${amount} ${asset} from AAVE. No changes were made to your wallet.`;
      }
    } else if (operation === 'borrow') {
      if (tx.status === 'pending') {
        return `⏳ Please check your browser extension wallet to borrow ${amount} ${asset} from AAVE. The transaction is waiting for your signature.`;
      } else if (tx.status === 'submitted') {
        return `🔄 Your borrow of ${amount} ${asset} from AAVE is being processed. ${txLink ? `[View on Celoscan](${txLink})` : 'You can track it in the Transactions panel.'}`;
      } else if (tx.status === 'confirmed') {
        return `✅ Successfully borrowed ${amount} ${asset} from AAVE. ${txLink ? `[View on Celoscan](${txLink})` : ''}`;
      } else if (tx.status === 'failed') {
        return `❌ Failed to borrow ${amount} ${asset} from AAVE. ${txLink ? `[View on Celoscan](${txLink})` : ''} Please try again or check your wallet for details.`;
      } else if (tx.status === 'rejected') {
        return `🚫 You rejected borrowing ${amount} ${asset} from AAVE. No changes were made to your wallet.`;
      }
    } else if (operation === 'repay') {
      if (tx.status === 'pending') {
        return `⏳ Please check your browser extension wallet to repay ${amount} ${asset} to AAVE. The transaction is waiting for your signature.`;
      } else if (tx.status === 'submitted') {
        return `🔄 Your repayment of ${amount} ${asset} to AAVE is being processed. ${txLink ? `[View on Celoscan](${txLink})` : 'You can track it in the Transactions panel.'}`;
      } else if (tx.status === 'confirmed') {
        return `✅ Successfully repaid ${amount} ${asset} to AAVE. ${txLink ? `[View on Celoscan](${txLink})` : ''}`;
      } else if (tx.status === 'failed') {
        return `❌ Failed to repay ${amount} ${asset} to AAVE. ${txLink ? `[View on Celoscan](${txLink})` : ''} Please try again or check your wallet for details.`;
      } else if (tx.status === 'rejected') {
        return `🚫 You rejected repaying ${amount} ${asset} to AAVE. No changes were made to your wallet.`;
      }
    }
  } else if (metadata?.dataType === 'native-transfer') {
    // For native transfers
    if (tx.status === 'pending') {
      return `⏳ Please check your browser extension wallet to send ${amount} CELO. The transaction is waiting for your signature.`;
    } else if (tx.status === 'submitted') {
      return `🔄 Your transfer of ${amount} CELO is being processed. ${txLink ? `[View on Celoscan](${txLink})` : 'You can track it in the Transactions panel.'}`;
    } else if (tx.status === 'confirmed') {
      return `✅ Successfully sent ${amount} CELO. ${txLink ? `[View on Celoscan](${txLink})` : ''}`;
    } else if (tx.status === 'failed') {
      return `❌ Failed to send ${amount} CELO. ${txLink ? `[View on Celoscan](${txLink})` : ''} Please try again or check your wallet for details.`;
    } else if (tx.status === 'rejected') {
      return `🚫 You rejected sending ${amount} CELO. No changes were made to your wallet.`;
    }
  }
  
  // Generic fallback messages for other statuses
  if (tx.status === 'pending') {
    return `⏳ ACTION REQUIRED: Please check your browser extension wallet. Transaction requires your signature now.`;
  } else if (tx.status === 'submitted') {
    return `🔄 Transaction submitted to blockchain. ${txLink ? `[View on Celoscan](${txLink})` : 'You can track it in the Transactions panel.'}`;
  } else if (tx.status === 'confirmed') {
    return `✅ Transaction confirmed. ${txLink ? `[View on Celoscan](${txLink})` : ''}`;
  } else if (tx.status === 'failed') {
    return `❌ Transaction failed. ${txLink ? `[View on Celoscan](${txLink})` : ''} Please try again or check your wallet for details.`;
  } else if (tx.status === 'rejected') {
    return `🚫 Transaction rejected by user. No changes were made to your wallet.`;
  }
  
  return `Transaction ${tx.id} ${tx.status}.`;
}

/**
 * Create an Express server to expose the AI agent as an API
 */
async function createServer() {
  try {
    // Initialize the agent in non-interactive mode, automatically selecting Celo
    console.log("🤖 Initializing AI agent for API...");
    const { agent: defaultAgent, config: defaultConfig } = await initializeAgent({ 
      network: "celo", 
      nonInteractive: true 
    });
    console.log("✅ Agent initialization complete");
    
    // Initialize the default agent cache
    agentCache["default"] = {
      agent: defaultAgent,
      config: defaultConfig,
      timestamp: Date.now()
    };

    // Create Express app
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());

    // Wallet connection endpoint
    app.post("/api/wallet/connect", async (req, res) => {
      try {
        const { walletAddress } = req.body;
        
        if (!walletAddress) {
          return res.status(400).json({ 
            success: false, 
            message: 'No wallet address provided' 
          });
        }
        
        // Validate wallet address format
        if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid wallet address format. Must be a 0x-prefixed 20-byte hex string (40 characters after 0x)' 
          });
        }
        
        console.log(`✅ Wallet connected: ${walletAddress}`);
        
        // Store the wallet address for future agent initializations
        connectedWalletAddress = walletAddress;
        
        // Pre-initialize an agent for this wallet address
        await getOrCreateAgent(walletAddress);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Wallet address received and stored for agent communication' 
        });
      } catch (error) {
        console.error('Error handling wallet connection:', error);
        return res.status(500).json({ 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown server error' 
        });
      }
    });

    // Transaction handling endpoints
    
    // Get pending transactions
    app.get("/api/transactions/pending", (req, res) => {
      try {
        // Filter transactions that are in pending state
        const pending = pendingTransactions.filter(tx => tx.status === 'pending');
        
        return res.json({
          success: true,
          transactions: pending
        });
      } catch (error) {
        console.error('Error fetching pending transactions:', error);
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown server error'
        });
      }
    });
    
    // Get all transactions
    app.get("/api/transactions/all", (req, res) => {
      try {
        return res.json({
          success: true,
          transactions: pendingTransactions
        });
      } catch (error) {
        console.error('Error fetching all transactions:', error);
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown server error'
        });
      }
    });
    
    // Remove a specific transaction
    app.delete("/api/transactions/:txId/remove", (req, res) => {
      try {
        const { txId } = req.params;
        
        // Find the transaction index
        const txIndex = pendingTransactions.findIndex(tx => tx.id === txId);
        
        if (txIndex === -1) {
          return res.status(404).json({
            success: false,
            message: `Transaction with ID ${txId} not found`
          });
        }
        
        // Check if the transaction is in a final state
        const tx = pendingTransactions[txIndex];
        if (tx.status !== 'confirmed' && tx.status !== 'failed' && tx.status !== 'rejected') {
          return res.status(400).json({
            success: false,
            message: `Cannot remove transaction ${txId} with status ${tx.status}. Only confirmed, failed, or rejected transactions can be removed.`
          });
        }
        
        // Remove the transaction
        pendingTransactions.splice(txIndex, 1);
        console.log(`🗑️ Removed transaction ${txId} with status ${tx.status}`);
        
        return res.json({
          success: true,
          message: `Transaction ${txId} removed successfully`
        });
      } catch (error) {
        console.error('Error removing transaction:', error);
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown server error'
        });
      }
    });
    
    // Get transaction notifications
    app.get("/api/notifications", (req, res) => {
      try {
        // Filter notifications that haven't been delivered yet
        const undeliveredNotifications = Object.entries(transactionNotifications)
          .filter(([_, notification]) => !notification.delivered)
          .map(([id, notification]) => ({
            id,
            message: notification.message
          }));
        
        // Mark these notifications as delivered
        undeliveredNotifications.forEach(notification => {
          if (transactionNotifications[notification.id]) {
            transactionNotifications[notification.id].delivered = true;
          }
        });
        
        return res.json({
          success: true,
          notifications: undeliveredNotifications
        });
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown server error'
        });
      }
    });
    
    // Update transaction status
    app.post("/api/transactions/:txId/update", (req, res) => {
      try {
        const { txId } = req.params;
        const { status, hash } = req.body;
        
        // Find the transaction
        const txIndex = pendingTransactions.findIndex(tx => tx.id === txId);
        
        if (txIndex === -1) {
          return res.status(404).json({
            success: false,
            message: `Transaction with ID ${txId} not found`
          });
        }
        
        // Store previous status for comparison
        const previousStatus = pendingTransactions[txIndex].status;
        
        // Update the transaction status
        pendingTransactions[txIndex].status = status;
        
        // Only update hash if it's valid (0x + 64 hex chars)
        if (hash && hash.startsWith('0x') && hash.length === 66) {
          pendingTransactions[txIndex].hash = hash;
          console.log(`Transaction ${txId} updated: status=${status}, hash=${hash}`);
          
          // Create a notification for the transaction
          const notification = createTransactionNotification(pendingTransactions[txIndex]);
          if (notification) {
            const notificationId = `${txId}-${status}-${Date.now()}`;
            transactionNotifications[notificationId] = {
              message: notification,
              delivered: false
            };
            console.log(`Added notification for transaction ${txId}: ${notification}`);
          }
          
          // For approvals that are confirmed, automatically handle follow-up operations
          if (status === 'confirmed' && previousStatus !== 'confirmed') {
            const tx = pendingTransactions[txIndex];
            
            // If this is a token approval transaction
            if (tx.metadata?.dataType === 'token-approval') {
              console.log(`✅ Token approval confirmed for transaction ${txId}. Processing follow-up operations.`);
              
              // Find any pending follow-up operations that are waiting for this approval
              const followUpTx = pendingTransactions.find(pendingTx => 
                pendingTx.status === 'approval-pending' && 
                pendingTx.metadata?.requiresApproval === true &&
                pendingTx.metadata?.approvalTxId === txId
              );
              
              if (followUpTx) {
                console.log(`Found follow-up transaction ${followUpTx.id} waiting for approval ${txId}`);
                
                // Update the status of the follow-up transaction to pending, making it ready for execution
                const followUpTxIndex = pendingTransactions.findIndex(t => t.id === followUpTx.id);
                if (followUpTxIndex !== -1) {
                  pendingTransactions[followUpTxIndex].status = 'pending';
                  pendingTransactions[followUpTxIndex].metadata.requiresApproval = false;
                  
                  console.log(`✅ Updated follow-up transaction ${followUpTx.id} status to pending - ready for execution`);
                  
                  // Create a notification for the now-pending transaction
                  const followUpNotification = `⏳ Now that approval is confirmed, please check your wallet to complete the ${followUpTx.metadata?.operation || 'transaction'}.`;
                  const followUpNotificationId = `${followUpTx.id}-ready-${Date.now()}`;
                  
                  transactionNotifications[followUpNotificationId] = {
                    message: followUpNotification,
                    delivered: false
                  };
                }
              } else {
                console.log(`No follow-up transaction found for approval ${txId}`);
              }
            }
          }
        } else if (hash) {
          console.warn(`Invalid transaction hash format provided: ${hash}`);
        } else {
          console.log(`Transaction ${txId} updated: status=${status}, hash=N/A`);
        }
        
        return res.json({
          success: true,
          transaction: pendingTransactions[txIndex]
        });
      } catch (error) {
        console.error(`Error updating transaction:`, error);
        return res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown server error'
        });
      }
    });

    // Define API routes
    app.post("/api/agent/chat", async (req, res) => {
      try {
        const { userInput } = req.body;
        
        if (!userInput || typeof userInput !== "string") {
          return res.status(400).json({ 
            error: "Invalid request. 'userInput' must be a non-empty string." 
          });
        }

        console.log(`🔍 Received query: "${userInput}"`);
        
        // Get agent for the current wallet address
        let { agent, config } = await getOrCreateAgent(connectedWalletAddress);
        
        let finalResponse = "";
        // Use streaming for real-time updates
        const stream = await agent.stream(
          { messages: [new HumanMessage(userInput)] },
          config
        );
        
        for await (const chunk of stream) {
          if ("agent" in chunk) {
            finalResponse = chunk.agent.messages[0].content;
          }
        }
        
        console.log(`✅ Response sent (${finalResponse.length} chars)`);
        return res.json({ response: finalResponse });
      } catch (err: any) {
        console.error("🚨 Error in /api/agent/chat:", err);
        return res.status(500).json({ error: err.message || "Unknown error occurred" });
      }
    });

    // Health check endpoint
    app.get("/api/health", (_, res) => {
      return res.json({ 
        status: "ok", 
        service: "CeloMΔIND API",
        walletConnected: connectedWalletAddress ? true : false
      });
    });

    // Start the server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 CeloMΔIND API server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Chat endpoint: http://localhost:${PORT}/api/agent/chat`);
      console.log(`🔗 Wallet connection: http://localhost:${PORT}/api/wallet/connect`);
      console.log(`🔗 Pending transactions: http://localhost:${PORT}/api/transactions/pending`);
      console.log(`🔗 Transaction notifications: http://localhost:${PORT}/api/notifications`);
    });
  } catch (error) {
    console.error("🚨 Failed to start API server:", error);
    process.exit(1);
  }
}

// Start the server
createServer(); 