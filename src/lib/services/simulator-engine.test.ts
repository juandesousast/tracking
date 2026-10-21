import { describe, it, expect } from 'vitest';
import {
  getSymbolConfig,
  generateHistoricalCandles,
  calculatePositionPnl,
  calculateRMultiple,
  calculateSessionStats,
  SIMULATOR_SYMBOLS,
} from './simulator-engine';
import { BacktestingPosition } from '@/types/database';

describe('Simulator Engine', () => {
  describe('getSymbolConfig', () => {
    it('returns valid config for known symbols', () => {
      const nas = getSymbolConfig('NAS100');
      expect(nas.value).toBe('NAS100');
      expect(nas.category).toBe('INDEX');
      expect(nas.decimals).toBe(2);

      const eurusd = getSymbolConfig('EUR/USD');
      expect(eurusd.value).toBe('EURUSD');
      expect(eurusd.category).toBe('FOREX');
      expect(eurusd.decimals).toBe(5);
    });

    it('returns default fallback for unknown symbol', () => {
      const custom = getSymbolConfig('CUSTOM_TICKER');
      expect(custom.value).toBe('CUSTOM_TICKER');
      expect(custom.decimals).toBe(2);
    });
  });

  describe('generateHistoricalCandles', () => {
    it('generates deterministic candles for the same parameters', () => {
      const candlesA = generateHistoricalCandles('NAS100', '2024-03-01', '2024-03-05', 60);
      const candlesB = generateHistoricalCandles('NAS100', '2024-03-01', '2024-03-05', 60);

      expect(candlesA.length).toBeGreaterThan(0);
      expect(candlesA.length).toBe(candlesB.length);
      expect(candlesA[0].close).toBe(candlesB[0].close);
      expect(candlesA[0].open).toBe(candlesB[0].open);
    });

    it('ensures each candle has high >= low and valid prices', () => {
      const candles = generateHistoricalCandles('EURUSD', '2024-01-10', '2024-01-12', 60);
      expect(candles.length).toBeGreaterThan(0);

      candles.forEach((c) => {
        expect(c.high).toBeGreaterThanOrEqual(c.low);
        expect(c.high).toBeGreaterThanOrEqual(c.open);
        expect(c.high).toBeGreaterThanOrEqual(c.close);
        expect(c.low).toBeLessThanOrEqual(c.open);
        expect(c.low).toBeLessThanOrEqual(c.close);
      });
    });
  });

  describe('calculatePositionPnl', () => {
    it('calculates BUY profit and loss correctly', () => {
      // NAS100: contractSize 1
      const buyWin = calculatePositionPnl(
        { side: 'BUY', quantity: 2, entry_price: 18000 },
        18050,
        'NAS100'
      );
      expect(buyWin).toBe(100); // (18050 - 18000) * 2 * 1 = 100

      const buyLoss = calculatePositionPnl(
        { side: 'BUY', quantity: 1, entry_price: 18000 },
        17950,
        'NAS100'
      );
      expect(buyLoss).toBe(-50);
    });

    it('calculates SELL profit and loss correctly', () => {
      const sellWin = calculatePositionPnl(
        { side: 'SELL', quantity: 2, entry_price: 18000 },
        17950,
        'NAS100'
      );
      expect(sellWin).toBe(100);

      const sellLoss = calculatePositionPnl(
        { side: 'SELL', quantity: 1, entry_price: 18000 },
        18050,
        'NAS100'
      );
      expect(sellLoss).toBe(-50);
    });
  });

  describe('calculateRMultiple', () => {
    it('calculates accurate R-Multiple on win and loss', () => {
      // Long with SL 20 pts below entry, TP 40 pts above (2R)
      const rWin = calculateRMultiple(18000, 18040, 17980, 'BUY');
      expect(rWin).toBe(2);

      const rLoss = calculateRMultiple(18000, 17980, 17980, 'BUY');
      expect(rLoss).toBe(-1);

      // Short with SL 20 pts above entry, TP 60 pts below (3R)
      const rShortWin = calculateRMultiple(18000, 17940, 18020, 'SELL');
      expect(rShortWin).toBe(3);
    });

    it('returns null if stop loss was not defined', () => {
      expect(calculateRMultiple(18000, 18050, null, 'BUY')).toBeNull();
    });
  });

  describe('calculateSessionStats', () => {
    it('calculates complete session metrics accurately', () => {
      const sampleTrades: BacktestingPosition[] = [
        {
          id: '1',
          session_id: 's1',
          user_id: 'u1',
          symbol: 'NAS100',
          side: 'BUY',
          type: 'MARKET',
          status: 'CLOSED',
          quantity: 1,
          entry_price: 18000,
          exit_price: 18100,
          pnl: 100,
          r_multiple: 2,
          entry_time: '2024-01-01T10:00:00Z',
          exit_time: '2024-01-01T11:00:00Z',
        },
        {
          id: '2',
          session_id: 's1',
          user_id: 'u1',
          symbol: 'NAS100',
          side: 'BUY',
          type: 'MARKET',
          status: 'CLOSED',
          quantity: 1,
          entry_price: 18100,
          exit_price: 18050,
          pnl: -50,
          r_multiple: -1,
          entry_time: '2024-01-01T12:00:00Z',
          exit_time: '2024-01-01T13:00:00Z',
        },
        {
          id: '3',
          session_id: 's1',
          user_id: 'u1',
          symbol: 'NAS100',
          side: 'SELL',
          type: 'MARKET',
          status: 'CLOSED',
          quantity: 1,
          entry_price: 18100,
          exit_price: 18000,
          pnl: 100,
          r_multiple: 2,
          entry_time: '2024-01-01T14:00:00Z',
          exit_time: '2024-01-01T15:00:00Z',
        },
      ];

      const stats = calculateSessionStats(sampleTrades, 10000);

      expect(stats.netPnl).toBe(150); // 100 - 50 + 100
      expect(stats.winningCount).toBe(2);
      expect(stats.losingCount).toBe(1);
      expect(stats.winRate).toBe(66.7);
      expect(stats.profitFactor).toBe(4); // 200 / 50
      expect(stats.avgR).toBe(1); // (2 - 1 + 2) / 3 = 1
      expect(stats.curve.length).toBe(4); // initial + 3 trades
      expect(stats.curve[3].balance).toBe(10150);
    });
  });
});
