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
    return Test.createTestingModule({
      imports: [
        DatabaseTestModule,
        TypeOrmModule.forFeature([User, Portfolio, PortfolioHolding, Transaction]),
      ],
      providers,
    }).compile();
  }

  static async cleanDatabase(dataSource: DataSource): Promise<void> {
    // Clean tables in the correct order to avoid foreign key constraint issues
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      await queryRunner.connect();
      
      // Disable foreign key checks temporarily
      await queryRunner.query('SET session_replication_role = replica;');
      
      // Get all table names
      const tables = await queryRunner.query(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%' 
        AND tablename != 'information_schema'
      `);
      
      // Truncate all tables
      for (const table of tables) {
        await queryRunner.query(`TRUNCATE TABLE "${table.tablename}" CASCADE;`);
      }
      
      // Re-enable foreign key checks
      await queryRunner.query('SET session_replication_role = DEFAULT;');
    } finally {
      await queryRunner.release();
    }
  }

  static createMockUser(): Partial<User> {
    return {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      emailVerified: true,
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