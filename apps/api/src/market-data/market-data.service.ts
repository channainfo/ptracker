import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
  price_change_percentage_30d: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

export interface HistoricalPrice {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getCurrentPrices(
    symbols: string[],
    vsCurrency = 'usd',
  ): Promise<CoinPrice[]> {
    // Cache functionality temporarily disabled

    try {
      const idsParam = symbols.map(s => this.symbolToId(s)).join(',');
      const url = `${this.baseUrl}/coins/markets`;
      const params = {
        vs_currency: vsCurrency,
        ids: idsParam,
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d,30d',
      };

      const response = await firstValueFrom(
        this.httpService.get<CoinPrice[]>(url, { params }),
      );

      const prices: CoinPrice[] = response.data;
      
      // Cache functionality temporarily disabled
      
      this.logger.log(`Fetched prices for ${prices.length} coins`);
      return prices;
    } catch (error) {
      this.logger.error('Failed to fetch current prices:', error.message);
      throw new HttpException(
        'Failed to fetch market data',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getCoinPrice(
    symbol: string,
    vsCurrency = 'usd',
  ): Promise<CoinPrice | null> {
    const prices = await this.getCurrentPrices([symbol], vsCurrency);
    return prices.find(p => p.symbol.toLowerCase() === symbol.toLowerCase()) || null;
  }

  async getHistoricalData(
    symbol: string,
    days = 30,
    vsCurrency = 'usd',
  ): Promise<HistoricalPrice> {
    // Cache functionality temporarily disabled
    // const cacheKey = `historical_${symbol}_${days}_${vsCurrency}`;
    
    // Cache retrieval temporarily disabled
    // const cached = await this.cacheManager.get<HistoricalPrice>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    try {
      const coinId = this.symbolToId(symbol);
      const url = `${this.baseUrl}/coins/${coinId}/market_chart`;
      const params = {
        vs_currency: vsCurrency,
        days: days.toString(),
        interval: this.getInterval(days),
      };

      const response = await firstValueFrom(
        this.httpService.get<HistoricalPrice>(url, { params }),
      );

      const data: HistoricalPrice = response.data;
      
      // Cache functionality temporarily disabled
      // await this.cacheManager.set(cacheKey, data, 300000);
      
      this.logger.log(`Fetched historical data for ${symbol}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch historical data for ${symbol}:`, error.message);
      throw new HttpException(
        'Failed to fetch historical data',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async searchCoins(query: string, limit = 10): Promise<any[]> {
    // Cache functionality temporarily disabled
    // const cacheKey = `search_${query}_${limit}`;
    
    // Cache retrieval temporarily disabled
    // const cached = await this.cacheManager.get<any[]>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    try {
      const url = `${this.baseUrl}/search`;
      const params = { query };

      const response = await firstValueFrom(
        this.httpService.get<{ coins: any[] }>(url, { params }),
      );

      const results = response.data.coins.slice(0, limit);
      
      // Cache functionality temporarily disabled
      // await this.cacheManager.set(cacheKey, results, 3600000);
      
      return results;
    } catch (error) {
      this.logger.error(`Failed to search coins for query ${query}:`, error.message);
      throw new HttpException(
        'Failed to search coins',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getTopCoins(limit = 100, vsCurrency = 'usd'): Promise<CoinPrice[]> {
    // Cache functionality temporarily disabled
    // const cacheKey = `top_coins_${limit}_${vsCurrency}`;
    
    // Cache retrieval temporarily disabled
    // const cached = await this.cacheManager.get<CoinPrice[]>(cacheKey);
    // if (cached) {
    //   return cached;
    // }

    try {
      const url = `${this.baseUrl}/coins/markets`;
      const params = {
        vs_currency: vsCurrency,
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d,30d',
      };

      const response = await firstValueFrom(
        this.httpService.get<CoinPrice[]>(url, { params }),
      );

      const coins: CoinPrice[] = response.data;
      
      // Cache functionality temporarily disabled
      // await this.cacheManager.set(cacheKey, coins, 120000);
      
      this.logger.log(`Fetched top ${coins.length} coins`);
      return coins;
    } catch (error) {
      this.logger.error('Failed to fetch top coins:', error.message);
      throw new HttpException(
        'Failed to fetch top coins',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private symbolToId(symbol: string): string {
    // Map common symbols to CoinGecko IDs
    const symbolMap: { [key: string]: string } = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'ADA': 'cardano',
      'SOL': 'solana',
      'XRP': 'ripple',
      'DOT': 'polkadot',
      'DOGE': 'dogecoin',
      'AVAX': 'avalanche-2',
      'SHIB': 'shiba-inu',
      'MATIC': 'matic-network',
      'LTC': 'litecoin',
      'ATOM': 'cosmos',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'BCH': 'bitcoin-cash',
      'ALGO': 'algorand',
      'VET': 'vechain',
      'FIL': 'filecoin',
      'TRX': 'tron',
      'ICP': 'internet-computer',
    };

    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  private getInterval(days: number): string {
    if (days <= 1) return 'hourly';
    if (days <= 90) return 'daily';
    return 'daily';
  }
}