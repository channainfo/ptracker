import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataController } from './market-data.controller';
import { MarketDataService } from './market-data.service';

describe('MarketDataController', () => {
  let controller: MarketDataController;
  let service: MarketDataService;

  const mockMarketDataService = {
    getCurrentPrices: jest.fn(),
    getCoinPrice: jest.fn(),
    getHistoricalData: jest.fn(),
    searchCoins: jest.fn(),
    getTopCoins: jest.fn(),
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
      controllers: [MarketDataController],
      providers: [
        {
          provide: MarketDataService,
          useValue: mockMarketDataService,
        },
      ],
    }).compile();

    controller = module.get<MarketDataController>(MarketDataController);
    service = module.get<MarketDataService>(MarketDataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentPrices', () => {
    it('should return current prices for symbols', async () => {
      mockMarketDataService.getCurrentPrices.mockResolvedValue(mockCoinData);

      const result = await controller.getCurrentPrices('BTC,ETH', 'usd');

      expect(result).toEqual(mockCoinData);
      expect(service.getCurrentPrices).toHaveBeenCalledWith(['BTC', 'ETH'], 'usd');
    });

    it('should handle single symbol', async () => {
      mockMarketDataService.getCurrentPrices.mockResolvedValue(mockCoinData);

      await controller.getCurrentPrices('BTC', 'usd');

      expect(service.getCurrentPrices).toHaveBeenCalledWith(['BTC'], 'usd');
    });

    it('should use default currency if not provided', async () => {
      mockMarketDataService.getCurrentPrices.mockResolvedValue(mockCoinData);

      await controller.getCurrentPrices('BTC', undefined);

      expect(service.getCurrentPrices).toHaveBeenCalledWith(['BTC'], 'usd');
    });
  });

  describe('getCoinPrice', () => {
    it('should return single coin price', async () => {
      mockMarketDataService.getCoinPrice.mockResolvedValue(mockCoinData[0]);

      const result = await controller.getCoinPrice('BTC', 'usd');

      expect(result).toEqual(mockCoinData[0]);
      expect(service.getCoinPrice).toHaveBeenCalledWith('BTC', 'usd');
    });

    it('should use default currency if not provided', async () => {
      mockMarketDataService.getCoinPrice.mockResolvedValue(mockCoinData[0]);

      await controller.getCoinPrice('BTC', undefined);

      expect(service.getCoinPrice).toHaveBeenCalledWith('BTC', 'usd');
    });
  });

  describe('getHistoricalData', () => {
    const mockHistoricalData = {
      prices: [[1640995200000, 47000], [1641081600000, 48000]],
      market_caps: [[1640995200000, 890000000000], [1641081600000, 910000000000]],
      total_volumes: [[1640995200000, 30000000000], [1641081600000, 32000000000]],
    };

    it('should return historical data', async () => {
      mockMarketDataService.getHistoricalData.mockResolvedValue(mockHistoricalData);

      const result = await controller.getHistoricalData('BTC', 7, 'usd');

      expect(result).toEqual(mockHistoricalData);
      expect(service.getHistoricalData).toHaveBeenCalledWith('BTC', 7, 'usd');
    });

    it('should use default values if not provided', async () => {
      mockMarketDataService.getHistoricalData.mockResolvedValue(mockHistoricalData);

      await controller.getHistoricalData('BTC', undefined, undefined);

      expect(service.getHistoricalData).toHaveBeenCalledWith('BTC', 30, 'usd');
    });
  });

  describe('searchCoins', () => {
    const mockSearchResults = [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    ];

    it('should return search results', async () => {
      mockMarketDataService.searchCoins.mockResolvedValue(mockSearchResults);

      const result = await controller.searchCoins('bit', 5);

      expect(result).toEqual(mockSearchResults);
      expect(service.searchCoins).toHaveBeenCalledWith('bit', 5);
    });

    it('should use default limit if not provided', async () => {
      mockMarketDataService.searchCoins.mockResolvedValue(mockSearchResults);

      await controller.searchCoins('bit', undefined);

      expect(service.searchCoins).toHaveBeenCalledWith('bit', 10);
    });
  });

  describe('getTopCoins', () => {
    it('should return top coins', async () => {
      mockMarketDataService.getTopCoins.mockResolvedValue(mockCoinData);

      const result = await controller.getTopCoins(50, 'usd');

      expect(result).toEqual(mockCoinData);
      expect(service.getTopCoins).toHaveBeenCalledWith(50, 'usd');
    });

    it('should use default values if not provided', async () => {
      mockMarketDataService.getTopCoins.mockResolvedValue(mockCoinData);

      await controller.getTopCoins(undefined, undefined);

      expect(service.getTopCoins).toHaveBeenCalledWith(100, 'usd');
    });
  });
});