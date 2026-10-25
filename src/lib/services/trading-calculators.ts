export interface InstrumentSpec {
  symbol: string;
  name: string;
  category: 'FUTURES_INDEX' | 'FUTURES_COMMODITY' | 'FOREX' | 'CRYPTO';
  tickSize: number;
  tickValue: number; // Dollar value per 1 tick for 1 contract
  pointValue: number; // Dollar value per 1 full point (e.g. $20 for NQ, $2 for MNQ)
  microSymbol?: string;
  miniSymbol?: string;
}

export const INSTRUMENT_SPECS: InstrumentSpec[] = [
  {
    symbol: 'MNQ',
    name: 'Micro E-mini Nasdaq 100',
    category: 'FUTURES_INDEX',
    tickSize: 0.25,
    tickValue: 0.5,
    pointValue: 2.0,
    miniSymbol: 'NQ',
  },
  {
    symbol: 'NQ',
    name: 'E-mini Nasdaq 100',
    category: 'FUTURES_INDEX',
    tickSize: 0.25,
    tickValue: 5.0,
    pointValue: 20.0,
    microSymbol: 'MNQ',
  },
  {
    symbol: 'MES',
    name: 'Micro E-mini S&P 500',
    category: 'FUTURES_INDEX',
    tickSize: 0.25,
    tickValue: 1.25,
    pointValue: 5.0,
    miniSymbol: 'ES',
  },
  {
    symbol: 'ES',
    name: 'E-mini S&P 500',
    category: 'FUTURES_INDEX',
    tickSize: 0.25,
    tickValue: 12.5,
    pointValue: 50.0,
    microSymbol: 'MES',
  },
  {
    symbol: 'MYM',
    name: 'Micro E-mini Dow Jones',
    category: 'FUTURES_INDEX',
    tickSize: 1.0,
    tickValue: 0.5,
    pointValue: 0.5,
    miniSymbol: 'YM',
  },
  {
    symbol: 'YM',
    name: 'E-mini Dow Jones',
    category: 'FUTURES_INDEX',
    tickSize: 1.0,
    tickValue: 5.0,
    pointValue: 5.0,
    microSymbol: 'MYM',
  },
  {
    symbol: 'MGC',
    name: 'Micro Oro (Gold)',
    category: 'FUTURES_COMMODITY',
    tickSize: 0.1,
    tickValue: 1.0,
    pointValue: 10.0,
    miniSymbol: 'GC',
  },
  {
    symbol: 'GC',
    name: 'Oro Futures (Gold)',
    category: 'FUTURES_COMMODITY',
    tickSize: 0.1,
    tickValue: 10.0,
    pointValue: 100.0,
    microSymbol: 'MGC',
  },
  {
    symbol: 'MCL',
    name: 'Micro Petróleo Crudo (WTI)',
    category: 'FUTURES_COMMODITY',
    tickSize: 0.01,
    tickValue: 1.0,
    pointValue: 100.0,
    miniSymbol: 'CL',
  },
  {
    symbol: 'CL',
    name: 'Petróleo Crudo (WTI)',
    category: 'FUTURES_COMMODITY',
    tickSize: 0.01,
    tickValue: 10.0,
    pointValue: 1000.0,
    microSymbol: 'MCL',
  },
  {
    symbol: 'EURUSD',
    name: 'EUR / USD (Forex)',
    category: 'FOREX',
    tickSize: 0.00001,
    tickValue: 1.0,
    pointValue: 100000.0,
  },
  {
    symbol: 'GBPUSD',
    name: 'GBP / USD (Forex)',
    category: 'FOREX',
    tickSize: 0.00001,
    tickValue: 1.0,
    pointValue: 100000.0,
  },
];

export interface PositionSizeResult {
  contracts: number;
  exactContracts: number;
  riskDollars: number;
  actualRiskDollars: number;
  stopDistancePoints: number;
  stopDistanceTicks: number;
  perContractRisk: number;
  instrument: InstrumentSpec;
  isRiskExceeded?: boolean;
  microContracts?: number;
}

export function calculatePositionSize(params: {
  accountBalance: number;
  riskAmount?: number | null;
  riskPercent?: number | null;
  entryPrice: number;
  stopLossPrice: number;
  symbol: string;
}): PositionSizeResult {
  const spec =
    INSTRUMENT_SPECS.find((s) => s.symbol.toUpperCase() === params.symbol.toUpperCase()) ||
    INSTRUMENT_SPECS[0];

  const targetRisk =
    params.riskAmount && params.riskAmount > 0
      ? params.riskAmount
      : params.riskPercent && params.riskPercent > 0
      ? (params.accountBalance * params.riskPercent) / 100
      : 100;

  const points = Math.abs(params.entryPrice - params.stopLossPrice);
  if (points <= 0) {
    return {
      contracts: 0,
      exactContracts: 0,
      riskDollars: Number(targetRisk.toFixed(2)),
      actualRiskDollars: 0,
      stopDistancePoints: 0,
      stopDistanceTicks: 0,
      perContractRisk: 0,
      instrument: spec,
      isRiskExceeded: false,
      microContracts: 0,
    };
  }

  const ticks = Math.round(points / spec.tickSize);
  const perContractRisk = ticks * spec.tickValue;

  if (perContractRisk <= 0) {
    return {
      contracts: 0,
      exactContracts: 0,
      riskDollars: Number(targetRisk.toFixed(2)),
      actualRiskDollars: 0,
      stopDistancePoints: Number(points.toFixed(spec.tickSize < 0.1 ? 4 : 2)),
      stopDistanceTicks: ticks,
      perContractRisk: 0,
      instrument: spec,
      isRiskExceeded: false,
      microContracts: 0,
    };
  }

  const exactContracts = targetRisk / perContractRisk;
  const isRiskExceeded = exactContracts < 1;
  const contracts = isRiskExceeded ? 0 : Math.floor(exactContracts);
  const actualRisk = contracts * perContractRisk;

  // Calculate micro equivalent contracts if available
  let microContracts: number | undefined;
  if (spec.microSymbol) {
    const microSpec = INSTRUMENT_SPECS.find((s) => s.symbol.toUpperCase() === spec.microSymbol?.toUpperCase());
    if (microSpec) {
      const microRiskPerContract = ticks * microSpec.tickValue;
      if (microRiskPerContract > 0) {
        microContracts = Math.floor(targetRisk / microRiskPerContract);
      }
    } else {
      microContracts = Math.floor(exactContracts * 10);
    }
  }

  return {
    contracts,
    exactContracts: Number(exactContracts.toFixed(2)),
    riskDollars: Number(targetRisk.toFixed(2)),
    actualRiskDollars: Number(actualRisk.toFixed(2)),
    stopDistancePoints: Number(points.toFixed(spec.tickSize < 0.1 ? 4 : 2)),
    stopDistanceTicks: ticks,
    perContractRisk: Number(perContractRisk.toFixed(2)),
    instrument: spec,
    isRiskExceeded,
    microContracts,
  };
}

export interface ConsistencyResult {
  totalProfit: number;
  bestDayProfit: number;
  bestDayPercent: number;
  rulePercent: number;
  isEligible: boolean;
  reason?: string;
  excessProfit: number;
  neededTotalProfit: number;
  neededAdditionalProfit: number;
  dayBreakdown: {
    day: number;
    profit: number;
    percentOfTotal: number;
  }[];
}

export function calculateConsistencyRule(
  daysProfits: number[],
  rulePercent: number = 30
): ConsistencyResult {
  const positiveDays = daysProfits.filter((p) => p > 0);
  const totalProfit = positiveDays.reduce((acc, v) => acc + v, 0);
  const bestDayProfit = positiveDays.length > 0 ? Math.max(...positiveDays) : 0;

  const bestDayPercent =
    totalProfit > 0 ? Number(((bestDayProfit / totalProfit) * 100).toFixed(1)) : 0;

  const isEligible = totalProfit > 0 && bestDayPercent <= rulePercent;
  const reason =
    totalProfit <= 0
      ? 'Se requiere beneficio neto positivo para evaluar consistencia'
      : isEligible
      ? 'Cumple con el límite de consistencia'
      : `El mejor día supera el límite permitido (${rulePercent}%)`;

  // If best day > rulePercent, total profit needed for best day to equal rulePercent:
  // bestDayProfit / (totalProfit + X) = rulePercent / 100 => totalNeeded = bestDayProfit / (rulePercent / 100)
  const neededTotalProfit =
    rulePercent > 0 && bestDayProfit > 0 ? Math.round(bestDayProfit / (rulePercent / 100)) : 0;

  const neededAdditionalProfit = Math.max(0, neededTotalProfit - totalProfit);
  const excessProfit = Math.max(0, bestDayProfit - (totalProfit * rulePercent) / 100);

  const dayBreakdown = daysProfits.map((profit, idx) => ({
    day: idx + 1,
    profit,
    percentOfTotal:
      totalProfit > 0 && profit > 0 ? Number(((profit / totalProfit) * 100).toFixed(1)) : 0,
  }));

  return {
    totalProfit: Number(totalProfit.toFixed(2)),
    bestDayProfit: Number(bestDayProfit.toFixed(2)),
    bestDayPercent,
    rulePercent,
    isEligible,
    reason,
    excessProfit: Number(excessProfit.toFixed(2)),
    neededTotalProfit,
    neededAdditionalProfit: Number(neededAdditionalProfit.toFixed(2)),
    dayBreakdown,
  };
}

export interface DrawdownBufferResult {
  currentBalance: number;
  highWaterMark: number;
  maxDrawdownLimit: number;
  liquidationThreshold: number;
  remainingBuffer: number;
  bufferPercent: number;
  isBreached: boolean;
  isLockedAtInitial?: boolean;
}

export function calculateDrawdownBuffer(params: {
  currentBalance: number;
  highWaterMark: number;
  maxDrawdownLimit: number; // e.g. 2500 for a 50k account
  isTrailing?: boolean;
  initialBalance?: number;
  lockAtInitialBalance?: boolean;
  lockBufferDollars?: number;
}): DrawdownBufferResult {
  const peak = Math.max(params.currentBalance, params.highWaterMark);
  let liquidationThreshold = params.isTrailing
    ? peak - params.maxDrawdownLimit
    : params.highWaterMark - params.maxDrawdownLimit;

  let isLockedAtInitial = false;
  if (params.isTrailing && params.initialBalance !== undefined && params.lockAtInitialBalance !== false) {
    const lockLevel = params.initialBalance + (params.lockBufferDollars ?? 0);
    if (liquidationThreshold >= lockLevel) {
      liquidationThreshold = lockLevel;
      isLockedAtInitial = true;
    }
  }

  const remainingBuffer = params.currentBalance - liquidationThreshold;
  const bufferPercent =
    params.maxDrawdownLimit > 0
      ? Number(((remainingBuffer / params.maxDrawdownLimit) * 100).toFixed(1))
      : 0;

  return {
    currentBalance: params.currentBalance,
    highWaterMark: peak,
    maxDrawdownLimit: params.maxDrawdownLimit,
    liquidationThreshold: Number(liquidationThreshold.toFixed(2)),
    remainingBuffer: Number(remainingBuffer.toFixed(2)),
    bufferPercent,
    isBreached: remainingBuffer <= 0,
    isLockedAtInitial,
  };
}
