# Seed Data Documentation

## Overview
This seed data generates **470 realistic users** with comprehensive crypto portfolio data for testing and demonstration purposes.

## User Credentials
**Password for ALL users**: `Pass!047-Crypto`

## Data Structure

### Users (470 total)
- **Email Pattern**: `[firstname].[lastname][number]@cryptotracker.demo`
- **Example Emails**:
  - `john.smith1@cryptotracker.demo`
  - `sarah.wilson47@cryptotracker.demo`
  - `alex.jackson123@cryptotracker.demo`
  - `jennifer.moore200@cryptotracker.demo`
  - `michael.garcia350@cryptotracker.demo`

### User Demographics
- **Names**: 20 diverse first names, 20 common last names
- **Verification Status**: 90% email verified, 10% unverified
- **2FA Adoption**: 30% have two-factor authentication enabled
- **Account Status**: 95% active accounts
- **Registration Dates**: Spread between June 2023 - January 2024
- **Last Login**: Recent activity (November 2024 - present)

### Portfolio Distribution
- **Portfolios per User**: 1-3 portfolios each
- **Total Portfolios**: ~800 portfolios
- **Portfolio Values**: $1,000 - $50,000 (with some whales up to $500K)
- **Public Portfolios**: 20% are public, 80% private

### Portfolio Themes
1. **Conservative Growth** - BTC/ETH focused, low risk
2. **Aggressive Growth** - Alt coins, high risk/reward
3. **DeFi Focus** - Decentralized finance protocols
4. **Layer 1 Blockchain** - Foundation blockchain investments
5. **Gaming & NFT** - Metaverse and gaming tokens
6. **Stablecoin Yield** - Low-risk yield farming
7. **AI & Tech Tokens** - Technology-focused crypto
8. **Institutional Mix** - Enterprise-grade assets

### Supported Cryptocurrencies (15 total)
| Symbol | Name | Price Range | Category |
|--------|------|-------------|----------|
| BTC | Bitcoin | $30,000 - $70,000 | Layer 1 |
| ETH | Ethereum | $1,800 - $4,200 | Smart Contract |
| SOL | Solana | $80 - $200 | Layer 1 |
| ADA | Cardano | $0.25 - $1.20 | Layer 1 |
| DOT | Polkadot | $4 - $15 | Interoperability |
| MATIC | Polygon | $0.40 - $2.80 | Layer 2 |
| LINK | Chainlink | $6 - $35 | Oracle |
| AVAX | Avalanche | $15 - $80 | Layer 1 |
| UNI | Uniswap | $4 - $25 | DeFi |
| ATOM | Cosmos | $7 - $25 | Interoperability |
| ALGO | Algorand | $0.10 - $1.50 | Layer 1 |
| XTZ | Tezos | $0.80 - $5.00 | Layer 1 |
| NEAR | NEAR Protocol | $1.50 - $15.00 | Layer 1 |
| FTM | Fantom | $0.20 - $2.50 | Layer 1 |
| SAND | The Sandbox | $0.30 - $3.00 | Gaming/NFT |

### Holdings Data
- **Total Holdings**: ~2,500 individual asset holdings
- **Realistic Allocations**: Based on portfolio themes
- **Price History**: Simulated historical purchases
- **Current Prices**: Market-realistic valuations
- **Profit/Loss Tracking**: Calculated from average cost basis

### Transaction History
- **Total Transactions**: ~12,000+ transactions
- **Transaction Types**: 80% BUY, 20% SELL
- **Date Range**: January 2023 - Present
- **Realistic Fees**: 0.1% - 0.25% based on asset
- **Status Distribution**: 95% COMPLETED, 4% PENDING, 1% FAILED

### User Behavior Patterns
#### Conservative Traders (40%)
- Trading Frequency: 1-3 trades/month
- Preferred Assets: BTC, ETH, ADA
- Portfolio Size: $5K - $50K
- Hold Time: 6-12 months

#### Moderate Traders (35%)
- Trading Frequency: 1-2 trades/week
- Preferred Assets: BTC, ETH, SOL, ADA, DOT
- Portfolio Size: $2K - $25K
- Hold Time: 3-6 months

#### Aggressive Traders (20%)
- Trading Frequency: 3-5 trades/week
- Preferred Assets: SOL, AVAX, NEAR, FTM, SAND
- Portfolio Size: $1K - $15K
- Hold Time: 1-3 months

#### Whales (5%)
- Trading Frequency: Moderate
- Preferred Assets: BTC, ETH, SOL
- Portfolio Size: $100K - $500K
- Hold Time: 12+ months

## Database Statistics
After seeding, the database will contain:
- 👥 **470 Users**
- 📊 **~800 Portfolios**
- 💰 **~2,500 Holdings**
- 📝 **~12,000 Transactions**
- 💵 **~$15M Total Portfolio Value**

## Usage Instructions

### Running the Seed Script
```bash
# Navigate to API directory
cd apps/api

# Run the seeding process
npm run seed:users
```

### Sample Login Credentials
Use any of these emails with password `Pass!047-Crypto`:
- `john.smith1@cryptotracker.demo`
- `sarah.wilson47@cryptotracker.demo`
- `alex.jackson123@cryptotracker.demo`
- `jennifer.moore200@cryptotracker.demo`
- `michael.garcia350@cryptotracker.demo`

### Testing Different User Types
- **Conservative User**: `john.smith1@cryptotracker.demo`
- **DeFi Enthusiast**: `alex.jackson123@cryptotracker.demo`
- **High-Frequency Trader**: `sarah.wilson47@cryptotracker.demo`
- **Whale Account**: `michael.garcia350@cryptotracker.demo`

## Data Realism Features

### Realistic Price Movements
- Historical price progression from 2023-2024
- Volatility patterns matching real crypto markets
- Bull/bear market cycles reflected in portfolios

### Authentic Transaction Patterns
- Gradual position building over time
- Realistic buy/sell ratios
- Market timing reflecting actual trading behavior
- Fee structures matching real exchanges

### Diverse Portfolio Strategies
- Risk tolerance reflected in asset selection
- Allocation percentages based on real strategies
- Performance data showing realistic gains/losses

### Market Data Integration
- Current prices reflect real market conditions
- Market caps and volumes at realistic levels
- Asset categories and descriptions accurate

## Performance Considerations
- Seeding process takes ~30-60 seconds
- Uses batch inserts for optimal database performance
- Memory-efficient data generation
- Progress logging every 50 users

## Security Notes
- All passwords are properly hashed with bcrypt (12 rounds)
- Email addresses use `.demo` domain to prevent conflicts
- Test data is clearly marked with demo domain
- No real personal information is used

This seed data provides a comprehensive, realistic dataset for testing all dashboard features, user flows, and portfolio management functionality.