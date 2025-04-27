// @ts-nocheck - Temporarily disable TypeScript checking for this file
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { HumanMessage } from "@langchain/core/messages";
import * as dotenv from "dotenv";
import { initializeAgent } from "./chatbot";
import { pendingTransactions, updateTransactionStatus, getTransactionById } from "./utils/transaction-utils";

dotenv.config();

// Store connected wallet address globally for use across requests
let connectedWalletAddress: string | null = null;

// Cache agent instances by wallet address
const agentCache: Record<string, { agent: any, config: any, timestamp: number }> = {};
// Cache expiration time (30 minutes)
const CACHE_EXPIRATION_MS = 30 * 60 * 1000;

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
    
    // Update transaction status
    app.post("/api/transactions/:txId/update", (req, res) => {
      try {
        const { txId } = req.params;
        const { status, hash } = req.body;
        
        // Use the utility function instead of directly manipulating the array
        const updatedTx = updateTransactionStatus(txId, status, hash);
        
        if (!updatedTx) {
          return res.status(404).json({
            success: false,
            message: `Transaction with ID ${txId} not found`
          });
        }
        
        console.log(`Transaction ${txId} updated: status=${status}, hash=${hash || 'N/A'}`);
        
        return res.json({
          success: true,
          transaction: updatedTx
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
    });
  } catch (error) {
    console.error("🚨 Failed to start API server:", error);
    process.exit(1);
  }
}

// Start the server
createServer(); 