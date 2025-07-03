import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DatabaseTestModule } from './database-test.module';
import { User } from '../users/entities/user.entity';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { PortfolioHolding } from '../portfolio/entities/portfolio-holding.entity';
import { Transaction, TransactionType } from '../portfolio/entities/transaction.entity';

export class TestHelpers {
  static async createTestingModule(providers: any[] = []): Promise<TestingModule> {
    const module = await Test.createTestingModule({
      imports: [
        DatabaseTestModule,
        TypeOrmModule.forFeature([User, Portfolio, PortfolioHolding, Transaction]),
      ],
      providers,
    }).compile();

    return module;
  }

  static async cleanDatabase(dataSource: DataSource): Promise<void> {
    // Clean tables in the correct order to avoid foreign key constraint issues
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      // Delete in the correct order: child tables first, then parent tables
      await queryRunner.query('DELETE FROM transactions');
      await queryRunner.query('DELETE FROM portfolio_holdings'); 
      await queryRunner.query('DELETE FROM portfolios');
      await queryRunner.query('DELETE FROM users');
      
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  static createMockUser(overrides: Partial<User> = {}): Partial<User> {
    const timestamp = Date.now();
    return {
      email: `test-${timestamp}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      emailVerified: true,
      ...overrides,
    };
  }

  static createMockPortfolio(user: Partial<User>): Partial<Portfolio> {
    return {
      name: 'Test Portfolio',
      description: 'Test portfolio description',
      userId: user.id,
      baseCurrency: 'USD',
      isActive: true,
    };
  }

  static createMockHolding(portfolio: Partial<Portfolio>): Partial<PortfolioHolding> {
    return {
      symbol: 'BTC',
      name: 'Bitcoin',
      quantity: 1.5,
      averagePrice: 40000,
      portfolioId: portfolio.id,
    };
  }

  static createMockTransaction(holding: Partial<PortfolioHolding>): Partial<Transaction> {
    return {
      type: TransactionType.BUY,
      symbol: 'BTC',
      quantity: 1.5,
      price: 40000,
      total: 60000,
      fees: 100,
      holdingId: holding.id,
      executedAt: new Date(),
    };
  }
}