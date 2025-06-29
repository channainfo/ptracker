import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketDataService } from './market-data.service';

@ApiTags('Market Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('market')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('coins/top')
  @ApiOperation({ summary: 'Get top cryptocurrencies by market cap' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of coins to fetch (default: 100)' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Currency for prices (default: usd)' })
  @ApiResponse({ status: 200, description: 'Top coins retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  getTopCoins(
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 100,
    @Query('currency') currency = 'usd',
  ) {
    return this.marketDataService.getTopCoins(limit, currency);
  }

  @Get('coins/search')
  @ApiOperation({ summary: 'Search cryptocurrencies' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of results (default: 10)' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  searchCoins(
    @Query('q') query: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 10,
  ) {
    return this.marketDataService.searchCoins(query, limit);
  }

  @Get('prices')
  @ApiOperation({ summary: 'Get current prices for multiple cryptocurrencies' })
  @ApiQuery({ name: 'symbols', required: true, type: String, description: 'Comma-separated list of symbols (e.g., BTC,ETH,ADA)' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Currency for prices (default: usd)' })
  @ApiResponse({ status: 200, description: 'Prices retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  getCurrentPrices(
    @Query('symbols') symbols: string,
    @Query('currency') currency = 'usd',
  ) {
    const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());
    return this.marketDataService.getCurrentPrices(symbolArray, currency);
  }

  @Get('coins/:symbol/price')
  @ApiOperation({ summary: 'Get current price for a specific cryptocurrency' })
  @ApiParam({ name: 'symbol', description: 'Cryptocurrency symbol (e.g., BTC, ETH)', type: 'string' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Currency for price (default: usd)' })
  @ApiResponse({ status: 200, description: 'Price retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Coin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  getCoinPrice(
    @Param('symbol') symbol: string,
    @Query('currency') currency = 'usd',
  ) {
    return this.marketDataService.getCoinPrice(symbol, currency);
  }

  @Get('coins/:symbol/history')
  @ApiOperation({ summary: 'Get historical price data for a cryptocurrency' })
  @ApiParam({ name: 'symbol', description: 'Cryptocurrency symbol (e.g., BTC, ETH)', type: 'string' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days of historical data (default: 30)' })
  @ApiQuery({ name: 'currency', required: false, type: String, description: 'Currency for prices (default: usd)' })
  @ApiResponse({ status: 200, description: 'Historical data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Coin not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 503, description: 'Service unavailable' })
  getHistoricalData(
    @Param('symbol') symbol: string,
    @Query('days', new ParseIntPipe({ optional: true })) days = 30,
    @Query('currency') currency = 'usd',
  ) {
    return this.marketDataService.getHistoricalData(symbol, days, currency);
  }
}