const { DataSource } = require('typeorm');
const { config } = require('dotenv');
const { join } = require('path');

// Load test environment variables
config({ path: join(__dirname, '../../.env.test') });

// Configure connection for test migrations
const connectionConfig = {
  type: 'postgres',
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ptracker_test',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false, // Use migrations instead of sync
  dropSchema: false, // Don't drop schema automatically
  logging: process.env.NODE_ENV === 'development',
};

// Only add host/port if they are provided, otherwise use Unix socket
if (process.env.DB_HOST && process.env.DB_HOST !== '') {
  connectionConfig.host = process.env.DB_HOST;
  connectionConfig.port = parseInt(process.env.DB_PORT || '5432');
}

const TestDataSource = new DataSource(connectionConfig);

module.exports = { TestDataSource };