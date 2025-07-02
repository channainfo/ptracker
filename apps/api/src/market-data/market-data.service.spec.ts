import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MarketDataService } from './market-data.service';
import { of } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('MarketDataService', () => {
  let service: MarketDataService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketDataService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MarketDataService>(MarketDataService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrentPrices', () => {
    it('should return current prices for given symbols', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockCoinData }));

      const result = await service.getCurrentPrices(['BTC']);

      expect(result).toEqual(mockCoinData);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            ids: 'bitcoin',
            order: 'market_cap_desc',
            per_page: 250,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h,7d,30d',
          },
        },
      );
    });

    it('should throw HttpException when API call fails', async () => {
      mockHttpService.get.mockImplementation(() => {
        throw new Error('API Error');
      });

      await expect(service.getCurrentPrices(['BTC'])).rejects.toThrow(
        HttpException,
      );
    });

    it('should handle multiple symbols', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockCoinData }));

      await service.getCurrentPrices(['BTC', 'ETH']);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            ids: 'bitcoin,ethereum',
          }),
        }),
      );
    });
  });

  describe('getCoinPrice', () => {
    it('should return single coin price', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockCoinData }));

      const result = await service.getCoinPrice('BTC');

      expect(result).toEqual(mockCoinData[0]);
    });

    it('should return null for non-existent coin', async () => {
      mockHttpService.get.mockReturnValue(of({ data: [] }));

      const result = await service.getCoinPrice('INVALID');

      expect(result).toBeNull();
    });
  });

  describe('getHistoricalData', () => {
    const mockHistoricalData = {
      prices: [[1640995200000, 47000], [1641081600000, 48000]],
      market_caps: [[1640995200000, 890000000000], [1641081600000, 910000000000]],
      total_volumes: [[1640995200000, 30000000000], [1641081600000, 32000000000]],
    };

    it('should return historical data for a symbol', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockHistoricalData }));

      const result = await service.getHistoricalData('BTC', 7);

      expect(result).toEqual(mockHistoricalData);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart',
        {
          params: {
            vs_currency: 'usd',
            days: '7',
            interval: 'daily',
          },
        },
      );
    });

    it('should use hourly interval for 1 day or less', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockHistoricalData }));

      await service.getHistoricalData('BTC', 1);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            interval: 'hourly',
          }),
        }),
      );
    });
  });

  describe('searchCoins', () => {
    const mockSearchResults = {
      coins: [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
      ],
    };

    it('should return search results', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockSearchResults }));

      const result = await service.searchCoins('bit', 5);

      expect(result).toEqual(mockSearchResults.coins.slice(0, 5));
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/search',
        {
          params: { query: 'bit' },
        },
      );
    });

    it('should limit results to specified limit', async () => {
      const manyCoins = Array(20).fill(null).map((_, i) => ({
        id: `coin-${i}`,
        name: `Coin ${i}`,
        symbol: `C${i}`,
      }));
      
      mockHttpService.get.mockReturnValue(of({ 
        data: { coins: manyCoins } 
      }));

      const result = await service.searchCoins('coin', 3);

      expect(result).toHaveLength(3);
    });
  });

  describe('getTopCoins', () => {
    it('should return top coins by market cap', async () => {
      mockHttpService.get.mockReturnValue(of({ data: mockCoinData }));

      const result = await service.getTopCoins(10);

      expect(result).toEqual(mockCoinData);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 10,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h,7d,30d',
          },
        },
      );
    });
  });

  describe('symbolToId', () => {
    it('should map known symbols to CoinGecko IDs', () => {
      // Test private method via public methods that use it
      mockHttpService.get.mockReturnValue(of({ data: mockCoinData }));

      service.getCurrentPrices(['BTC']);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            ids: 'bitcoin',
          }),
        }),
      );
    });

    it('should return lowercase symbol for unknown symbols', () => {
      mockHttpService.get.mockReturnValue(of({ data: mockCoinData }));

      service.getCurrentPrices(['UNKNOWN']);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            ids: 'unknown',
          }),
        }),
      );
    });
  });
});