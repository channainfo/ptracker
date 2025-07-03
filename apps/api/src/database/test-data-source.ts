import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '../../.env.test') });

// Configure connection based on environment
const connectionConfig: any = {
  type: 'postgres',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ptracker_test',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: true, // Auto-sync for tests
  dropSchema: true, // Clean database before each test run
  logging: false,
};

// Only add host/port if they are provided, otherwise use Unix socket
if (process.env.DB_HOST && process.env.DB_HOST !== '') {
  connectionConfig.host = process.env.DB_HOST;
  connectionConfig.port = parseInt(process.env.DB_PORT || '5432');
}

export const TestDataSource = new DataSource(connectionConfig);

// Add helper to ensure schema is synchronized
export const ensureTestSchema = async () => {
  if (!TestDataSource.isInitialized) {
    await TestDataSource.initialize();
  }
  await TestDataSource.synchronize(true);
};