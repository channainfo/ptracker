import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { User } from '../users/entities/user.entity';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { PortfolioHolding } from '../portfolio/entities/portfolio-holding.entity';
import { Transaction } from '../portfolio/entities/transaction.entity';

// Load test environment
config({ path: join(__dirname, '../../.env.test') });

const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ptracker_test',
  entities: [User, Portfolio, PortfolioHolding, Transaction],
  synchronize: true,
  dropSchema: true,
  logging: false,
});

async function syncTestSchema() {
  console.log('🔄 Synchronizing test database schema...');
  
  try {
    await testDataSource.initialize();
    await testDataSource.synchronize(true);
    console.log('✅ Test database schema synchronized successfully');
  } catch (error) {
    console.error('❌ Error synchronizing test database schema:', error);
    throw error;
  } finally {
    if (testDataSource.isInitialized) {
      await testDataSource.destroy();
    }
  }
}

// Run if called directly
if (require.main === module) {
  syncTestSchema().catch(console.error);
}

export { syncTestSchema };