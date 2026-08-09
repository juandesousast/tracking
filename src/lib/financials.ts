import { Expense, Withdrawal, FinancialSummary, FirmFinancialSummary, PropFirm, Account } from '../types/database';

/**
 * Sum total expenses.
 */
export function calculateTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + (expense.amount || 0), 0);
}

/**
 * Sum gross withdrawals amount.
 */
export function calculateGrossWithdrawals(withdrawals: Withdrawal[]): number {
  return withdrawals.reduce((total, w) => total + (w.gross_amount || 0), 0);
}

/**
 * Sum total withdrawal fees.
 */
export function calculateTotalFees(withdrawals: Withdrawal[]): number {
  return withdrawals.reduce((total, w) => total + (w.fee_amount || 0), 0);
}

/**
 * Calculate net withdrawals: Sum of (gross_amount - fee_amount).
 */
export function calculateNetWithdrawals(withdrawals: Withdrawal[]): number {
  return withdrawals.reduce((total, w) => {
    const net = (w.gross_amount || 0) - (w.fee_amount || 0);
    return total + net;
  }, 0);
}

/**
 * Calculate net profit: Net Withdrawals - Total Expenses.
 */
export function calculateNetProfit(netWithdrawals: number, totalExpenses: number): number {
  return netWithdrawals - totalExpenses;
}

/**
 * Calculate ROI percentage: ((Net Withdrawals - Total Expenses) / Total Expenses) * 100.
 * Returns 0 if Total Expenses is 0 to prevent division by zero / NaN.
 */
export function calculateROI(netWithdrawals: number, totalExpenses: number): number {
  if (totalExpenses === 0) {
    return 0;
  }
  return ((netWithdrawals - totalExpenses) / totalExpenses) * 100;
}

/**
 * Generate complete FinancialSummary for given expenses and withdrawals.
 */
export function calculateFinancialSummary(
  expenses: Expense[],
  withdrawals: Withdrawal[]
): FinancialSummary {
  const totalExpenses = calculateTotalExpenses(expenses);
  const grossWithdrawals = calculateGrossWithdrawals(withdrawals);
  const totalFees = calculateTotalFees(withdrawals);
  const netWithdrawals = calculateNetWithdrawals(withdrawals);
  const netProfit = calculateNetProfit(netWithdrawals, totalExpenses);
  const roiPercentage = calculateROI(netWithdrawals, totalExpenses);

  return {
    totalExpenses,
    grossWithdrawals,
    totalFees,
    netWithdrawals,
    netProfit,
    roiPercentage,
  };
}

/**
 * Group financial performance by firm (firm_id).
 */
export function calculateFirmFinancialSummaries(
  firms: PropFirm[],
  accounts: Account[],
  expenses: Expense[],
  withdrawals: Withdrawal[]
): FirmFinancialSummary[] {
  return firms.map((firm) => {
    const firmAccounts = accounts.filter((acc) => acc.firm_id === firm.id);
    const accountIds = new Set(firmAccounts.map((acc) => acc.id));

    const firmExpenses = expenses.filter(
      (exp) => exp.firm_id === firm.id || (exp.account_id && accountIds.has(exp.account_id))
    );

    const firmWithdrawals = withdrawals.filter(
      (w) => w.firm_id === firm.id || (w.account_id && accountIds.has(w.account_id))
    );

    const summary = calculateFinancialSummary(firmExpenses, firmWithdrawals);

    return {
      firmId: firm.id,
      firmName: firm.name,
      summary,
      accountCount: firmAccounts.length,
    };
  });
}

export interface TimelineDataPoint {
  date: string;
  displayDate: string;
  totalExpenses: number;
  netWithdrawals: number;
  netProfit: number;
}

/**
 * Group financial performance chronologically by month (YYYY-MM).
 */
export function getMonthlyTimelineData(
  expenses: Expense[],
  withdrawals: Withdrawal[]
): TimelineDataPoint[] {
  type MonthMapValue = {
    totalExpenses: number;
    netWithdrawals: number;
  };

  const monthMap = new Map<string, MonthMapValue>();

  expenses.forEach((e) => {
    if (!e.date) return;
    const monthKey = e.date.slice(0, 7); // YYYY-MM
    const current = monthMap.get(monthKey) || { totalExpenses: 0, netWithdrawals: 0 };
    current.totalExpenses += e.amount || 0;
    monthMap.set(monthKey, current);
  });

  withdrawals.forEach((w) => {
    if (!w.date) return;
    const monthKey = w.date.slice(0, 7); // YYYY-MM
    const net = (w.gross_amount || 0) - (w.fee_amount || 0);
    const current = monthMap.get(monthKey) || { totalExpenses: 0, netWithdrawals: 0 };
    current.netWithdrawals += net;
    monthMap.set(monthKey, current);
  });

  const sortedMonths = Array.from(monthMap.keys()).sort();

  return sortedMonths.map((monthKey) => {
    const data = monthMap.get(monthKey)!;
    const netProfit = data.netWithdrawals - data.totalExpenses;

    const [year, month] = monthKey.split('-');
    let displayDate = monthKey;
    if (year && month) {
      const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      if (!isNaN(dateObj.getTime())) {
        displayDate = dateObj.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }
    }

    return {
      date: monthKey,
      displayDate,
      totalExpenses: data.totalExpenses,
      netWithdrawals: data.netWithdrawals,
      netProfit,
    };
  });
}

/**
 * Group financial performance chronologically by cumulative date (Global / Timeline).
 */
export function getGlobalTimelineData(
  expenses: Expense[],
  withdrawals: Withdrawal[]
): TimelineDataPoint[] {
  type DayMapValue = {
    totalExpenses: number;
    netWithdrawals: number;
  };

  const dayMap = new Map<string, DayMapValue>();

  expenses.forEach((e) => {
    if (!e.date) return;
    const dayKey = e.date.slice(0, 10); // YYYY-MM-DD
    const current = dayMap.get(dayKey) || { totalExpenses: 0, netWithdrawals: 0 };
    current.totalExpenses += e.amount || 0;
    dayMap.set(dayKey, current);
  });

  withdrawals.forEach((w) => {
    if (!w.date) return;
    const dayKey = w.date.slice(0, 10); // YYYY-MM-DD
    const net = (w.gross_amount || 0) - (w.fee_amount || 0);
    const current = dayMap.get(dayKey) || { totalExpenses: 0, netWithdrawals: 0 };
    current.netWithdrawals += net;
    dayMap.set(dayKey, current);
  });

  const sortedDays = Array.from(dayMap.keys()).sort();

  let cumExpenses = 0;
  let cumWithdrawals = 0;

  return sortedDays.map((dayKey) => {
    const data = dayMap.get(dayKey)!;
    cumExpenses += data.totalExpenses;
    cumWithdrawals += data.netWithdrawals;
    const netProfit = cumWithdrawals - cumExpenses;

    const dateObj = new Date(dayKey);
    const displayDate = isNaN(dateObj.getTime())
      ? dayKey
      : dateObj.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });

    return {
      date: dayKey,
      displayDate,
      totalExpenses: cumExpenses,
      netWithdrawals: cumWithdrawals,
      netProfit,
    };
  });
}

export interface FilterOptions {
  startDate?: string | null;
  endDate?: string | null;
  firmId?: string | null;
  accountId?: string | null;
}

/**
 * Filter expenses and withdrawals by optional date range, firmId, and accountId.
 */
export function filterTransactions(
  expenses: Expense[],
  withdrawals: Withdrawal[],
  options: FilterOptions
): { expenses: Expense[]; withdrawals: Withdrawal[] } {
  const { startDate, endDate, firmId, accountId } = options;

  const filteredExpenses = expenses.filter((e) => {
    if (firmId && firmId !== 'all' && e.firm_id !== firmId) return false;
    if (accountId && accountId !== 'all' && e.account_id !== accountId) return false;
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;
    return true;
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (firmId && firmId !== 'all' && w.firm_id !== firmId) return false;
    if (accountId && accountId !== 'all' && w.account_id !== accountId) return false;
    if (startDate && w.date < startDate) return false;
    if (endDate && w.date > endDate) return false;
    return true;
  });

  return { expenses: filteredExpenses, withdrawals: filteredWithdrawals };
}

export interface PeriodComparisonResult {
  currentSummary: FinancialSummary;
  previousSummary: FinancialSummary;
  netProfitChangePercent: number;
  roiChangePercent: number;
  expensesChangePercent: number;
  withdrawalsChangePercent: number;
}

function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return current > 0 ? 100 : -100;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Calculate financial metrics for current period and previous equivalent period.
 */
export function calculatePeriodComparison(
  expenses: Expense[],
  withdrawals: Withdrawal[],
  startDate?: string | null,
  endDate?: string | null,
  firmId?: string | null,
  accountId?: string | null
): PeriodComparisonResult {
  const currentFiltered = filterTransactions(expenses, withdrawals, {
    startDate,
    endDate,
    firmId,
    accountId,
  });
  const currentSummary = calculateFinancialSummary(
    currentFiltered.expenses,
    currentFiltered.withdrawals
  );

  if (!startDate || !endDate) {
    return {
      currentSummary,
      previousSummary: currentSummary,
      netProfitChangePercent: 0,
      roiChangePercent: 0,
      expensesChangePercent: 0,
      withdrawalsChangePercent: 0,
    };
  }

  const currentStart = new Date(startDate);
  const currentEnd = new Date(endDate);
  const diffMs = currentEnd.getTime() - currentStart.getTime();
  const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);

  const prevEnd = new Date(currentStart);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (diffDays - 1));

  const prevStartStr = prevStart.toISOString().slice(0, 10);
  const prevEndStr = prevEnd.toISOString().slice(0, 10);

  const previousFiltered = filterTransactions(expenses, withdrawals, {
    startDate: prevStartStr,
    endDate: prevEndStr,
    firmId,
    accountId,
  });
  const previousSummary = calculateFinancialSummary(
    previousFiltered.expenses,
    previousFiltered.withdrawals
  );

  return {
    currentSummary,
    previousSummary,
    netProfitChangePercent: calculatePercentChange(
      currentSummary.netProfit,
      previousSummary.netProfit
    ),
    roiChangePercent: calculatePercentChange(
      currentSummary.roiPercentage,
      previousSummary.roiPercentage
    ),
    expensesChangePercent: calculatePercentChange(
      currentSummary.totalExpenses,
      previousSummary.totalExpenses
    ),
    withdrawalsChangePercent: calculatePercentChange(
      currentSummary.netWithdrawals,
      previousSummary.netWithdrawals
    ),
  };
}
