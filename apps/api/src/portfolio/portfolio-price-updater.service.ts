import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PortfolioHolding } from './entities/portfolio-holding.entity';
import { Portfolio } from './entities/portfolio.entity';
import { MarketDataService } from '../market-data/market-data.service';

@Injectable()
export class PortfolioPriceUpdaterService {
  private readonly logger = new Logger(PortfolioPriceUpdaterService.name);

  constructor(
    @InjectRepository(PortfolioHolding)
    private holdingRepository: Repository<PortfolioHolding>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    private marketDataService: MarketDataService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async updateAllHoldingPrices() {
    try {
      this.logger.log('Starting portfolio price update...');
      
      // Get all active holdings
      const holdings = await this.holdingRepository.find({
        where: { isActive: true },
        relations: ['portfolio'],
      });

      if (holdings.length === 0) {
        this.logger.log('No active holdings found');
        return;
      }

      // Group holdings by symbol to minimize API calls
      const symbolGroups = this.groupHoldingsBySymbol(holdings);
      const symbols = Array.from(symbolGroups.keys());

      // Fetch current prices for all symbols
      const prices = await this.marketDataService.getCurrentPrices(symbols);
      
      if (prices.length === 0) {
        this.logger.warn('No prices fetched from market data service');
        return;
      }

      // Update holdings with new prices
      const updatePromises = holdings.map(async (holding) => {
        const priceData = prices.find(
          p => p.symbol.toLowerCase() === holding.symbol.toLowerCase()
        );

        if (priceData) {
          await this.updateHoldingPrice(holding, priceData.current_price);
        }
      });

      await Promise.all(updatePromises);

      // Update portfolio totals
      const portfolioIds = [...new Set(holdings.map(h => h.portfolioId))];
      await this.updatePortfolioTotals(portfolioIds);

      this.logger.log(`Updated prices for ${holdings.length} holdings across ${portfolioIds.length} portfolios`);
    } catch (error) {
      this.logger.error('Error updating portfolio prices:', error.message);
    }
  }

  async updatePortfolioHoldingPrices(portfolioId: string) {
    try {
      const holdings = await this.holdingRepository.find({
        where: { portfolioId, isActive: true },
      });

      if (holdings.length === 0) {
        return;
      }

      const symbols = holdings.map(h => h.symbol);
      const prices = await this.marketDataService.getCurrentPrices(symbols);

      const updatePromises = holdings.map(async (holding) => {
        const priceData = prices.find(
          p => p.symbol.toLowerCase() === holding.symbol.toLowerCase()
        );

        if (priceData) {
          await this.updateHoldingPrice(holding, priceData.current_price);
        }
      });

      await Promise.all(updatePromises);
      await this.updatePortfolioTotals([portfolioId]);

      this.logger.log(`Updated prices for portfolio ${portfolioId}`);
    } catch (error) {
      this.logger.error(`Error updating prices for portfolio ${portfolioId}:`, error.message);
    }
  }

  private async updateHoldingPrice(holding: PortfolioHolding, currentPrice: number) {
    const quantity = Number(holding.quantity);
    const currentValue = quantity * currentPrice;
    const totalCost = Number(holding.totalCost);
    const profitLoss = currentValue - totalCost;
    const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    await this.holdingRepository.update(holding.id, {
      currentPrice,
      currentValue,
      profitLoss,
      profitLossPercentage,
      lastPriceUpdate: new Date(),
    });
  }

  private async updatePortfolioTotals(portfolioIds: string[]) {
    const updatePromises = portfolioIds.map(async (portfolioId) => {
      const holdings = await this.holdingRepository.find({
        where: { portfolioId, isActive: true },
      });

      const totalValue = holdings.reduce(
        (sum, holding) => sum + Number(holding.currentValue || holding.totalCost),
        0,
      );

      await this.portfolioRepository.update(portfolioId, { totalValue });
    });

    await Promise.all(updatePromises);
  }

  private groupHoldingsBySymbol(holdings: PortfolioHolding[]): Map<string, PortfolioHolding[]> {
    const groups = new Map<string, PortfolioHolding[]>();
    
    holdings.forEach(holding => {
      const symbol = holding.symbol.toUpperCase();
      if (!groups.has(symbol)) {
        groups.set(symbol, []);
      }
      groups.get(symbol)!.push(holding);
    });

    return groups;
  }
}