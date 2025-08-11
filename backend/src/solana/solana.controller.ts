import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SolanaService } from './solana.service';

@Controller('solana')
export class SolanaController {
  constructor(private readonly solanaService: SolanaService) {}

  @Get('block/:blockNumber/transactions')
  async getTransactionCount(@Param('blockNumber') blockNumber: string) {
    try {
      const blockNum = parseInt(blockNumber, 10);

      if (isNaN(blockNum) || blockNum < 0) {
        throw new HttpException(
          'Invalid block number. Must be a positive integer.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const transactionCount =
        await this.solanaService.getTransactionCount(blockNum);

      return {
        blockNumber: blockNum,
        transactionCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Failed to fetch transaction count for block ${blockNumber}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  async healthCheck() {
    const isConnected = await this.solanaService.checkConnection();
    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      rpcEndpoint: this.solanaService.getRpcEndpoint(),
    };
  }
}
