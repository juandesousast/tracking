import { describe, it, expect } from 'vitest';
import {
  analyzePortfolioCapital,
  calculateDiversificationScore,
} from './portfolio-radar';
import { Account, PropFirm, Expense, Withdrawal } from '@/types/database';

describe('Portfolio Radar Service', () => {
  describe('calculateDiversificationScore', () => {
    it('returns 100 for empty or balanced distribution', () => {
      expect(calculateDiversificationScore([])).toBe(100);
      // 5 firms with 20% each: HHI = 2000 -> (10000 - 2000)/80 = 100
      expect(calculateDiversificationScore([20, 20, 20, 20, 20])).toBe(100);
    });

    it('returns low score for single concentrated firm', () => {
      // 1 firm with 100%
      expect(calculateDiversificationScore([100])).toBe(20);
    });

    it('returns reasonable score for 2 balanced firms', () => {
      // 50% and 50%: HHI = 5000 -> (10000 - 5000)/80 = 62.5 -> 63
      expect(calculateDiversificationScore([50, 50])).toBe(63);
    });
  });

  describe('analyzePortfolioCapital', () => {
    const mockFirms: PropFirm[] = [
      {
        id: 'f1',
        user_id: 'u1',
        name: 'Apex Trader Funding',
        website: 'https://apextraderfunding.com',
        created_at: '2026-01-01',
      },
      {
        id: 'f2',
        user_id: 'u1',
        name: 'Topstep',
        website: 'https://topstep.com',
        created_at: '2026-01-01',
      },
    ];

    const mockAccounts: Account[] = [
      {
        id: 'a1',
        user_id: 'u1',
        firm_id: 'f1',
        account_size: 50000,
        account_type: 'funded',
        status: 'active',
        alias: 'Apex Funded #1',
        created_at: '2026-01-01',
      },
      {
        id: 'a2',
        user_id: 'u1',
        firm_id: 'f1',
        account_size: 50000,
        account_type: 'funded',
        status: 'active',
        alias: 'Apex Funded #2',
        created_at: '2026-01-01',
      },
      {
        id: 'a3',
        user_id: 'u1',
        firm_id: 'f2',
        account_size: 100000,
        account_type: 'evaluation',
        status: 'evaluation',
        alias: 'Topstep 100K Eval',
        created_at: '2026-01-01',
      },
    ];

    it('correctly aggregates funded vs evaluation capital across firms', () => {
      const result = analyzePortfolioCapital(mockAccounts, mockFirms);

      expect(result.totalFundedCapital).toBe(100000); // 2 x 50k
      expect(result.totalEvaluationCapital).toBe(100000); // 1 x 100k
      expect(result.totalCombinedCapital).toBe(200000);
      expect(result.totalFundedAccounts).toBe(2);
      expect(result.totalEvaluationAccounts).toBe(1);
      expect(result.totalAccounts).toBe(3);

      expect(result.firmAllocations.length).toBe(2);
      const apexAlloc = result.firmAllocations.find((f) => f.firmId === 'f1');
      expect(apexAlloc?.fundedCapital).toBe(100000);
      expect(apexAlloc?.percentageOfFundedCapital).toBe(100);

      expect(result.concentrationRiskLevel).toBe('high');
      expect(result.topConcentratedFirm?.firmName).toBe('Apex Trader Funding');
    });

    it('calculates ROI from expenses and withdrawals per firm', () => {
      const expenses: Expense[] = [
        {
          id: 'e1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          amount: 300,
          category: 'activation',
          description: 'PA fee',
          date: '2026-01-10',
          created_at: '2026-01-10',
        },
      ];

      const withdrawals: Withdrawal[] = [
        {
          id: 'w1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          gross_amount: 1500,
          fee_amount: 0,
          net_amount: 1500,
          status: 'completed',
          date: '2026-02-01',
          created_at: '2026-02-01',
        },
      ];

      const result = analyzePortfolioCapital(
        mockAccounts,
        mockFirms,
        expenses,
        withdrawals
      );
      const apexAlloc = result.firmAllocations.find((f) => f.firmId === 'f1');

      expect(apexAlloc?.totalExpenses).toBe(300);
      expect(apexAlloc?.netPayoutsExtracted).toBe(1500);
      // ROI: (1500 - 300) / 300 * 100 = 400%
      expect(apexAlloc?.netROI).toBe(400);
    });
  });
});
