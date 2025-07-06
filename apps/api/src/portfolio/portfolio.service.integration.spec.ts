import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PortfolioService } from './portfolio.service';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioHolding } from './entities/portfolio-holding.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { MarketDataService } from '../market-data/market-data.service';
import { TestHelpers } from '../test/test-helpers';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { AddHoldingDto } from './dto/add-holding.dto';
import { NotFoundException } from '@nestjs/common';
import { TransactionType } from './entities/transaction.entity';

describe('PortfolioService Integration Tests', () => {
  let service: PortfolioService;
  let module: TestingModule;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let portfolioRepository: Repository<Portfolio>;
  let holdingRepository: Repository<PortfolioHolding>;
  let transactionRepository: Repository<Transaction>;

  const mockMarketDataService = {
    getCurrentPrices: jest.fn(),
    getCoinPrice: jest.fn(),
  };

  beforeAll(async () => {
    module = await TestHelpers.createTestingModule([
      PortfolioService,
      {
        provide: MarketDataService,
        useValue: mockMarketDataService,
      },
    ]);

    service = module.get<PortfolioService>(PortfolioService);
    dataSource = module.get<DataSource>(DataSource);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    portfolioRepository = module.get<Repository<Portfolio>>(getRepositoryToken(Portfolio));
    holdingRepository = module.get<Repository<PortfolioHolding>>(getRepositoryToken(PortfolioHolding));
    transactionRepository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));

    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  beforeEach(async () => {
    await TestHelpers.cleanDatabase(dataSource);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new portfolio', async () => {
      // Arrange
      const mockUser = TestHelpers.createMockUser();
      const savedUser = await userRepository.save(userRepository.create(mockUser));

      const createPortfolioDto: CreatePortfolioDto = {
        name: 'My Test Portfolio',
        description: 'Test portfolio description',
      };

      // Act
      const result = await service.create(createPortfolioDto, savedUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createPortfolioDto.name);
      expect(result.description).toBe(createPortfolioDto.description);
      expect(result.userId).toBe(savedUser.id);

      // Verify in database
      const savedPortfolio = await portfolioRepository.findOne({
        where: { id: result.id },
        relations: ['user'],
      });
      expect(savedPortfolio).toBeDefined();
      expect(savedPortfolio.name).toBe(createPortfolioDto.name);
    });
  });

  describe('findAll', () => {
    it('should return all portfolios for a user', async () => {
      // Arrange
      const mockUser = TestHelpers.createMockUser();
      const savedUser = await userRepository.save(userRepository.create(mockUser));

      const portfolio1 = TestHelpers.createMockPortfolio(savedUser);
      const portfolio2 = { ...TestHelpers.createMockPortfolio(savedUser), name: 'Portfolio 2' };

      await portfolioRepository.save([
        portfolioRepository.create(portfolio1),
        portfolioRepository.create(portfolio2),
      ]);

      // Act
      const result = await service.findAll(savedUser.id);

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(p => p.name)).toContain('Test Portfolio');
      expect(result.map(p => p.name)).toContain('Portfolio 2');
    });

    it('should return empty array for user with no portfolios', async () => {
      // Arrange
      const mockUser = TestHelpers.createMockUser();
      const savedUser = await userRepository.save(userRepository.create(mockUser));

      // Act
      const result = await service.findAll(savedUser.id);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a portfolio with holdings', async () => {
      // Arrange
      const mockUser = TestHelpers.createMockUser();
      const savedUser = await userRepository.save(userRepository.create(mockUser));

      const mockPortfolio = TestHelpers.createMockPortfolio(savedUser);
      const savedPortfolio = await portfolioRepository.save(portfolioRepository.create(mockPortfolio));

      const mockHolding = TestHelpers.createMockHolding(savedPortfolio);
      await holdingRepository.save(holdingRepository.create(mockHolding));

      // Act
      const result = await service.findOne(savedPortfolio.id, savedUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(savedPortfolio.id);
      expect(result.holdings).toBeDefined();
      expect(result.holdings).toHaveLength(1);
      expect(result.holdings[0].symbol).toBe('BTC');
    });

    it('should throw NotFoundException for non-existent portfolio', async () => {
      // Arrange
      const mockUser = TestHelpers.createMockUser();
      const savedUser = await userRepository.save(userRepository.create(mockUser));

      // Act & Assert
      await expect(service.findOne('550e8400-e29b-41d4-a716-446655440000', savedUser.id))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for portfolio belonging to different user', async () => {
      // Arrange
      const user1 = await userRepository.save(userRepository.create({
        ...TestHelpers.createMockUser(),
        email: 'user1@example.com',
      }));

      const user2 = await userRepository.save(userRepository.create({
        ...TestHelpers.createMockUser(),
        email: 'user2@example.com',
      }));

      const portfolio = await portfolioRepository.save(portfolioRepository.create({
        ...TestHelpers.createMockPortfolio(user1),
      }));

      // Act & Assert
      await expect(service.findOne(portfolio.id, user2.id))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('addHolding', () => {
    it('should add a new holding to portfolio', async () => {
      // Arrange
      const mockUser = TestHelpers.createMockUser();
      const savedUser = await userRepository.save(userRepository.create(mockUser));

      const mockPortfolio = TestHelpers.createMockPortfolio(savedUser);
      const savedPortfolio = await portfolioRepository.save(portfolioRepository.create(mockPortfolio));

      const addHoldingDto: AddHoldingDto = {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 1.0,
        price: 45000,
        transactionType: TransactionType.BUY,
        executedAt: new Date().toISOString(),
      };

      // Act
      const result = await service.addHolding(savedPortfolio.id, addHoldingDto, savedUser.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.symbol).toBe('BTC');
      expect(parseFloat(result.quantity.toString())).toBe(1.0);
      expect(parseFloat(result.averagePrice.toString())).toBe(45000);

      // Verify transaction was created
      const transactions = await transactionRepository.find({
        where: { holding: { id: result.id } },
      });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].type).toBe(TransactionType.BUY);
      expect(parseFloat(transactions[0].quantity.toString())).toBe(1.0);
      expect(parseFloat(transactions[0].price.toString())).toBe(45000);
    });

    it('should update existing holding when adding same symbol', async () => {
      // Arrange
      const mockUser = TestHelpers.createMockUser();
      const savedUser = await userRepository.save(userRepository.create(mockUser));

      const mockPortfolio = TestHelpers.createMockPortfolio(savedUser);
      const savedPortfolio = await portfolioRepository.save(portfolioRepository.create(mockPortfolio));

      // Add first holding
      const firstHolding: AddHoldingDto = {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 1.0,
        price: 40000,
        transactionType: TransactionType.BUY,
        executedAt: new Date().toISOString(),
      };
      await service.addHolding(savedPortfolio.id, firstHolding, savedUser.id);

      // Add second holding of same symbol
      const secondHolding: AddHoldingDto = {
        symbol: 'BTC',
        name: 'Bitcoin',
        quantity: 0.5,
        price: 50000,
        transactionType: TransactionType.BUY,
        executedAt: new Date().toISOString(),
      };

      // Act
      const result = await service.addHolding(savedPortfolio.id, secondHolding, savedUser.id);

      // Assert
      expect(result.symbol).toBe('BTC');
      expect(result.quantity).toBe(1.5); // 1.0 + 0.5
      
      // Average price should be calculated: (1.0 * 40000 + 0.5 * 50000) / 1.5 = 43333.33
      expect(Math.round(result.averagePrice)).toBe(43333);

      // Verify both transactions exist
      const transactions = await transactionRepository.find({
        where: { holding: { id: result.id } },
      });
      expect(transactions).toHaveLength(2);
    });
  });


  describe('remove', () => {
    it('should delete a portfolio', async () => {
      // Arrange
      const mockUser = TestHelpers.createMockUser();
      const savedUser = await userRepository.save(userRepository.create(mockUser));

      const mockPortfolio = TestHelpers.createMockPortfolio(savedUser);
      const savedPortfolio = await portfolioRepository.save(portfolioRepository.create(mockPortfolio));

      // Act
      await service.remove(savedPortfolio.id, savedUser.id);

      // Assert - portfolio should be soft deleted (isActive = false)
      const deletedPortfolio = await portfolioRepository.findOne({
        where: { id: savedPortfolio.id },
        withDeleted: true, // Include soft-deleted records
      });
      expect(deletedPortfolio).toBeDefined();
      expect(deletedPortfolio.isActive).toBe(false);
    });

    it('should throw NotFoundException for non-existent portfolio', async () => {
      // Arrange
      const mockUser = TestHelpers.createMockUser();
      const savedUser = await userRepository.save(userRepository.create(mockUser));

      // Act & Assert
      await expect(service.remove('550e8400-e29b-41d4-a716-446655440000', savedUser.id))
        .rejects.toThrow(NotFoundException);
    });
  });
});