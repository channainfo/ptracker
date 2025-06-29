import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioHolding } from './entities/portfolio-holding.entity';
import { Transaction } from './entities/transaction.entity';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PortfolioPriceUpdaterService } from './portfolio-price-updater.service';
import { MarketDataModule } from '../market-data/market-data.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio, PortfolioHolding, Transaction]),
    MarketDataModule,
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioPriceUpdaterService],
  exports: [PortfolioService],
})
export class PortfolioModule {}