# CryptoTracker Testing Guide

This document outlines the comprehensive testing strategy and setup for the CryptoTracker platform.

## Overview

The CryptoTracker project includes multiple types of testing:

- **Unit Tests**: Test individual components and services in isolation
- **Integration Tests**: Test API endpoints and database interactions
- **Component Tests**: Test React components with user interactions
- **E2E Tests**: Test complete user workflows across the application
- **Accessibility Tests**: Ensure the application meets accessibility standards

## Test Structure

```
ptracker/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   └── **/*.spec.ts         # Unit tests
│   │   └── test/
│   │       └── **/*.e2e-spec.ts     # Integration tests
│   └── web/
│       ├── src/
│       │   └── **/__tests__/        # Component tests
│       └── e2e/
│           └── **/*.spec.ts         # E2E tests
├── test.sh                          # Main test runner script
└── TESTING.md                       # This file
```

## Running Tests

### Quick Commands

```bash
# Run all tests
npm run test:all

# Run API tests only
npm run test:api

# Run web tests only
npm run test:web

# Run E2E tests (requires running applications)
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Individual Test Suites

```bash
# API unit tests
cd apps/api && npm run test

# API integration tests
cd apps/api && npm run test:e2e

# Web component tests
cd apps/web && npm run test

# Web E2E tests (requires app running on port 3900)
cd apps/web && npm run test:e2e

# Web E2E tests with UI
cd apps/web && npm run test:e2e:ui
```

## Test Configuration

### API Tests (Jest + Supertest)

- **Framework**: Jest with NestJS testing utilities
- **HTTP Testing**: Supertest for endpoint testing
- **Database**: Uses test database configuration
- **Mocking**: HTTP services and external APIs are mocked

**Configuration Files**:
- `apps/api/jest.config.js` - Main Jest configuration
- `apps/api/test/jest-e2e.json` - E2E test configuration
- `apps/api/.env.test` - Test environment variables

### Web Tests (Jest + React Testing Library)

- **Framework**: Jest with Next.js testing setup
- **Component Testing**: React Testing Library
- **Mocking**: Next.js router and environment variables

**Configuration Files**:
- `apps/web/jest.config.js` - Next.js Jest configuration
- `apps/web/jest.setup.js` - Test setup and global mocks

### E2E Tests (Playwright)

- **Framework**: Playwright for cross-browser testing
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Features**: Screenshots on failure, trace collection, HTML reports

**Configuration Files**:
- `apps/web/playwright.config.ts` - Playwright configuration

## Test Coverage

### API Coverage Targets
- **Services**: >90% code coverage
- **Controllers**: >85% code coverage
- **Integration**: All endpoints tested

### Web Coverage Targets
- **Components**: >80% code coverage
- **User Interactions**: Critical user flows tested
- **Accessibility**: WCAG 2.1 AA compliance

## Test Examples

### API Unit Test Example
```typescript
// apps/api/src/market-data/market-data.service.spec.ts
describe('MarketDataService', () => {
  it('should return current prices for given symbols', async () => {
    mockHttpService.get.mockReturnValue(of({ data: mockCoinData }));
    const result = await service.getCurrentPrices(['BTC']);
    expect(result).toEqual(mockCoinData);
  });
});
```

### Component Test Example
```typescript
// apps/web/src/components/landing/__tests__/hero-section.test.tsx
describe('HeroSection', () => {
  it('renders hero content', () => {
    render(<HeroSection />);
    expect(screen.getByText('Smart Crypto Portfolio')).toBeInTheDocument();
  });
});
```

### E2E Test Example
```typescript
// apps/web/e2e/landing-page.spec.ts
test('displays hero section with call-to-action', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Smart Crypto Portfolio');
  const getStartedButton = page.getByRole('link', { name: /get started/i });
  await expect(getStartedButton).toBeVisible();
});
```

## Environment Setup

### Prerequisites
- Node.js 18+
- npm 8+
- PostgreSQL (for integration tests)
- Docker (optional, for containerized testing)

### Environment Variables

**API Test Environment** (`.env.test`):
```env
NODE_ENV=test
DB_NAME=ptracker_test
JWT_SECRET=test-jwt-secret
```

**Web Test Environment** (`.env.test`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXTAUTH_SECRET=test-nextauth-secret
```

## CI/CD Integration

The test suite is designed to work in CI/CD environments:

```bash
# CI test script example
export CI=true
npm run test:all
```

### GitHub Actions Example
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:all
```

## Debugging Tests

### Debug Failing Tests
```bash
# Run with verbose output
npm run test -- --verbose

# Run specific test file
npm run test -- --testPathPattern=hero-section

# Run tests in watch mode
npm run test:watch

# Debug with Node.js inspector
npm run test:debug
```

### E2E Test Debugging
```bash
# Run with UI mode
npm run test:e2e:ui

# Run with browser visible
npx playwright test --headed

# Generate trace
npx playwright test --trace on
```

## Performance Testing

### Load Testing
For API performance testing, consider tools like:
- Artillery.js
- k6
- Apache Bench (ab)

### Bundle Size Testing
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer
```

## Best Practices

### Writing Tests
1. **Arrange, Act, Assert**: Structure tests clearly
2. **Test Behavior**: Focus on what the code does, not how
3. **Mock External Dependencies**: Keep tests isolated
4. **Use Descriptive Names**: Test names should explain the scenario

### Maintenance
1. **Keep Tests Fast**: Unit tests should run in milliseconds
2. **Avoid Test Flakiness**: Make tests deterministic
3. **Regular Updates**: Update tests when requirements change
4. **Code Coverage**: Aim for high coverage but focus on critical paths

## Troubleshooting

### Common Issues

**Jest Module Resolution**:
```bash
# Clear Jest cache
npx jest --clearCache
```

**Playwright Browser Issues**:
```bash
# Install browsers
npx playwright install
```

**TypeScript Compilation**:
```bash
# Check TypeScript
npm run type-check
```

## Test Reports

Test reports are generated in:
- `apps/api/coverage/` - API test coverage
- `apps/web/coverage/` - Web test coverage
- `apps/web/playwright-report/` - E2E test reports
- `apps/web/test-results/` - E2E test artifacts

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure existing tests pass
3. Add integration tests for new API endpoints
4. Add component tests for new UI components
5. Update E2E tests for new user workflows
6. Maintain or improve code coverage

For questions about testing, refer to the team's testing guidelines or create an issue in the repository.