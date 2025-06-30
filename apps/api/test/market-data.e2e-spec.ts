import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('MarketDataController (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;

  const mockCoinData = [
    {
      id: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      current_price: 45000,
      market_cap: 850000000000,
      market_cap_rank: 1,
      price_change_percentage_24h: 2.5,
      price_change_percentage_7d: -1.2,
      price_change_percentage_30d: 15.3,
      total_volume: 25000000000,
      high_24h: 46000,
      low_24h: 44000,
      last_updated: '2025-06-29T16:00:00.000Z',
    },
  ];

  const mockHistoricalData = {
    prices: [[1640995200000, 47000], [1641081600000, 48000]],
    market_caps: [[1640995200000, 890000000000], [1641081600000, 910000000000]],
    total_volumes: [[1640995200000, 30000000000], [1641081600000, 32000000000]],
  };

  const mockSearchResults = {
    coins: [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    ],
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    
    httpService = moduleFixture.get<HttpService>(HttpService);
    
    // Mock external API calls
    jest.spyOn(httpService, 'get').mockImplementation((url: string) => {
      if (url.includes('/coins/markets')) {
        return of({ data: mockCoinData });
      }
      if (url.includes('/market_chart')) {
        return of({ data: mockHistoricalData });
      }
      if (url.includes('/search')) {
        return of({ data: mockSearchResults });
      }
      return of({ data: [] });
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  describe('/api/v1/market-data/prices (GET)', () => {
    it('should return current prices for symbols', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/prices')
        .query({ symbols: 'BTC,ETH', vs_currency: 'usd' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockCoinData);
        });
    });

    it('should use default currency when not specified', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/prices')
        .query({ symbols: 'BTC' })
        .expect(200);
    });

    it('should return 400 for missing symbols parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/prices')
        .expect(400);
    });
  });

  describe('/api/v1/market-data/price/:symbol (GET)', () => {
    it('should return price for single symbol', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/price/BTC')
        .query({ vs_currency: 'usd' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockCoinData[0]);
        });
    });

    it('should use default currency when not specified', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/price/BTC')
        .expect(200);
    });
  });

  describe('/api/v1/market-data/historical/:symbol (GET)', () => {
    it('should return historical data for symbol', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/historical/BTC')
        .query({ days: 7, vs_currency: 'usd' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockHistoricalData);
        });
    });

    it('should use default values when not specified', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/historical/BTC')
        .expect(200);
    });
  });

  describe('/api/v1/market-data/search (GET)', () => {
    it('should return search results', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/search')
        .query({ query: 'bitcoin', limit: 5 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockSearchResults.coins.slice(0, 5));
        });
    });

    it('should use default limit when not specified', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/search')
        .query({ query: 'bitcoin' })
        .expect(200);
    });

    it('should return 400 for missing query parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/search')
        .expect(400);
    });
  });

  describe('/api/v1/market-data/top (GET)', () => {
    it('should return top coins', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/top')
        .query({ limit: 50, vs_currency: 'usd' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockCoinData);
        });
    });

    it('should use default values when not specified', () => {
      return request(app.getHttpServer())
        .get('/api/v1/market-data/top')
        .expect(200);
    });
  });

  describe('Error handling', () => {
    it('should handle external API errors gracefully', () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new Error('External API Error');
      });

      return request(app.getHttpServer())
        .get('/api/v1/market-data/prices')
        .query({ symbols: 'BTC' })
        .expect(503);
    });
  });
});