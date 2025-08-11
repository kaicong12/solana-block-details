import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SolanaService } from './solana.service';
import { Connection } from '@solana/web3.js';

jest.mock('@solana/web3.js', () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getBlock: jest.fn(),
    getVersion: jest.fn(),
    rpcEndpoint: 'https://api.devnet.solana.com',
  })),
  clusterApiUrl: jest.fn().mockReturnValue('https://api.devnet.solana.com'),
}));

describe('SolanaService', () => {
  let service: SolanaService;
  let mockConnection: jest.Mocked<Connection>;
  let mockCacheManager: any;

  beforeEach(async () => {
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      store: {
        keys: jest.fn(),
        client: {
          keys: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        SolanaService,
      ],
    }).compile();

    service = module.get<SolanaService>(SolanaService);
    mockConnection = (service as any).connection;
  });

  describe('getTransactionCount', () => {
    it('should return transaction count for valid block', async () => {
      const mockBlock = {
        transactions: [
          { signatures: ['sig1'] },
          { signatures: ['sig2'] },
          { signatures: ['sig3'] },
        ],
      };

      mockConnection.getBlock.mockResolvedValue(mockBlock);

      const result = await service.getTransactionCount(123456);

      expect(result['count']).toBe(3);
      expect(mockConnection.getBlock).toHaveBeenCalledWith(123456, {
        maxSupportedTransactionVersion: 0,
      });
    });

    it('should return 0 for block with no transactions', async () => {
      const mockBlock = {
        transactions: [],
      };

      mockConnection.getBlock.mockResolvedValue(mockBlock);

      const result = await service.getTransactionCount(123456);

      expect(result['count']).toBe(0);
    });

    it('should return 0 for block with undefined transactions', async () => {
      const mockBlock = {
        transactions: undefined,
      };

      mockConnection.getBlock.mockResolvedValue(mockBlock);

      const result = await service.getTransactionCount(123456);

      expect(result['count']).toBe(0);
    });

    it('should throw error when block is not found', async () => {
      mockConnection.getBlock.mockResolvedValue(null);

      await expect(service.getTransactionCount(123456)).rejects.toThrow(
        'Block 123456 not found',
      );
    });

    it('should throw error when RPC call fails', async () => {
      const rpcError = new Error('RPC connection failed');
      mockConnection.getBlock.mockRejectedValue(rpcError);

      await expect(service.getTransactionCount(123456)).rejects.toThrow(
        'RPC connection failed',
      );
    });
  });

  describe('checkConnection', () => {
    it('should return true when connection is healthy', async () => {
      mockConnection.getVersion.mockResolvedValue({
        'solana-core': '1.16.0',
        'feature-set': 123456,
      });

      const result = await service.checkConnection();

      expect(result).toBe(true);
      expect(mockConnection.getVersion).toHaveBeenCalled();
    });

    it('should return false when connection fails', async () => {
      mockConnection.getVersion.mockRejectedValue(
        new Error('Connection failed'),
      );

      const result = await service.checkConnection();

      expect(result).toBe(false);
    });
  });
});
