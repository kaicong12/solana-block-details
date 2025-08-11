import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SolanaController } from './solana.controller';
import { SolanaService } from './solana.service';

describe('SolanaController', () => {
  let controller: SolanaController;
  let service: SolanaService;

  const mockSolanaService = {
    getTransactionCount: jest.fn(),
    checkConnection: jest.fn(),
    getRpcEndpoint: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolanaController],
      providers: [
        {
          provide: SolanaService,
          useValue: mockSolanaService,
        },
      ],
    }).compile();

    controller = module.get<SolanaController>(SolanaController);
    service = module.get<SolanaService>(SolanaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTransactionCount', () => {
    it('should return transaction count for valid block number', async () => {
      const mockTransactionCount = 42;
      mockSolanaService.getTransactionCount.mockResolvedValue(
        mockTransactionCount,
      );

      const result = await controller.getTransactionCount('123456');

      expect(result).toEqual({
        blockNumber: 123456,
        transactionCount: mockTransactionCount,
        timestamp: expect.any(String),
      });
      expect(mockSolanaService.getTransactionCount).toHaveBeenCalledWith(
        123456,
      );
    });

    it('should throw BadRequestException for invalid block number (non-numeric)', async () => {
      await expect(controller.getTransactionCount('invalid')).rejects.toThrow(
        new HttpException(
          'Invalid block number. Must be a positive integer.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockSolanaService.getTransactionCount).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for negative block number', async () => {
      await expect(controller.getTransactionCount('-123')).rejects.toThrow(
        new HttpException(
          'Invalid block number. Must be a positive integer.',
          HttpStatus.BAD_REQUEST,
        ),
      );

      expect(mockSolanaService.getTransactionCount).not.toHaveBeenCalled();
    });

    it('should handle zero as valid block number', async () => {
      const mockTransactionCount = 1;
      mockSolanaService.getTransactionCount.mockResolvedValue(
        mockTransactionCount,
      );

      const result = await controller.getTransactionCount('0');

      expect(result).toEqual({
        blockNumber: 0,
        transactionCount: mockTransactionCount,
        timestamp: expect.any(String),
      });
      expect(mockSolanaService.getTransactionCount).toHaveBeenCalledWith(0);
    });

    it('should throw InternalServerError when service throws non-HttpException', async () => {
      const serviceError = new Error('Service error');
      mockSolanaService.getTransactionCount.mockRejectedValue(serviceError);

      await expect(controller.getTransactionCount('123456')).rejects.toThrow(
        new HttpException(
          'Failed to fetch transaction count for block 123456: Service error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });

    it('should re-throw HttpException from service', async () => {
      const httpError = new HttpException(
        'Block not found',
        HttpStatus.NOT_FOUND,
      );
      mockSolanaService.getTransactionCount.mockRejectedValue(httpError);

      await expect(controller.getTransactionCount('123456')).rejects.toThrow(
        httpError,
      );
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when connection is good', async () => {
      mockSolanaService.checkConnection.mockResolvedValue(true);
      mockSolanaService.getRpcEndpoint.mockReturnValue(
        'https://api.mainnet-beta.solana.com',
      );

      const result = await controller.healthCheck();

      expect(result).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        rpcEndpoint: 'https://api.mainnet-beta.solana.com',
      });
      expect(mockSolanaService.checkConnection).toHaveBeenCalled();
      expect(mockSolanaService.getRpcEndpoint).toHaveBeenCalled();
    });

    it('should return unhealthy status when connection fails', async () => {
      mockSolanaService.checkConnection.mockResolvedValue(false);
      mockSolanaService.getRpcEndpoint.mockReturnValue(
        'https://api.mainnet-beta.solana.com',
      );

      const result = await controller.healthCheck();

      expect(result).toEqual({
        status: 'unhealthy',
        timestamp: expect.any(String),
        rpcEndpoint: 'https://api.mainnet-beta.solana.com',
      });
    });
  });
});
