import { Account, Expense, Withdrawal } from '@/types/database';

export interface EvaluationGoalSpecs {
  accountSize: number;
  profitTarget: number;
  maxDrawdown: number;
  minTradingDays: number;
  consistencyPercent: number; // e.g. 30, 40, 50, 0 if none
  firmName?: string;
}

export interface AccountEvaluationProgress {
  accountId: string;
  accountAlias: string;
  accountNumber: string;
  firmId: string;
  firmName: string;
  accountSize: number;
  accountType: string;
  status: string; // 'evaluation' | 'active' | 'passed' | 'breached' | 'funded'
  
  // Progress metrics
  currentBalance: number;
  currentProfit: number;
  profitTarget: number;
  targetProgressPercent: number; // 0 to 100+
  profitRemaining: number;
  
  // Drawdown metrics
  peakBalance: number;
  maxDrawdown: number;
  liquidationThreshold: number;
  drawdownBuffer: number; // dollars away from breach
  drawdownBufferPercent: number;
  drawdownStatus: 'safe' | 'warning' | 'danger' | 'breached';
  
  // Trading days metrics
  tradingDaysCompleted: number;
  minTradingDaysRequired: number;
  tradingDaysPassed: boolean;
  
  // Consistency metrics
  bestDayProfit: number;
  consistencyLimitPercent: number;
  bestDayPercentage: number;
  consistencyPassed: boolean;
  
  // Overall Pass Qualification
  isReadyToPass: boolean;
  missingRequirements: string[];
}

/**
 * Default specs by prop firm and account size
 */
export function getDefaultEvaluationSpecs(
  accountSize: number,
  firmName: string = ''
): EvaluationGoalSpecs {
  const normFirm = firmName.toLowerCase();

  // Topstep rules
  if (normFirm.includes('topstep')) {
    if (accountSize <= 50000) {
      return {
        accountSize: 50000,
        profitTarget: 3000,
        maxDrawdown: 2000,
        minTradingDays: 2, // Topstep recently moved to 2 minimum trading days
        consistencyPercent: 50,
      };
    } else if (accountSize <= 100000) {
      return {
        accountSize: 100000,
        profitTarget: 6000,
        maxDrawdown: 3000,
        minTradingDays: 2,
        consistencyPercent: 50,
      };
    } else {
      return {
        accountSize: 150000,
        profitTarget: 9000,
        maxDrawdown: 4500,
        minTradingDays: 2,
        consistencyPercent: 50,
      };
    }
  }

  // FTMO rules (CFD/Futures)
  if (normFirm.includes('ftmo')) {
    const profitTarget = accountSize * 0.10; // 10% on step 1
    const maxDrawdown = accountSize * 0.10; // 10% max loss
    return {
      accountSize,
      profitTarget,
      maxDrawdown,
      minTradingDays: 4,
      consistencyPercent: 0,
    };
  }

  // FundedNext rules
  if (normFirm.includes('fundednext')) {
    const profitTarget = accountSize * 0.10;
    const maxDrawdown = accountSize * 0.10;
    return {
      accountSize,
      profitTarget,
      maxDrawdown,
      minTradingDays: 5,
      consistencyPercent: 40,
    };
  }

  // Apex Trader Funding (default for US Futures)
  if (accountSize <= 25000) {
    return {
      accountSize: 25000,
      profitTarget: 1500,
      maxDrawdown: 1500,
      minTradingDays: 1, // Apex has 1 day pass promo, standard 7 days
      consistencyPercent: 30,
    };
  } else if (accountSize <= 50000) {
    return {
      accountSize: 50000,
      profitTarget: 3000,
      maxDrawdown: 2500,
      minTradingDays: 1,
      consistencyPercent: 30,
    };
  } else if (accountSize <= 100000) {
    return {
      accountSize: 100000,
      profitTarget: 6000,
      maxDrawdown: 3000,
      minTradingDays: 1,
      consistencyPercent: 30,
    };
  } else if (accountSize <= 150000) {
    return {
      accountSize: 150000,
      profitTarget: 9000,
      maxDrawdown: 5000,
      minTradingDays: 1,
      consistencyPercent: 30,
    };
  } else if (accountSize <= 250000) {
    return {
      accountSize: 250000,
      profitTarget: 15000,
      maxDrawdown: 6500,
      minTradingDays: 1,
      consistencyPercent: 30,
    };
  } else {
    return {
      accountSize: 300000,
      profitTarget: 20000,
      maxDrawdown: 7500,
      minTradingDays: 1,
      consistencyPercent: 30,
    };
  }
}

/**
 * Calculates evaluation progress for a given account
 */
export function calculateAccountEvaluationProgress(
  account: Account,
  firmName: string,
  expenses: Expense[],
  withdrawals: Withdrawal[],
  customSpecs?: Partial<EvaluationGoalSpecs>
): AccountEvaluationProgress {
  const accountSize = Number(account.account_size) || 50000;
  const defaultSpecs = getDefaultEvaluationSpecs(accountSize, firmName);
  
  const specs: EvaluationGoalSpecs = {
    ...defaultSpecs,
    ...customSpecs,
  };

  // Filter transactions for this account
  const accExpenses = expenses.filter((e) => e.account_id === account.id);
  const accWithdrawals = withdrawals.filter((w) => w.account_id === account.id);

  // Group by date to determine daily trading PnL and active trading days
  const dailyPnLMap = new Map<string, number>();

  accExpenses.forEach((exp) => {
    // Evaluation fees / resets don't reduce trading balance inside the trading platform,
    // but recorded trading losses (or withdrawals) do.
    const current = dailyPnLMap.get(exp.date) || 0;
    dailyPnLMap.set(exp.date, current - exp.amount);
  });

  accWithdrawals.forEach((wd) => {
    const current = dailyPnLMap.get(wd.date) || 0;
    dailyPnLMap.set(wd.date, current + wd.net_amount);
  });

  const uniqueDays = Array.from(dailyPnLMap.keys());
  const tradingDaysCompleted = uniqueDays.length;

  // Calculate net profit and peak balance
  let netTradingProfit = 0;
  let peakProfit = 0;
  let bestDayProfit = 0;

  for (const [, pnl] of dailyPnLMap.entries()) {
    netTradingProfit += pnl;
    if (netTradingProfit > peakProfit) {
      peakProfit = netTradingProfit;
    }
    if (pnl > bestDayProfit) {
      bestDayProfit = pnl;
    }
  }

  const currentBalance = accountSize + netTradingProfit;
  const peakBalance = accountSize + peakProfit;

  // Trailing Drawdown calculation
  // In trailing drawdown, the threshold moves up with peak balance up to initial capital + drawdown lock
  const liquidationThreshold = Math.max(
    accountSize - specs.maxDrawdown,
    peakBalance - specs.maxDrawdown
  );
  const drawdownBuffer = Math.max(0, currentBalance - liquidationThreshold);
  const drawdownBufferPercent =
    specs.maxDrawdown > 0 ? (drawdownBuffer / specs.maxDrawdown) * 100 : 100;

  let drawdownStatus: 'safe' | 'warning' | 'danger' | 'breached' = 'safe';
  if (currentBalance <= liquidationThreshold) {
    drawdownStatus = 'breached';
  } else if (drawdownBuffer < specs.maxDrawdown * 0.2) {
    drawdownStatus = 'danger';
  } else if (drawdownBuffer < specs.maxDrawdown * 0.45) {
    drawdownStatus = 'warning';
  }

  // Profit target progress
  const targetProgressPercent =
    specs.profitTarget > 0 ? (netTradingProfit / specs.profitTarget) * 100 : 0;
  const profitRemaining = Math.max(0, specs.profitTarget - netTradingProfit);

  // Trading days check
  const tradingDaysPassed = tradingDaysCompleted >= specs.minTradingDays;

  // Consistency check (best day % of total profit)
  let bestDayPercentage = 0;
  let consistencyPassed = true;
  if (netTradingProfit > 0 && specs.consistencyPercent > 0) {
    bestDayPercentage = (bestDayProfit / netTradingProfit) * 100;
    consistencyPassed = bestDayPercentage <= specs.consistencyPercent;
  }

  // Missing requirements list
  const missingRequirements: string[] = [];
  if (netTradingProfit < specs.profitTarget) {
    missingRequirements.push(
      `Faltan $${profitRemaining.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} para el objetivo`
    );
  }
  if (!tradingDaysPassed) {
    const daysLeft = specs.minTradingDays - tradingDaysCompleted;
    missingRequirements.push(
      `Faltan ${daysLeft} ${daysLeft === 1 ? 'día' : 'días'} de operativa mínima`
    );
  }
  if (netTradingProfit > 0 && !consistencyPassed && specs.consistencyPercent > 0) {
    missingRequirements.push(
      `Regla de consistencia: Mejor día representa el ${bestDayPercentage.toFixed(1)}% (Máximo permitido ${specs.consistencyPercent}%)`
    );
  }
  if (drawdownStatus === 'breached') {
    missingRequirements.push('Límite de Trailing Drawdown alcanzado');
  }

  const isReadyToPass =
    netTradingProfit >= specs.profitTarget &&
    tradingDaysPassed &&
    consistencyPassed &&
    drawdownStatus !== 'breached';

  return {
    accountId: account.id,
    accountAlias: account.alias || `Cuenta ${account.account_number || account.id.slice(0, 6)}`,
    accountNumber: account.account_number || '',
    firmId: account.firm_id,
    firmName,
    accountSize,
    accountType: account.account_type || 'evaluation',
    status: account.status || 'evaluation',
    currentBalance,
    currentProfit: netTradingProfit,
    profitTarget: specs.profitTarget,
    targetProgressPercent,
    profitRemaining,
    peakBalance,
    maxDrawdown: specs.maxDrawdown,
    liquidationThreshold,
    drawdownBuffer,
    drawdownBufferPercent,
    drawdownStatus,
    tradingDaysCompleted,
    minTradingDaysRequired: specs.minTradingDays,
    tradingDaysPassed,
    bestDayProfit,
    consistencyLimitPercent: specs.consistencyPercent,
    bestDayPercentage,
    consistencyPassed,
    isReadyToPass,
    missingRequirements,
  };
}
