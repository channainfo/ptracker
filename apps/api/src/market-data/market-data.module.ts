import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [MarketDataController],
  providers: [MarketDataService],
  exports: [MarketDataService],
})
export class MarketDataModule {}