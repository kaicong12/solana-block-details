import { Injectable, Logger } from '@nestjs/common';
import { Connection, clusterApiUrl } from '@solana/web3.js';

@Injectable()
export class SolanaService {
  private readonly connection: Connection;
  private readonly logger = new Logger(SolanaService.name);

  constructor() {
    // Use mainnet-beta for production, devnet for development
    const rpcEndpoint =
      process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    this.logger.log(`Connected to Solana RPC: ${rpcEndpoint}`);
  }

  async getTransactionCount(blockNumber: number): Promise<number> {
    try {
      this.logger.log(`Fetching block ${blockNumber}`);

      const block = await this.connection.getBlock(blockNumber, {
        maxSupportedTransactionVersion: 0,
      });

      if (!block) {
        throw new Error(`Block ${blockNumber} not found`);
      }

      const transactionCount = block.transactions?.length || 0;
      this.logger.log(
        `Block ${blockNumber} has ${transactionCount} transactions`,
      );

      return transactionCount;
    } catch (error) {
      this.logger.error(`Error fetching block ${blockNumber}:`, error.message);
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.connection.getVersion();
      return true;
    } catch (error) {
      this.logger.error('Connection check failed:', error.message);
      return false;
    }
  }

  getRpcEndpoint(): string {
    return this.connection.rpcEndpoint;
  }
}
