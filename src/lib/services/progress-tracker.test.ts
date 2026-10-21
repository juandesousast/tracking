import { describe, it, expect } from 'vitest';
import {
  getDefaultEvaluationSpecs,
  calculateAccountEvaluationProgress,
} from './progress-tracker';
import { Account, Expense, Withdrawal } from '@/types/database';

describe('Progress Tracker Service', () => {
  describe('getDefaultEvaluationSpecs', () => {
    it('returns official Topstep 50k specs', () => {
      const specs = getDefaultEvaluationSpecs(50000, 'Topstep');
      expect(specs.profitTarget).toBe(3000);
      expect(specs.maxDrawdown).toBe(2000);
      expect(specs.minTradingDays).toBe(2);
      expect(specs.consistencyPercent).toBe(50);
    });

    it('returns official Apex 50k specs', () => {
      const specs = getDefaultEvaluationSpecs(50000, 'Apex Trader Funding');
      expect(specs.profitTarget).toBe(3000);
      expect(specs.maxDrawdown).toBe(2500);
      expect(specs.minTradingDays).toBe(1);
      expect(specs.consistencyPercent).toBe(30);
    });

    it('returns official FTMO 100k specs', () => {
      const specs = getDefaultEvaluationSpecs(100000, 'FTMO');
      expect(specs.profitTarget).toBe(10000);
      expect(specs.maxDrawdown).toBe(10000);
      expect(specs.minTradingDays).toBe(4);
    });
  });

  describe('calculateAccountEvaluationProgress', () => {
    const mockAccount: Account = {
      id: 'acc-1',
      user_id: 'user-1',
      firm_id: 'firm-topstep',
      account_size: 50000,
      account_type: 'evaluation',
      status: 'evaluation',
      alias: 'Topstep 50K #1',
      account_number: 'TS-99881',
      created_at: '2026-01-01',
    };

    it('identifies an account in progress', () => {
      const withdrawals: Withdrawal[] = [
        {
          id: 'w1',
          user_id: 'user-1',
          firm_id: 'firm-topstep',
          account_id: 'acc-1',
          gross_amount: 1500,
          fee_amount: 0,
          net_amount: 1500,
          status: 'completed',
          date: '2026-03-01',
          created_at: '2026-03-01',
        },
      ];

      const progress = calculateAccountEvaluationProgress(
        mockAccount,
        'Topstep',
        [],
        withdrawals
      );

      expect(progress.currentProfit).toBe(1500);
      expect(progress.targetProgressPercent).toBe(50);
      expect(progress.profitRemaining).toBe(1500);
      expect(progress.tradingDaysCompleted).toBe(1);
      expect(progress.isReadyToPass).toBe(false);
      expect(progress.missingRequirements.length).toBeGreaterThan(0);
    });

    it('identifies an account ready to pass when target and rules are satisfied', () => {
      const withdrawals: Withdrawal[] = [
        {
          id: 'w1',
          user_id: 'user-1',
          firm_id: 'firm-topstep',
          account_id: 'acc-1',
          gross_amount: 1500,
          fee_amount: 0,
          net_amount: 1500,
          status: 'completed',
          date: '2026-03-01',
          created_at: '2026-03-01',
        },
        {
          id: 'w2',
          user_id: 'user-1',
          firm_id: 'firm-topstep',
          account_id: 'acc-1',
          gross_amount: 1500,
          fee_amount: 0,
          net_amount: 1500,
          status: 'completed',
          date: '2026-03-02',
          created_at: '2026-03-02',
        },
      ];

      const progress = calculateAccountEvaluationProgress(
        mockAccount,
        'Topstep',
        [],
        withdrawals
      );

      // Total = 3000, Best Day = 1500 (50.0%), meets 50% consistency rule
      expect(progress.currentProfit).toBe(3000);
      expect(progress.targetProgressPercent).toBe(100);
      expect(progress.profitRemaining).toBe(0);
      expect(progress.tradingDaysCompleted).toBe(2);
      expect(progress.tradingDaysPassed).toBe(true);
      expect(progress.bestDayPercentage).toBe(50);
      expect(progress.consistencyPassed).toBe(true);
      expect(progress.isReadyToPass).toBe(true);
      expect(progress.missingRequirements.length).toBe(0);
    });

    it('identifies consistency rule violation', () => {
      const withdrawals: Withdrawal[] = [
        {
          id: 'w1',
          user_id: 'user-1',
          firm_id: 'firm-topstep',
          account_id: 'acc-1',
          gross_amount: 2500,
          fee_amount: 0,
          net_amount: 2500,
          status: 'completed',
          date: '2026-03-01',
          created_at: '2026-03-01',
        },
        {
          id: 'w2',
          user_id: 'user-1',
          firm_id: 'firm-topstep',
          account_id: 'acc-1',
          gross_amount: 600,
          fee_amount: 0,
          net_amount: 600,
          status: 'completed',
          date: '2026-03-02',
          created_at: '2026-03-02',
        },
      ];

      const progress = calculateAccountEvaluationProgress(
        mockAccount,
        'Topstep',
        [],
        withdrawals
      );

      // Total = 3100, Best Day = 2500 (80.6%), consistency rule limit is 50%
      expect(progress.consistencyPassed).toBe(false);
      expect(progress.isReadyToPass).toBe(false);
      expect(
        progress.missingRequirements.some((r) => r.includes('consistencia'))
      ).toBe(true);
    });

    it('flags breached status when balance drops below trailing drawdown threshold', () => {
      const expenses: Expense[] = [
        {
          id: 'e1',
          user_id: 'user-1',
          firm_id: 'firm-topstep',
          account_id: 'acc-1',
          amount: 2100,
          category: 'other',
          description: 'Loss',
          date: '2026-03-01',
          created_at: '2026-03-01',
        },
      ];

      const progress = calculateAccountEvaluationProgress(
        mockAccount,
        'Topstep',
        expenses,
        []
      );

      // Initial 50,000 - 2,000 max drawdown = 48,000 liquidation threshold.
      // Current balance = 50,000 - 2,100 = 47,900 <= 48,000 -> Breached!
      expect(progress.drawdownStatus).toBe('breached');
      expect(progress.drawdownBuffer).toBe(0);
      expect(progress.isReadyToPass).toBe(false);
    });
  });
});
