import { describe, it, expect } from 'vitest';
import {
  calculatePositionSize,
  calculateConsistencyRule,
  calculateDrawdownBuffer,
  INSTRUMENT_SPECS,
} from './trading-calculators';

describe('Trading Calculators', () => {
  describe('calculatePositionSize', () => {
    it('calculates contracts accurately for MNQ (Micro Nasdaq)', () => {
      // 50 points stop in MNQ ($2/pt) = $100 per contract risk
      // Target risk = $300 => 3 contracts
      const res = calculatePositionSize({
        accountBalance: 50000,
        riskAmount: 300,
        entryPrice: 18000,
        stopLossPrice: 17950,
        symbol: 'MNQ',
      });

      expect(res.stopDistancePoints).toBe(50);
      expect(res.stopDistanceTicks).toBe(200);
      expect(res.perContractRisk).toBe(100);
      expect(res.contracts).toBe(3);
      expect(res.actualRiskDollars).toBe(300);
    });

    it('calculates contracts accurately for ES (E-mini S&P 500)', () => {
      // 10 points stop in ES ($50/pt) = $500 per contract
      // Target risk = $1000 => 2 contracts
      const res = calculatePositionSize({
        accountBalance: 100000,
        riskAmount: 1000,
        entryPrice: 5800,
        stopLossPrice: 5790,
        symbol: 'ES',
      });

      expect(res.stopDistancePoints).toBe(10);
      expect(res.perContractRisk).toBe(500);
      expect(res.contracts).toBe(2);
      expect(res.actualRiskDollars).toBe(1000);
    });

    it('calculates risk based on account percentage', () => {
      // 1% of 50,000 = $500 risk
      const res = calculatePositionSize({
        accountBalance: 50000,
        riskPercent: 1.0,
        entryPrice: 18000,
        stopLossPrice: 17950,
        symbol: 'MNQ',
      });

      expect(res.riskDollars).toBe(500);
      expect(res.contracts).toBe(5);
    });

    it('handles zero distance between entry and stop gracefully', () => {
      const res = calculatePositionSize({
        accountBalance: 50000,
        riskAmount: 200,
        entryPrice: 18000,
        stopLossPrice: 18000,
        symbol: 'MNQ',
      });

      expect(res.stopDistancePoints).toBe(0);
      expect(res.contracts).toBe(0);
      expect(res.actualRiskDollars).toBe(0);
      expect(res.isRiskExceeded).toBe(false);
    });

    it('identifies when risk is exceeded for even 1 contract and suggests micro contracts', () => {
      // NQ: 10 points = 40 ticks = $200 risk per contract.
      // Target risk = $100 => 1 contract of NQ is $200 (exceeds $100)
      const res = calculatePositionSize({
        accountBalance: 50000,
        riskAmount: 100,
        entryPrice: 20000,
        stopLossPrice: 19990,
        symbol: 'NQ',
      });

      expect(res.perContractRisk).toBe(200);
      expect(res.contracts).toBe(0);
      expect(res.isRiskExceeded).toBe(true);
      // For MNQ (Micro), 10 pts = $20 per contract. $100 / $20 = 5 contracts
      expect(res.microContracts).toBe(5);
    });
  });

  describe('calculateConsistencyRule', () => {
    it('evaluates rule compliance under 30% threshold (Apex/Topstep)', () => {
      // Total = 4000, Best day = 1000 (25%) -> Eligible
      const res = calculateConsistencyRule([1000, 800, 900, 700, 600], 30);
      expect(res.totalProfit).toBe(4000);
      expect(res.bestDayProfit).toBe(1000);
      expect(res.bestDayPercent).toBe(25);
      expect(res.isEligible).toBe(true);
      expect(res.neededAdditionalProfit).toBe(0);
    });

    it('identifies breach and calculates needed additional profit', () => {
      // Total = 2000, Best day = 1200 (60%) -> Ineligible
      // For 1200 to be 30%, needed total = 1200 / 0.3 = 4000 => needed +2000
      const res = calculateConsistencyRule([1200, 400, 400], 30);
      expect(res.bestDayPercent).toBe(60);
      expect(res.isEligible).toBe(false);
      expect(res.neededTotalProfit).toBe(4000);
      expect(res.neededAdditionalProfit).toBe(2000);
    });

    it('marks accounts with zero or negative total profit as ineligible', () => {
      const zeroProfitRes = calculateConsistencyRule([0, 0, 0], 30);
      expect(zeroProfitRes.totalProfit).toBe(0);
      expect(zeroProfitRes.isEligible).toBe(false);

      const negativeProfitRes = calculateConsistencyRule([-200, -500], 30);
      expect(negativeProfitRes.totalProfit).toBe(0);
      expect(negativeProfitRes.isEligible).toBe(false);
    });
  });

  describe('calculateDrawdownBuffer', () => {
    it('calculates remaining buffer from high water mark', () => {
      const res = calculateDrawdownBuffer({
        currentBalance: 51000,
        highWaterMark: 52000,
        maxDrawdownLimit: 2500,
        isTrailing: true,
      });

      // Peak = 52000, Liquidation = 52000 - 2500 = 49500
      // Current = 51000, Remaining = 51000 - 49500 = 1500
      expect(res.liquidationThreshold).toBe(49500);
      expect(res.remainingBuffer).toBe(1500);
      expect(res.bufferPercent).toBe(60);
      expect(res.isBreached).toBe(false);
    });

    it('detects breach if balance touches or drops below threshold', () => {
      const res = calculateDrawdownBuffer({
        currentBalance: 49400,
        highWaterMark: 52000,
        maxDrawdownLimit: 2500,
        isTrailing: true,
      });

      expect(res.isBreached).toBe(true);
      expect(res.remainingBuffer).toBeLessThan(0);
    });

    it('locks trailing liquidation threshold at initialBalance when peak exceeds buffer threshold', () => {
      // 50k account, 2500 max DD.
      // High water mark reaches 54000. Trailing threshold would normally be 54000 - 2500 = 51500.
      // But with lockAtInitialBalance (default with initialBalance: 50000), it locks at 50000!
      const res = calculateDrawdownBuffer({
        currentBalance: 53000,
        highWaterMark: 54000,
        maxDrawdownLimit: 2500,
        isTrailing: true,
        initialBalance: 50000,
        lockAtInitialBalance: true,
      });

      expect(res.isLockedAtInitial).toBe(true);
      expect(res.liquidationThreshold).toBe(50000);
      expect(res.remainingBuffer).toBe(3000); // 53000 - 50000
    });

    it('locks at initialBalance + lockBufferDollars (e.g. Apex +$100)', () => {
      const res = calculateDrawdownBuffer({
        currentBalance: 53500,
        highWaterMark: 54000,
        maxDrawdownLimit: 2500,
        isTrailing: true,
        initialBalance: 50000,
        lockAtInitialBalance: true,
        lockBufferDollars: 100,
      });

      expect(res.isLockedAtInitial).toBe(true);
      expect(res.liquidationThreshold).toBe(50100);
      expect(res.remainingBuffer).toBe(3400); // 53500 - 50100
    });
  });
});
