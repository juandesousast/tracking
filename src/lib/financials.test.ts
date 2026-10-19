import { describe, it, expect } from 'vitest';
import {
  calculateTotalExpenses,
  calculateNetWithdrawals,
  calculateGrossWithdrawals,
  calculateTotalFees,
  calculateNetProfit,
  calculateROI,
  calculateFinancialSummary,
  calculateFirmFinancialSummaries,
  getMonthlyTimelineData,
  getGlobalTimelineData,
  filterTransactions,
  calculatePeriodComparison,
  getDailyPnLMap,
  getMonthPnLSummary,
} from './financials';
import { formatCurrency, formatPercent, formatNumber } from './formatters';
import { Expense, Withdrawal, PropFirm, Account } from '../types/database';

describe('Formatters es-ES', () => {
  describe('formatCurrency', () => {
    it('should format currency in es-ES format with group separators and 2 decimal places', () => {
      const formatted = formatCurrency(1234.56, 'EUR');
      expect(formatted).toMatch(/1\.234,56\s*€/);
    });

    it('should handle non-number or defensive values gracefully', () => {
      // @ts-expect-error testing defensive check
      expect(formatCurrency(null)).toMatch(/0,00\s*€/);
      // @ts-expect-error testing defensive check
      expect(formatCurrency(undefined)).toMatch(/0,00\s*€/);
      expect(formatCurrency(NaN)).toMatch(/0,00\s*€/);
    });
  });

  describe('formatPercent', () => {
    it('should format percentage value 326.84 as 326,84 %', () => {
      const formatted = formatPercent(326.84);
      expect(formatted).toMatch(/326,84\s*%/);
    });

    it('should handle negative percentages', () => {
      const formatted = formatPercent(-50);
      expect(formatted).toMatch(/-50,00\s*%/);
    });

    it('should handle non-number input gracefully', () => {
      // @ts-expect-error testing defensive check
      expect(formatPercent(null)).toMatch(/0,00\s*%/);
      expect(formatPercent(NaN)).toMatch(/0,00\s*%/);
    });
  });
});


describe('Financial Calculations', () => {
  describe('calculateTotalExpenses', () => {
    it('should calculate the total of expenses correctly', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          amount: 50,
          category: 'Fee',
          description: null,
          date: '2026-01-01',
          created_at: '2026-01-01',
        },
        {
          id: '2',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a2',
          amount: 150,
          category: 'Reset',
          description: null,
          date: '2026-01-02',
          created_at: '2026-01-02',
        },
      ];

      expect(calculateTotalExpenses(expenses)).toBe(200);
    });

    it('should return 0 when there are no expenses', () => {
      expect(calculateTotalExpenses([])).toBe(0);
    });
  });

  describe('calculateNetWithdrawals', () => {
    it('should calculate net withdrawals as gross_amount - fee_amount for each item', () => {
      const withdrawals: Withdrawal[] = [
        {
          id: 'w1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          gross_amount: 1000,
          fee_amount: 50,
          net_amount: 950,
          status: 'completed',
          date: '2026-01-05',
          created_at: '2026-01-05',
        },
        {
          id: 'w2',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          gross_amount: 500,
          fee_amount: 20,
          net_amount: 480,
          status: 'completed',
          date: '2026-01-10',
          created_at: '2026-01-10',
        },
      ];

      expect(calculateNetWithdrawals(withdrawals)).toBe(1430);
    });

    it('should return 0 when there are no withdrawals', () => {
      expect(calculateNetWithdrawals([])).toBe(0);
    });
  });

  describe('calculateGrossWithdrawals and calculateTotalFees', () => {
    it('should sum gross amounts and fee amounts correctly', () => {
      const withdrawals: Withdrawal[] = [
        {
          id: 'w1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          gross_amount: 1000,
          fee_amount: 50,
          net_amount: 950,
          status: 'completed',
          date: '2026-01-05',
          created_at: '2026-01-05',
        },
      ];

      expect(calculateGrossWithdrawals(withdrawals)).toBe(1000);
      expect(calculateTotalFees(withdrawals)).toBe(50);
    });
  });

  describe('calculateNetProfit', () => {
    it('should calculate Net Profit as Net Withdrawals - Total Expenses', () => {
      expect(calculateNetProfit(150, 100)).toBe(50);
      expect(calculateNetProfit(50, 100)).toBe(-50);
    });
  });

  describe('calculateROI', () => {
    it('should calculate 50% ROI when expenses are $100 and net withdrawals are $150', () => {
      expect(calculateROI(150, 100)).toBe(50);
    });

    it('should calculate -50% ROI when expenses are $100 and net withdrawals are $50', () => {
      expect(calculateROI(50, 100)).toBe(-50);
    });

    it('should return 0% ROI when expenses are $0 to avoid division by zero / NaN', () => {
      expect(calculateROI(100, 0)).toBe(0);
      expect(calculateROI(0, 0)).toBe(0);
    });
  });

  describe('calculateFinancialSummary', () => {
    it('should generate a complete financial summary', () => {
      const expenses: Expense[] = [
        {
          id: 'e1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          amount: 100,
          category: 'Evaluation',
          description: null,
          date: '2026-01-01',
          created_at: '2026-01-01',
        },
      ];
      const withdrawals: Withdrawal[] = [
        {
          id: 'w1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          gross_amount: 200,
          fee_amount: 10,
          net_amount: 190,
          status: 'completed',
          date: '2026-01-10',
          created_at: '2026-01-10',
        },
      ];

      const summary = calculateFinancialSummary(expenses, withdrawals);
      expect(summary).toEqual({
        totalExpenses: 100,
        grossWithdrawals: 200,
        totalFees: 10,
        netWithdrawals: 190,
        netProfit: 90,
        roiPercentage: 90,
      });
    });
  });

  describe('calculateFirmFinancialSummaries', () => {
    it('should group expenses and withdrawals by firm_id correctly', () => {
      const firms: PropFirm[] = [
        { id: 'f1', user_id: 'u1', name: 'Apex', website: null, created_at: '2026-01-01' },
        { id: 'f2', user_id: 'u1', name: 'FTMO', website: null, created_at: '2026-01-01' },
      ];

      const accounts: Account[] = [
        { id: 'a1', user_id: 'u1', firm_id: 'f1', account_size: 50000, account_type: 'eval', status: 'active', created_at: '2026-01-01' },
        { id: 'a2', user_id: 'u1', firm_id: 'f1', account_size: 50000, account_type: 'funded', status: 'active', created_at: '2026-01-01' },
        { id: 'a3', user_id: 'u1', firm_id: 'f2', account_size: 100000, account_type: 'eval', status: 'active', created_at: '2026-01-01' },
      ];

      const expenses: Expense[] = [
        { id: 'e1', user_id: 'u1', firm_id: 'f1', account_id: 'a1', amount: 100, category: 'Fee', description: null, date: '2026-01-01', created_at: '2026-01-01' },
        { id: 'e2', user_id: 'u1', firm_id: 'f2', account_id: 'a3', amount: 200, category: 'Fee', description: null, date: '2026-01-01', created_at: '2026-01-01' },
      ];

      const withdrawals: Withdrawal[] = [
        { id: 'w1', user_id: 'u1', firm_id: 'f1', account_id: 'a1', gross_amount: 300, fee_amount: 0, net_amount: 300, status: 'completed', date: '2026-01-05', created_at: '2026-01-05' },
      ];

      const result = calculateFirmFinancialSummaries(firms, accounts, expenses, withdrawals);

      expect(result).toHaveLength(2);

      const apexSummary = result.find((r) => r.firmId === 'f1');
      expect(apexSummary).toBeDefined();
      expect(apexSummary?.firmName).toBe('Apex');
      expect(apexSummary?.accountCount).toBe(2);
      expect(apexSummary?.summary.totalExpenses).toBe(100);
      expect(apexSummary?.summary.netWithdrawals).toBe(300);
      expect(apexSummary?.summary.netProfit).toBe(200);
      expect(apexSummary?.summary.roiPercentage).toBe(200);

      const ftmoSummary = result.find((r) => r.firmId === 'f2');
      expect(ftmoSummary).toBeDefined();
      expect(ftmoSummary?.firmName).toBe('FTMO');
      expect(ftmoSummary?.accountCount).toBe(1);
      expect(ftmoSummary?.summary.totalExpenses).toBe(200);
      expect(ftmoSummary?.summary.netWithdrawals).toBe(0);
      expect(ftmoSummary?.summary.netProfit).toBe(-200);
      expect(ftmoSummary?.summary.roiPercentage).toBe(-100);
    });
  });

  describe('getMonthlyTimelineData', () => {
    it('should aggregate expenses, net withdrawals, and net profit by month', () => {
      const expenses: Expense[] = [
        {
          id: 'e1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          amount: 100,
          category: 'Fee',
          description: null,
          date: '2026-01-15',
          created_at: '2026-01-15',
        },
        {
          id: 'e2',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          amount: 50,
          category: 'Reset',
          description: null,
          date: '2026-01-20',
          created_at: '2026-01-20',
        },
        {
          id: 'e3',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          amount: 200,
          category: 'Fee',
          description: null,
          date: '2026-02-10',
          created_at: '2026-02-10',
        },
      ];

      const withdrawals: Withdrawal[] = [
        {
          id: 'w1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          gross_amount: 500,
          fee_amount: 20,
          net_amount: 480,
          status: 'completed',
          date: '2026-01-25',
          created_at: '2026-01-25',
        },
        {
          id: 'w2',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          gross_amount: 300,
          fee_amount: 0,
          net_amount: 300,
          status: 'completed',
          date: '2026-02-15',
          created_at: '2026-02-15',
        },
      ];

      const monthlyData = getMonthlyTimelineData(expenses, withdrawals);

      expect(monthlyData).toHaveLength(2);
      expect(monthlyData[0]).toEqual({
        date: '2026-01',
        displayDate: expect.any(String),
        totalExpenses: 150,
        netWithdrawals: 480,
        netProfit: 330,
      });
      expect(monthlyData[1]).toEqual({
        date: '2026-02',
        displayDate: expect.any(String),
        totalExpenses: 200,
        netWithdrawals: 300,
        netProfit: 100,
      });
    });

    it('should return empty array if no transactions are provided', () => {
      expect(getMonthlyTimelineData([], [])).toEqual([]);
    });
  });

  describe('getGlobalTimelineData', () => {
    it('should aggregate cumulative financial figures chronologically', () => {
      const expenses: Expense[] = [
        {
          id: 'e1',
          user_id: 'u1',
          firm_id: 'f1',
          account_id: 'a1',
          amount: 100,
          category: 'Fee',
          description: null,
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
          gross_amount: 250,
          fee_amount: 10,
          net_amount: 240,
          status: 'completed',
          date: '2026-01-20',
          created_at: '2026-01-20',
        },
      ];

      const globalData = getGlobalTimelineData(expenses, withdrawals);

      expect(globalData).toHaveLength(2);
      expect(globalData[0].totalExpenses).toBe(100);
      expect(globalData[0].netWithdrawals).toBe(0);
      expect(globalData[0].netProfit).toBe(-100);

      expect(globalData[1].totalExpenses).toBe(100);
      expect(globalData[1].netWithdrawals).toBe(240);
      expect(globalData[1].netProfit).toBe(140);
    });
  });

  describe('filterTransactions and calculatePeriodComparison', () => {
    const sampleExpenses: Expense[] = [
      {
        id: 'e1',
        user_id: 'u1',
        firm_id: 'f1',
        account_id: 'a1',
        amount: 100,
        category: 'Fee',
        description: null,
        date: '2026-01-10',
        created_at: '2026-01-10',
      },
      {
        id: 'e2',
        user_id: 'u1',
        firm_id: 'f2',
        account_id: 'a2',
        amount: 200,
        category: 'Reset',
        description: null,
        date: '2026-01-15',
        created_at: '2026-01-15',
      },
      {
        id: 'e3',
        user_id: 'u1',
        firm_id: 'f1',
        account_id: 'a1',
        amount: 150,
        category: 'Fee',
        description: null,
        date: '2026-02-05',
        created_at: '2026-02-05',
      },
    ];

    const sampleWithdrawals: Withdrawal[] = [
      {
        id: 'w1',
        user_id: 'u1',
        firm_id: 'f1',
        account_id: 'a1',
        gross_amount: 500,
        fee_amount: 20,
        net_amount: 480,
        status: 'completed',
        date: '2026-01-20',
        created_at: '2026-01-20',
      },
      {
        id: 'w2',
        user_id: 'u1',
        firm_id: 'f2',
        account_id: 'a2',
        gross_amount: 1000,
        fee_amount: 50,
        net_amount: 950,
        status: 'completed',
        date: '2026-01-25',
        created_at: '2026-01-25',
      },
      {
        id: 'w3',
        user_id: 'u1',
        firm_id: 'f1',
        account_id: 'a1',
        gross_amount: 600,
        fee_amount: 30,
        net_amount: 570,
        status: 'completed',
        date: '2026-02-10',
        created_at: '2026-02-10',
      },
    ];

    describe('filterTransactions', () => {
      it('should return all transactions when options are empty or "all"', () => {
        const result = filterTransactions(sampleExpenses, sampleWithdrawals, {});
        expect(result.expenses).toHaveLength(3);
        expect(result.withdrawals).toHaveLength(3);
      });

      it('should filter transactions by date range', () => {
        const result = filterTransactions(sampleExpenses, sampleWithdrawals, {
          startDate: '2026-01-01',
          endDate: '2026-01-31',
        });
        expect(result.expenses.map((e: Expense) => e.id)).toEqual(['e1', 'e2']);
        expect(result.withdrawals.map((w: Withdrawal) => w.id)).toEqual(['w1', 'w2']);
      });

      it('should filter transactions by firmId', () => {
        const result = filterTransactions(sampleExpenses, sampleWithdrawals, {
          firmId: 'f1',
        });
        expect(result.expenses.map((e: Expense) => e.id)).toEqual(['e1', 'e3']);
        expect(result.withdrawals.map((w: Withdrawal) => w.id)).toEqual(['w1', 'w3']);
      });
    });

    describe('calculatePeriodComparison', () => {
      it('should compare current period vs previous equivalent period', () => {
        const result = calculatePeriodComparison(
          sampleExpenses,
          sampleWithdrawals,
          '2026-02-01',
          '2026-02-28'
        );

        expect(result.currentSummary.netProfit).toBe(420);
        expect(result.previousSummary.netProfit).toBe(1130);
        expect(result.netProfitChangePercent).toBeCloseTo(-62.83, 1);
      });
    });
  });

  describe('Financial Calendar Daily & Monthly PnL', () => {
    describe('getDailyPnLMap', () => {
      it('should group expenses and withdrawals across multiple distinct days and on the same day', () => {
        const expenses: Expense[] = [
          {
            id: 'e1',
            user_id: 'u1',
            firm_id: 'f1',
            account_id: 'a1',
            amount: 100,
            category: 'Fee',
            description: null,
            date: '2026-03-01',
            created_at: '2026-03-01',
          },
          {
            id: 'e2',
            user_id: 'u1',
            firm_id: 'f1',
            account_id: 'a1',
            amount: 50,
            category: 'Reset',
            description: null,
            date: '2026-03-01',
            created_at: '2026-03-01',
          },
          {
            id: 'e3',
            user_id: 'u1',
            firm_id: 'f1',
            account_id: 'a1',
            amount: 200,
            category: 'Fee',
            description: null,
            date: '2026-03-02',
            created_at: '2026-03-02',
          },
        ];

        const withdrawals: Withdrawal[] = [
          {
            id: 'w1',
            user_id: 'u1',
            firm_id: 'f1',
            account_id: 'a1',
            gross_amount: 500,
            fee_amount: 20,
            net_amount: 480,
            status: 'completed',
            date: '2026-03-01',
            created_at: '2026-03-01',
          },
          {
            id: 'w2',
            user_id: 'u1',
            firm_id: 'f1',
            account_id: 'a1',
            gross_amount: 300,
            fee_amount: 10,
            net_amount: 290,
            status: 'completed',
            date: '2026-03-03',
            created_at: '2026-03-03',
          },
        ];

        const map = getDailyPnLMap(expenses, withdrawals);

        expect(map.size).toBe(3);

        // Day 2026-03-01: Expenses: 100 + 50 = 150. Withdrawals: 480. Net: 330. TxCount: 3
        const day1 = map.get('2026-03-01');
        expect(day1).toBeDefined();
        expect(day1?.date).toBe('2026-03-01');
        expect(day1?.totalExpenses).toBe(150);
        expect(day1?.totalWithdrawals).toBe(480);
        expect(day1?.netProfit).toBe(330);
        expect(day1?.txCount).toBe(3);
        expect(day1?.expenses).toHaveLength(2);
        expect(day1?.withdrawals).toHaveLength(1);

        // Day 2026-03-02: Only expenses: 200. Withdrawals: 0. Net: -200. TxCount: 1
        const day2 = map.get('2026-03-02');
        expect(day2).toBeDefined();
        expect(day2?.date).toBe('2026-03-02');
        expect(day2?.totalExpenses).toBe(200);
        expect(day2?.totalWithdrawals).toBe(0);
        expect(day2?.netProfit).toBe(-200);
        expect(day2?.txCount).toBe(1);
        expect(day2?.expenses).toHaveLength(1);
        expect(day2?.withdrawals).toHaveLength(0);

        // Day 2026-03-03: Only withdrawals: 290. Expenses: 0. Net: 290. TxCount: 1
        const day3 = map.get('2026-03-03');
        expect(day3).toBeDefined();
        expect(day3?.date).toBe('2026-03-03');
        expect(day3?.totalExpenses).toBe(0);
        expect(day3?.totalWithdrawals).toBe(290);
        expect(day3?.netProfit).toBe(290);
        expect(day3?.txCount).toBe(1);
      });

      it('should handle fallback calculation when net_amount is not defined on withdrawal', () => {
        const withdrawals: Withdrawal[] = [
          {
            id: 'w1',
            user_id: 'u1',
            firm_id: 'f1',
            account_id: 'a1',
            gross_amount: 1000,
            fee_amount: 50,
            // @ts-expect-error test fallback when net_amount is undefined
            net_amount: undefined,
            status: 'completed',
            date: '2026-03-05',
            created_at: '2026-03-05',
          },
        ];

        const map = getDailyPnLMap([], withdrawals);
        const day = map.get('2026-03-05');
        expect(day).toBeDefined();
        expect(day?.totalWithdrawals).toBe(950);
        expect(day?.netProfit).toBe(950);
      });

      it('should handle ISO date strings with timestamps correctly', () => {
        const expenses: Expense[] = [
          {
            id: 'e1',
            user_id: 'u1',
            firm_id: 'f1',
            account_id: 'a1',
            amount: 75,
            category: 'Fee',
            description: null,
            date: '2026-03-10T14:32:00.000Z',
            created_at: '2026-03-10T14:32:00.000Z',
          },
        ];

        const map = getDailyPnLMap(expenses, []);
        expect(map.has('2026-03-10')).toBe(true);
        expect(map.get('2026-03-10')?.totalExpenses).toBe(75);
      });

      it('should return an empty map when given empty arrays', () => {
        const map = getDailyPnLMap([], []);
        expect(map.size).toBe(0);
      });

      it('should ignore entries without date gracefully', () => {
        const expenses = [
          {
            id: 'e1',
            user_id: 'u1',
            firm_id: 'f1',
            account_id: 'a1',
            amount: 50,
            category: 'Fee',
            description: null,
            date: '',
            created_at: '2026-03-01',
          },
        ] as Expense[];

        const map = getDailyPnLMap(expenses, []);
        expect(map.size).toBe(0);
      });
    });

    describe('getMonthPnLSummary', () => {
      it('should calculate green days, red days, breakeven days, totalNet and winRateDaysPercent', () => {
        const expenses: Expense[] = [
          // Day 1: net = +300 (green)
          { id: 'e1', user_id: 'u1', firm_id: 'f1', account_id: 'a1', amount: 100, category: 'Fee', description: null, date: '2026-04-01', created_at: '2026-04-01' },
          // Day 2: net = -150 (red)
          { id: 'e2', user_id: 'u1', firm_id: 'f1', account_id: 'a1', amount: 150, category: 'Fee', description: null, date: '2026-04-02', created_at: '2026-04-02' },
          // Day 3: net = 0 (breakeven with transactions)
          { id: 'e3', user_id: 'u1', firm_id: 'f1', account_id: 'a1', amount: 80, category: 'Fee', description: null, date: '2026-04-03', created_at: '2026-04-03' },
          // Day 4: net = +200 (green)
          { id: 'e4', user_id: 'u1', firm_id: 'f1', account_id: 'a1', amount: 50, category: 'Fee', description: null, date: '2026-04-04', created_at: '2026-04-04' },
          // Different month (May 2026) - should not be included in April summary
          { id: 'e5', user_id: 'u1', firm_id: 'f1', account_id: 'a1', amount: 999, category: 'Fee', description: null, date: '2026-05-01', created_at: '2026-05-01' },
        ];

        const withdrawals: Withdrawal[] = [
          // Day 1: gross 400, fee 0 -> net 400. PnL = 400 - 100 = +300 (Green)
          { id: 'w1', user_id: 'u1', firm_id: 'f1', account_id: 'a1', gross_amount: 400, fee_amount: 0, net_amount: 400, status: 'completed', date: '2026-04-01', created_at: '2026-04-01' },
          // Day 3: gross 80, fee 0 -> net 80. PnL = 80 - 80 = 0 (Breakeven)
          { id: 'w2', user_id: 'u1', firm_id: 'f1', account_id: 'a1', gross_amount: 80, fee_amount: 0, net_amount: 80, status: 'completed', date: '2026-04-03', created_at: '2026-04-03' },
          // Day 4: gross 250, fee 0 -> net 250. PnL = 250 - 50 = +200 (Green)
          { id: 'w3', user_id: 'u1', firm_id: 'f1', account_id: 'a1', gross_amount: 250, fee_amount: 0, net_amount: 250, status: 'completed', date: '2026-04-04', created_at: '2026-04-04' },
        ];

        const dailyMap = getDailyPnLMap(expenses, withdrawals);
        const summary = getMonthPnLSummary(dailyMap, 2026, 4);

        // April active days:
        // 2026-04-01: +300 (green)
        // 2026-04-02: -150 (red)
        // 2026-04-03: 0 (breakeven)
        // 2026-04-04: +200 (green)
        // totalNet = 300 - 150 + 0 + 200 = 350
        // activeDays = 4
        // greenDaysCount = 2
        // redDaysCount = 1
        // breakevenDaysCount = 1
        // winRateDaysPercent = (2 / 4) * 100 = 50%
        expect(summary.totalNet).toBe(350);
        expect(summary.greenDaysCount).toBe(2);
        expect(summary.redDaysCount).toBe(1);
        expect(summary.breakevenDaysCount).toBe(1);
        expect(summary.winRateDaysPercent).toBe(50);
      });

      it('should calculate 100% win rate when all active days are green', () => {
        const withdrawals: Withdrawal[] = [
          { id: 'w1', user_id: 'u1', firm_id: 'f1', account_id: 'a1', gross_amount: 500, fee_amount: 0, net_amount: 500, status: 'completed', date: '2026-06-01', created_at: '2026-06-01' },
          { id: 'w2', user_id: 'u1', firm_id: 'f1', account_id: 'a1', gross_amount: 300, fee_amount: 0, net_amount: 300, status: 'completed', date: '2026-06-02', created_at: '2026-06-02' },
        ];

        const dailyMap = getDailyPnLMap([], withdrawals);
        const summary = getMonthPnLSummary(dailyMap, 2026, 6);

        expect(summary.totalNet).toBe(800);
        expect(summary.greenDaysCount).toBe(2);
        expect(summary.redDaysCount).toBe(0);
        expect(summary.breakevenDaysCount).toBe(0);
        expect(summary.winRateDaysPercent).toBe(100);
      });

      it('should calculate 0% win rate when all active days are red', () => {
        const expenses: Expense[] = [
          { id: 'e1', user_id: 'u1', firm_id: 'f1', account_id: 'a1', amount: 100, category: 'Fee', description: null, date: '2026-07-01', created_at: '2026-07-01' },
          { id: 'e2', user_id: 'u1', firm_id: 'f1', account_id: 'a1', amount: 200, category: 'Fee', description: null, date: '2026-07-02', created_at: '2026-07-02' },
        ];

        const dailyMap = getDailyPnLMap(expenses, []);
        const summary = getMonthPnLSummary(dailyMap, 2026, 7);

        expect(summary.totalNet).toBe(-300);
        expect(summary.greenDaysCount).toBe(0);
        expect(summary.redDaysCount).toBe(2);
        expect(summary.breakevenDaysCount).toBe(0);
        expect(summary.winRateDaysPercent).toBe(0);
      });

      it('should handle month with zero activity (days without activity)', () => {
        // Daily map has data for another month only
        const expenses: Expense[] = [
          { id: 'e1', user_id: 'u1', firm_id: 'f1', account_id: 'a1', amount: 100, category: 'Fee', description: null, date: '2026-08-15', created_at: '2026-08-15' },
        ];

        const dailyMap = getDailyPnLMap(expenses, []);
        // Query September 2026 (no activity)
        const summary = getMonthPnLSummary(dailyMap, 2026, 9);

        expect(summary.totalNet).toBe(0);
        expect(summary.greenDaysCount).toBe(0);
        expect(summary.redDaysCount).toBe(0);
        expect(summary.breakevenDaysCount).toBe(0);
        expect(summary.winRateDaysPercent).toBe(0);
      });

      it('should not count days with txCount = 0 as breakeven days', () => {
        const dailyMap = new Map();
        // Day with zero transactions manually set
        dailyMap.set('2026-09-01', {
          date: '2026-09-01',
          totalExpenses: 0,
          totalWithdrawals: 0,
          netProfit: 0,
          txCount: 0,
          expenses: [],
          withdrawals: [],
        });

        const summary = getMonthPnLSummary(dailyMap, 2026, 9);
        expect(summary.breakevenDaysCount).toBe(0);
        expect(summary.winRateDaysPercent).toBe(0);
      });
    });
  });
});


