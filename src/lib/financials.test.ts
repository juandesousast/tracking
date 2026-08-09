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
});

