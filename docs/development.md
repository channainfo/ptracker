# Development Setup Guide

## Prerequisites

### Required Software
- **Node.js**: v18+ (LTS recommended)
- **npm**: v8+ or **yarn**: v1.22+
- **PostgreSQL**: v14+
- **Redis**: v6+
- **Docker**: v20+ (optional but recommended)
- **Git**: Latest version

### Development Tools
- **VS Code** with recommended extensions:
  - ESLint
  - Prettier
  - TypeScript
  - React/React Native snippets
  - GitLens
  - Thunder Client (API testing)

## Project Structure

```
cryptotracker/
├── apps/
│   ├── web/                 # React web application
│   ├── mobile/              # React Native mobile app
│   ├── telegram/            # Telegram Web App
│   └── api/                 # Node.js backend API
├── packages/
│   ├── shared/              # Shared utilities and types
│   ├── ui/                  # Shared UI components
│   └── database/            # Database schemas and migrations
├── docs/                    # Documentation
├── scripts/                 # Build and deployment scripts
├── docker/                  # Docker configurations
├── .github/                 # GitHub Actions workflows
├── package.json             # Root package.json (workspace config)
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment variables template
└── README.md               # Project overview
```

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/cryptotracker.git
cd cryptotracker

# Install dependencies
npm install

# Or with yarn
yarn install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/cryptotracker
REDIS_URL=redis://localhost:6379

# API Keys
COINGECKO_API_KEY=your_coingecko_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_token_secret

# External Services
SENDGRID_API_KEY=your_sendgrid_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# AWS (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name

# Development
NODE_ENV=development
PORT=3000
API_PORT=3001
```

### 3. Database Setup

#### Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis containers
docker-compose up -d postgres redis

# Wait for containers to be ready
npm run db:wait
```

#### Manual Installation

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Install Redis (macOS)
brew install redis
brew services start redis

# Create database
createdb cryptotracker
```

### 4. Database Migration

```bash
# Run database migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

## Development Workflow

### Starting Development Servers

```bash
# Start all services in development mode
npm run dev

# Or start individual services
npm run dev:api      # Backend API server
npm run dev:web      # React web app
npm run dev:mobile   # React Native mobile app
npm run dev:telegram # Telegram Web App
```

### Available Scripts

```bash
# Development
npm run dev                 # Start all development servers
npm run dev:api            # Start API server only
npm run dev:web            # Start web app only
npm run dev:mobile         # Start mobile app only

# Building
npm run build              # Build all applications
npm run build:api          # Build API server
npm run build:web          # Build web application
npm run build:mobile       # Build mobile application

# Testing
npm test                   # Run all tests
npm run test:unit          # Run unit tests
npm run test:integration   # Run integration tests
npm run test:e2e           # Run end-to-end tests

# Database
npm run db:migrate         # Run database migrations
npm run db:rollback        # Rollback last migration
npm run db:seed            # Seed database with sample data
npm run db:reset           # Reset database (drop + migrate + seed)

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix linting issues
npm run type-check         # Run TypeScript compiler
npm run format             # Format code with Prettier

# Deployment
npm run deploy:staging     # Deploy to staging environment
npm run deploy:production  # Deploy to production environment
```

## Code Style and Conventions

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["./packages/shared/*"],
      "@/ui/*": ["./packages/ui/*"]
    }
  }
}
```

### ESLint Configuration

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "prefer-const": "error",
    "no-console": "warn"
  }
}
```

### Naming Conventions

- **Files**: kebab-case (`user-profile.tsx`)
- **Components**: PascalCase (`UserProfile`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse`)

### Git Workflow

```bash
# Feature development
git checkout -b feature/portfolio-dashboard
git add .
git commit -m "feat: add portfolio dashboard component"
git push origin feature/portfolio-dashboard

# Create pull request
gh pr create --title "Add portfolio dashboard" --body "Implements basic portfolio overview"
```

### Commit Message Convention

```
type(scope): description

feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## API Development

### Server Structure

```
apps/api/
├── src/
│   ├── controllers/        # Request handlers
│   ├── services/          # Business logic
│   ├── repositories/      # Data access layer
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── models/           # Database models
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   └── app.ts            # Express application setup
├── tests/                # API tests
├── migrations/           # Database migrations
└── package.json
```

### Creating a New API Endpoint

```typescript
// controllers/portfolio.controller.ts
import { Request, Response } from 'express';
import { PortfolioService } from '../services/portfolio.service';

export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  async getPortfolios(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const portfolios = await this.portfolioService.getUserPortfolios(userId);
      res.json({ data: portfolios, success: true });
    } catch (error) {
      res.status(500).json({ error: error.message, success: false });
    }
  }
}

// routes/portfolio.routes.ts
import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const portfolioController = new PortfolioController();

router.get('/portfolios', authenticateToken, portfolioController.getPortfolios);

export { router as portfolioRoutes };
```

## Frontend Development

### Component Structure

```typescript
// components/PortfolioDashboard/PortfolioDashboard.tsx
import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../hooks/usePortfolio';
import { PortfolioChart } from './PortfolioChart';
import { AssetList } from './AssetList';
import styles from './PortfolioDashboard.module.css';

interface PortfolioDashboardProps {
  portfolioId: string;
}

export const PortfolioDashboard: React.FC<PortfolioDashboardProps> = ({
  portfolioId
}) => {
  const { portfolio, isLoading, error } = usePortfolio(portfolioId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className={styles.dashboard}>
      <h1>Portfolio Dashboard</h1>
      <PortfolioChart data={portfolio.performanceData} />
      <AssetList assets={portfolio.assets} />
    </div>
  );
};
```

### Custom Hooks

```typescript
// hooks/usePortfolio.ts
import { useState, useEffect } from 'react';
import { portfolioApi } from '../services/api';
import { Portfolio } from '../types/portfolio';

export const usePortfolio = (portfolioId: string) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setIsLoading(true);
        const data = await portfolioApi.getPortfolio(portfolioId);
        setPortfolio(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [portfolioId]);

  return { portfolio, isLoading, error };
};
```

## Testing

### Unit Testing with Jest

```typescript
// __tests__/services/portfolio.service.test.ts
import { PortfolioService } from '../../src/services/portfolio.service';
import { mockPortfolioRepository } from '../mocks/portfolio.repository.mock';

describe('PortfolioService', () => {
  let portfolioService: PortfolioService;

  beforeEach(() => {
    portfolioService = new PortfolioService(mockPortfolioRepository);
  });

  it('should calculate total portfolio value correctly', async () => {
    const portfolio = await portfolioService.getPortfolioValue('user-123');
    expect(portfolio.totalValue).toBe(10000);
  });
});
```

### Integration Testing

```typescript
// __tests__/integration/portfolio.api.test.ts
import request from 'supertest';
import { app } from '../../src/app';

describe('Portfolio API', () => {
  it('GET /api/portfolios should return user portfolios', async () => {
    const response = await request(app)
      .get('/api/portfolios')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### E2E Testing with Playwright

```typescript
// e2e/portfolio.spec.ts
import { test, expect } from '@playwright/test';

test('user can view portfolio dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=login-button]');

  await page.waitForURL('/dashboard');
  await expect(page.locator('[data-testid=portfolio-value]')).toBeVisible();
});
```

## Mobile Development

### React Native Setup

```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# iOS setup (macOS only)
cd apps/mobile/ios && pod install

# Start Metro bundler
npm run mobile:start

# Run on iOS simulator
npm run mobile:ios

# Run on Android emulator
npm run mobile:android
```

### Platform-Specific Code

```typescript
// components/PlatformSpecific.tsx
import { Platform, StatusBar } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight : 0,
  },
});
```

## Debugging

### API Debugging

```typescript
// middleware/logger.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};
```

### Frontend Debugging

```typescript
// utils/debug.ts
export const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};
```

### React Native Debugging

```bash
# Enable remote debugging
npx react-native start --reset-cache

# Flipper for advanced debugging
brew install --cask flipper
```

## Performance Optimization

### Bundle Analysis

```bash
# Analyze web bundle
npm run build:web -- --analyze

# Analyze mobile bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android-bundle.js --assets-dest android-assets
```

### Database Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_transactions_portfolio_id_timestamp ON transactions(portfolio_id, timestamp);
```

This development setup provides a comprehensive foundation for building and maintaining the CryptoTracker platform across all target platforms.