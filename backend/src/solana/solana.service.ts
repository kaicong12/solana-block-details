import { Injectable, Logger, Inject } from '@nestjs/common';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class SolanaService {
  private readonly connection: Connection;
  private readonly logger = new Logger(SolanaService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    // Use mainnet-beta for production, devnet for development
    const rpcEndpoint =
      process.env.SOLANA_RPC_URL || clusterApiUrl('mainnet-beta');
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    this.logger.log(`Connected to Solana RPC: ${rpcEndpoint}`);
  }

  async getTransactionCount(
    blockNumber: number,
  ): Promise<{ count: number; cached: boolean }> {
    const cacheKey = `block:${blockNumber}`;
    try {
      // Check cache first
      const cachedResult = await this.cacheManager.get<number>(cacheKey);
      if (cachedResult !== undefined) {
        this.logger.log(`Cache hit for block ${blockNumber}`);
        return { count: cachedResult, cached: true };
      }

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

      // Cache the result for 24 hours (86400 seconds)
      await this.cacheManager.set(cacheKey, transactionCount, 86400000);

      return { count: transactionCount, cached: false };
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
