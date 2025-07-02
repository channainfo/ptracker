import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '../../.env.test') });

export const TestDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ptracker_test',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: true, // Auto-sync for tests
  dropSchema: true, // Clean database before each test run
  logging: false,
});