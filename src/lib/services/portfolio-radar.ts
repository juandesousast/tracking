import { Account, PropFirm, Expense, Withdrawal } from '@/types/database';

export interface FirmCapitalAllocation {
  firmId: string;
  firmName: string;
  firmLogo?: string | null;
  fundedCapital: number;
  evaluationCapital: number;
  totalCapital: number;
  fundedAccountsCount: number;
  evalAccountsCount: number;
  totalAccountsCount: number;
  totalDrawdownAtRisk: number;
  percentageOfFundedCapital: number;
  netPayoutsExtracted: number;
  totalExpenses: number;
  netROI: number;
}

export interface PortfolioRiskSummary {
  totalFundedCapital: number;
  totalEvaluationCapital: number;
  totalCombinedCapital: number;
  totalFundedAccounts: number;
  totalEvaluationAccounts: number;
  totalAccounts: number;
  totalDrawdownAtRisk: number;
  diversificationScore: number; // 0 to 100 (100 = perfectly balanced)
  concentrationRiskLevel: 'low' | 'moderate' | 'high';
  topConcentratedFirm: {
    firmName: string;
    percentage: number;
  } | null;
  firmAllocations: FirmCapitalAllocation[];
}

/**
 * Calculates Herfindahl-Hirschman Index (HHI) based diversification score (0-100)
 * HHI = sum(s_i^2) where s_i is percentage market share (0-100)
 * If 1 firm has 100%: HHI = 10,000 -> Diversification Score = 0
 * If 5 firms each have 20%: HHI = 5 * 400 = 2,000 -> Diversification Score = 80
 */
export function calculateDiversificationScore(percentages: number[]): number {
  if (percentages.length <= 1) {
    return percentages.length === 1 && percentages[0] > 0 ? 20 : 100;
  }

  const hhi = percentages.reduce((sum, p) => sum + p * p, 0);
  // Scale: 10,000 is single monopoly (0 score), <= 2,000 is well diversified (80-100 score)
  const score = Math.max(0, Math.min(100, Math.round((10000 - hhi) / 80)));
  return score;
}

/**
 * Analyzes full multi-firm portfolio and capital allocation
 */
export function analyzePortfolioCapital(
  accounts: Account[],
  firms: PropFirm[],
  expenses: Expense[] = [],
  withdrawals: Withdrawal[] = []
): PortfolioRiskSummary {
  const firmMap = new Map<string, PropFirm>();
  firms.forEach((f) => firmMap.set(f.id, f));

  // Intermediate firm allocation tracker
  const firmAllocMap = new Map<
    string,
    {
      firmId: string;
      firmName: string;
      firmLogo?: string | null;
      fundedCapital: number;
      evaluationCapital: number;
      fundedAccountsCount: number;
      evalAccountsCount: number;
      totalDrawdownAtRisk: number;
    }
  >();

  // Initialize for all known firms
  firms.forEach((f) => {
    firmAllocMap.set(f.id, {
      firmId: f.id,
      firmName: f.name,
      firmLogo: f.logo_url,
      fundedCapital: 0,
      evaluationCapital: 0,
      fundedAccountsCount: 0,
      evalAccountsCount: 0,
      totalDrawdownAtRisk: 0,
    });
  });

  let totalFundedCapital = 0;
  let totalEvaluationCapital = 0;
  let totalFundedAccounts = 0;
  let totalEvaluationAccounts = 0;
  let totalDrawdownAtRisk = 0;

  // Process accounts
  accounts.forEach((acc) => {
    const size = Number(acc.account_size) || 0;
    const isFunded =
      acc.account_type?.toLowerCase().includes('funded') ||
      acc.account_type?.toLowerCase().includes('live') ||
      acc.status?.toLowerCase().includes('active') ||
      acc.status?.toLowerCase().includes('funded') ||
      acc.status?.toLowerCase().includes('pa');

    // Approximate max drawdown at risk (typically 4% to 6% of account size for funded accounts)
    const drawdownRisk = isFunded ? Math.round(size * 0.05) : 0;

    let alloc = firmAllocMap.get(acc.firm_id);
    if (!alloc) {
      const firm = firmMap.get(acc.firm_id);
      alloc = {
        firmId: acc.firm_id,
        firmName: firm?.name || 'Otra Firma',
        firmLogo: firm?.logo_url,
        fundedCapital: 0,
        evaluationCapital: 0,
        fundedAccountsCount: 0,
        evalAccountsCount: 0,
        totalDrawdownAtRisk: 0,
      };
      firmAllocMap.set(acc.firm_id, alloc);
    }

    if (isFunded) {
      alloc.fundedCapital += size;
      alloc.fundedAccountsCount += 1;
      alloc.totalDrawdownAtRisk += drawdownRisk;
      totalFundedCapital += size;
      totalFundedAccounts += 1;
      totalDrawdownAtRisk += drawdownRisk;
    } else {
      alloc.evaluationCapital += size;
      alloc.evalAccountsCount += 1;
      totalEvaluationCapital += size;
      totalEvaluationAccounts += 1;
    }
  });

  // Calculate expenses and withdrawals per firm
  const expensesPerFirm = new Map<string, number>();
  expenses.forEach((e) => {
    if (e.firm_id) {
      expensesPerFirm.set(
        e.firm_id,
        (expensesPerFirm.get(e.firm_id) || 0) + Number(e.amount)
      );
    }
  });

  const withdrawalsPerFirm = new Map<string, number>();
  withdrawals.forEach((w) => {
    if (w.firm_id) {
      withdrawalsPerFirm.set(
        w.firm_id,
        (withdrawalsPerFirm.get(w.firm_id) || 0) + Number(w.net_amount)
      );
    }
  });

  // Build firm allocations list
  const firmAllocations: FirmCapitalAllocation[] = Array.from(firmAllocMap.values())
    .filter((f) => f.fundedCapital > 0 || f.evaluationCapital > 0)
    .map((f) => {
      const totalCapital = f.fundedCapital + f.evaluationCapital;
      const percentageOfFundedCapital =
        totalFundedCapital > 0
          ? (f.fundedCapital / totalFundedCapital) * 100
          : 0;

      const firmExpenses = expensesPerFirm.get(f.firmId) || 0;
      const firmPayouts = withdrawalsPerFirm.get(f.firmId) || 0;
      const netROI =
        firmExpenses > 0
          ? ((firmPayouts - firmExpenses) / firmExpenses) * 100
          : firmPayouts > 0
          ? 100
          : 0;

      return {
        firmId: f.firmId,
        firmName: f.firmName,
        firmLogo: f.firmLogo,
        fundedCapital: f.fundedCapital,
        evaluationCapital: f.evaluationCapital,
        totalCapital,
        fundedAccountsCount: f.fundedAccountsCount,
        evalAccountsCount: f.evalAccountsCount,
        totalAccountsCount: f.fundedAccountsCount + f.evalAccountsCount,
        totalDrawdownAtRisk: f.totalDrawdownAtRisk,
        percentageOfFundedCapital,
        netPayoutsExtracted: firmPayouts,
        totalExpenses: firmExpenses,
        netROI,
      };
    })
    .sort((a, b) => b.totalCapital - a.totalCapital);

  // Compute diversification & concentration
  const percentages = firmAllocations.map((f) => f.percentageOfFundedCapital);
  const diversificationScore = calculateDiversificationScore(percentages);

  let topConcentratedFirm: { firmName: string; percentage: number } | null = null;
  if (firmAllocations.length > 0 && totalFundedCapital > 0) {
    const highest = [...firmAllocations].sort(
      (a, b) => b.percentageOfFundedCapital - a.percentageOfFundedCapital
    )[0];
    topConcentratedFirm = {
      firmName: highest.firmName,
      percentage: highest.percentageOfFundedCapital,
    };
  }

  let concentrationRiskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (topConcentratedFirm) {
    if (topConcentratedFirm.percentage >= 60) {
      concentrationRiskLevel = 'high';
    } else if (topConcentratedFirm.percentage >= 40) {
      concentrationRiskLevel = 'moderate';
    }
  }

  return {
    totalFundedCapital,
    totalEvaluationCapital,
    totalCombinedCapital: totalFundedCapital + totalEvaluationCapital,
    totalFundedAccounts,
    totalEvaluationAccounts,
    totalAccounts: accounts.length,
    totalDrawdownAtRisk,
    diversificationScore,
    concentrationRiskLevel,
    topConcentratedFirm,
    firmAllocations,
  };
}
