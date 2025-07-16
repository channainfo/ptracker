# PTracker

> **Your Journey from First Trade to Trading Bot Mastery – One Platform, Every Chain, Unlimited Potential**

A comprehensive cryptocurrency portfolio management and education platform that empowers users to track, learn, and make informed investment decisions in the crypto space.

## Demo

![PTracker Demo](demo.gif)

## Features

### Portfolio Management
- **Multi-Portfolio Support**: Manage multiple portfolios with different strategies
- **Exchange Integration**: Connect and sync with major cryptocurrency exchanges
- **Real-time Tracking**: 
  - Live price updates and portfolio valuation
  - Multi-chain support (Ethereum, BSC, Polygon, Arbitrum, Solana, Sui)
  - Cross-chain asset tracking and analytics
  - Trading Bot Integration with automated strategies
  - Real-time P&L tracking for bot performance
- **Transaction History**: Complete record of all trades and transfers
- **Performance Analytics**: Detailed profit/loss analysis and portfolio metrics

### Market Intelligence
- **Real-time Data**: Live cryptocurrency prices and market updates
- **Market Sentiment**: AI-powered sentiment analysis from multiple sources
- **Price Alerts**: Customizable notifications for price movements
- **Trending Assets**: Discover trending cryptocurrencies and tokens

### Educational Platform
- **Structured Learning**: Progressive courses from beginner to advanced
- **Interactive Content**: Quizzes, challenges, and hands-on exercises
- **Expert Insights**: Curated content from industry professionals
- **Community Learning**: Share and learn with other users

### Trading Bot Features
- **Automated Trading**: Deploy custom trading strategies across multiple chains
- **Strategy Templates**: Pre-built strategies for DCA, grid trading, and arbitrage
- **Risk Management**: Stop-loss, take-profit, and position sizing controls
- **Backtesting**: Test strategies against historical data
- **Performance Monitoring**: Real-time bot performance metrics and alerts

### Security & Privacy
- **Secure Authentication**: JWT-based auth with OAuth support
- **Data Encryption**: End-to-end encryption for sensitive data
- **Biometric Support**: Face ID/Touch ID on mobile devices
- **API Key Management**: Secure storage of exchange API credentials

## Tech Stack

### Backend (API)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis for performance optimization
- **Authentication**: Passport.js with JWT
- **Real-time**: Socket.io for live updates
- **Blockchain**: Multi-chain integration (Ethereum, BSC, Polygon, Arbitrum, Solana, Sui)
- **Trading Bot**: Custom bot framework with strategy engine

### Frontend (Web)
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query, SWR
- **UI Components**: Radix UI, Headless UI
- **Wallet Integration**: RainbowKit, WalletConnect

### Mobile
- **Framework**: Expo with React Native
- **Navigation**: React Navigation
- **Styling**: NativeWind
- **Charts**: Victory Native
- **Security**: Biometric authentication

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/channainfo/ptracker.git
cd ptracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
```

4. Set up the database:
```bash
# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

5. Start the development servers:
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:api    # Backend API
npm run dev:web    # Web frontend
npm run dev:mobile # Mobile app
```

### Running Tests

```bash
# Run all tests
npm run test

# Run specific workspace tests
npm run test:api
npm run test:web
npm run test:mobile

# Run E2E tests
npm run test:e2e
```

## Project Structure

```
ptracker/
├── apps/
│   ├── api/          # NestJS backend API
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native mobile app
├── packages/         # Shared packages
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Shared utilities
│   └── ui/           # Shared UI components
├── docs/             # Documentation
└── scripts/          # Build and deployment scripts
```

## API Documentation

The API documentation is available at `http://localhost:3000/api/docs` when running the backend server in development mode.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Backend Deployment
The API can be deployed to various platforms:
- AWS ECS/Fargate
- Google Cloud Run
- Heroku
- Digital Ocean App Platform

### Frontend Deployment
- Web: Vercel, Netlify, or AWS Amplify
- Mobile: Expo EAS Build for app stores

## Environment Variables

### API Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT token generation
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

### Web Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID

### Mobile Environment Variables
- `EXPO_PUBLIC_API_URL`: Backend API URL
- `EXPO_PUBLIC_WS_URL`: WebSocket server URL

## Ref
- Register Google Oauth API: https://dev.to/jkevinbaluyot/google-login-rails-7-tutorial-1ai6
- Google one-tap login: https://developers.google.com/identity/gsi/web/reference/html-reference and make sure to whitelist your domains in the **Authorized JavaScript origins** section next to the Authorized redirect URIs in the Credentials config.
- Register Github Oauth API: https://github.com/settings/applications/new

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs.ptracker.com](https://docs.ptracker.com)
- Issues: [GitHub Issues](https://github.com/channainfo/ptracker/issues)
- Discord: [Join our community](https://discord.gg/ptracker)

## Acknowledgments

- Built with love by the PTracker team
- Special thanks to all contributors and the open-source community