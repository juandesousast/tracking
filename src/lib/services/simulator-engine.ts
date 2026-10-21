import {
  BacktestingPosition,
  SimulatorSessionStats,
  SimulatorSymbolConfig,
} from '@/types/database';

export const SIMULATOR_SYMBOLS: SimulatorSymbolConfig[] = [
  {
    value: 'NAS100',
    label: 'NAS100 (Nasdaq / NQ)',
    category: 'INDEX',
    decimals: 2,
    pricescale: 100,
    minmov: 0.25,
    contractSize: 1, // $1 per point for mini/micro normalized
    startDate: '2023-01-01',
    endDate: '2026-10-20',
  },
  {
    value: 'US30',
    label: 'US30 (Dow Jones / YM)',
    category: 'INDEX',
    decimals: 2,
    pricescale: 100,
    minmov: 1,
    contractSize: 1,
    startDate: '2023-01-01',
    endDate: '2026-10-20',
  },
  {
    value: 'EURUSD',
    label: 'EUR/USD',
    category: 'FOREX',
    decimals: 5,
    pricescale: 100000,
    minmov: 1,
    contractSize: 100000, // Standard lot
    startDate: '2020-01-01',
    endDate: '2026-10-20',
  },
  {
    value: 'GBPUSD',
    label: 'GBP/USD',
    category: 'FOREX',
    decimals: 5,
    pricescale: 100000,
    minmov: 1,
    contractSize: 100000,
    startDate: '2020-01-01',
    endDate: '2026-10-20',
  },
  {
    value: 'XAUUSD',
    label: 'XAU/USD (Oro)',
    category: 'COMMODITY',
    decimals: 2,
    pricescale: 100,
    minmov: 1,
    contractSize: 100, // 100 oz per standard lot
    startDate: '2020-01-01',
    endDate: '2026-10-20',
  },
  {
    value: 'USDCAD',
    label: 'USD/CAD',
    category: 'FOREX',
    decimals: 5,
    pricescale: 100000,
    minmov: 1,
    contractSize: 100000,
    startDate: '2020-01-01',
    endDate: '2026-10-20',
  },
  {
    value: 'BTCUSD',
    label: 'BTC/USD (Bitcoin)',
    category: 'CRYPTO',
    decimals: 2,
    pricescale: 100,
    minmov: 1,
    contractSize: 1,
    startDate: '2021-01-01',
    endDate: '2026-10-20',
  },
];

export function getSymbolConfig(symbol: string): SimulatorSymbolConfig {
  const norm = symbol.toUpperCase().replace(/[\/\-_]/g, '');
  const found = SIMULATOR_SYMBOLS.find(
    (s) => s.value.toUpperCase() === norm || s.label.toUpperCase().includes(norm)
  );
  if (found) return found;

  // Default fallback
  return {
    value: symbol,
    label: symbol,
    category: 'INDEX',
    decimals: 2,
    pricescale: 100,
    minmov: 1,
    contractSize: 1,
    startDate: '2023-01-01',
    endDate: '2026-10-20',
  };
}

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

/**
 * Deterministic pseudo-random number generator for reproducible market sessions
 */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Base reference prices for historical data generation
 */
const BASE_PRICES: Record<string, number> = {
  NAS100: 17850.0,
  US30: 38900.0,
  EURUSD: 1.085,
  GBPUSD: 1.268,
  XAUUSD: 2350.0,
  USDCAD: 1.365,
  BTCUSD: 64200.0,
};

/**
 * Generates realistic historical candlestick series for a symbol and date range
 */
export function generateHistoricalCandles(
  symbol: string,
  startDateStr: string,
  endDateStr: string,
  intervalMinutes: number = 60
): Candle[] {
  const config = getSymbolConfig(symbol);
  const basePrice = BASE_PRICES[config.value] || 1000.0;
  const seed = stringToSeed(`${symbol}-${startDateStr}-${endDateStr}`);
  const rand = seededRandom(seed);

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (end <= start) {
    end.setDate(start.getDate() + 7);
  }

  const candles: Candle[] = [];
  const stepMs = intervalMinutes * 60 * 1000;
  let currentPrice = basePrice;
  let currentTimeMs = start.getTime();
  const endTimeMs = end.getTime();

  // Max 500 candles to keep browser responsive and focused
  const maxCandles = 500;
  let count = 0;

  while (currentTimeMs <= endTimeMs && count < maxCandles) {
    const date = new Date(currentTimeMs);
    const dayOfWeek = date.getUTCDay();

    // Skip weekends for Forex/Indices (Saturday=6, Sunday=0)
    if (config.category !== 'CRYPTO' && (dayOfWeek === 0 || dayOfWeek === 6)) {
      currentTimeMs += 24 * 60 * 60 * 1000;
      continue;
    }

    // Volatility by category
    const volatilityPct =
      config.category === 'CRYPTO'
        ? 0.008
        : config.category === 'INDEX'
        ? 0.003
        : config.category === 'COMMODITY'
        ? 0.004
        : 0.0015;

    const drift = (rand() - 0.495) * volatilityPct * currentPrice;
    const open = Number(currentPrice.toFixed(config.decimals));
    const close = Number((open + drift).toFixed(config.decimals));

    const wickUp = rand() * volatilityPct * currentPrice * 0.8;
    const wickDown = rand() * volatilityPct * currentPrice * 0.8;

    const high = Number((Math.max(open, close) + wickUp).toFixed(config.decimals));
    const low = Number((Math.min(open, close) - wickDown).toFixed(config.decimals));

    const volume = Math.floor(100 + rand() * 1500);

    candles.push({
      time: Math.floor(currentTimeMs / 1000),
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
    currentTimeMs += stepMs;
    count++;
  }

  return candles;
}

/**
 * Calculates current dollar profit/loss of an open or closed position
 */
export function calculatePositionPnl(
  position: { side: 'BUY' | 'SELL'; quantity: number; entry_price: number },
  currentPrice: number,
  symbol: string
): number {
  const config = getSymbolConfig(symbol);
  const diff =
    position.side === 'BUY'
      ? currentPrice - position.entry_price
      : position.entry_price - currentPrice;

  const rawPnl = diff * position.quantity * config.contractSize;
  return Number(rawPnl.toFixed(2));
}

/**
 * Calculates R-Multiple realized on trade exit
 */
export function calculateRMultiple(
  entryPrice: number,
  exitPrice: number,
  stopLoss: number | null | undefined,
  side: 'BUY' | 'SELL'
): number | null {
  if (!stopLoss) return null;
  const risk = Math.abs(entryPrice - stopLoss);
  if (risk <= 0) return null;

  const gain = side === 'BUY' ? exitPrice - entryPrice : entryPrice - exitPrice;
  return Number((gain / risk).toFixed(2));
}

/**
 * Calculates performance metrics from closed trades matching the platform logic
 */
export function calculateSessionStats(
  trades: BacktestingPosition[],
  initialBalance: number
): SimulatorSessionStats {
  const closedTrades = trades
    .filter((t) => t.status === 'CLOSED' && t.pnl !== null && t.pnl !== undefined)
    .sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime());

  const pnls = closedTrades.map((t) => Number(t.pnl || 0));
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);

  const sumWins = wins.reduce((acc, v) => acc + v, 0);
  const sumLosses = Math.abs(losses.reduce((acc, v) => acc + v, 0));

  let peak = initialBalance;
  let runningBalance = initialBalance;
  let maxDd = 0;
  let maxDdPct = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  const curve: { trade: number; balance: number; drawdown: number }[] = [
    { trade: 0, balance: initialBalance, drawdown: 0 },
  ];

  pnls.forEach((pnl, i) => {
    runningBalance += pnl;
    if (runningBalance > peak) {
      peak = runningBalance;
    }
    const dd = peak - runningBalance;
    if (dd > maxDd) {
      maxDd = dd;
      maxDdPct = peak > 0 ? (maxDd / peak) * 100 : 0;
    }

    curve.push({
      trade: i + 1,
      balance: Number(runningBalance.toFixed(2)),
      drawdown: Number((runningBalance - peak).toFixed(2)),
    });

    if (pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else if (pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    }
  });

  const totalClosed = closedTrades.length;
  const netPnl = Number((runningBalance - initialBalance).toFixed(2));
  const winRate = totalClosed > 0 ? Number(((wins.length / totalClosed) * 100).toFixed(1)) : 0;
  const avgProfit = wins.length > 0 ? Number((sumWins / wins.length).toFixed(2)) : 0;
  const avgLoss = losses.length > 0 ? Number((sumLosses / losses.length).toFixed(2)) : 0;
  const profitFactor = sumLosses > 0 ? Number((sumWins / sumLosses).toFixed(2)) : wins.length > 0 ? 99.9 : null;
  const expectancy = totalClosed > 0 ? Number((netPnl / totalClosed).toFixed(2)) : 0;

  const rMultiples = closedTrades
    .map((t) => t.r_multiple)
    .filter((r): r is number => r !== null && r !== undefined);

  const avgR =
    rMultiples.length > 0
      ? Number((rMultiples.reduce((acc, v) => acc + v, 0) / rMultiples.length).toFixed(2))
      : null;

  return {
    trades: closedTrades,
    curve,
    netPnl,
    winningCount: wins.length,
    losingCount: losses.length,
    winRate,
    avgProfit,
    avgLoss,
    profitFactor,
    expectancy,
    avgR,
    maxDrawdown: Number(maxDd.toFixed(2)),
    maxDrawdownPct: Number(maxDdPct.toFixed(2)),
    maxWinStreak,
    maxLossStreak,
  };
}
