export interface StrategySetup {
  id: string;
  name: string;
  category: 'ICT / SMC' | 'Price Action' | 'Order Flow' | 'Mean Reversion' | 'Momentum' | 'Custom';
  description: string;
  targetRR: number; // e.g. 2.5 (1:2.5)
  timeframe: string; // e.g. '1m', '5m', '15m', '1h'
  rulesChecklist: string[];
  tradesCount: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  grossWins: number;
  grossLosses: number;
  bestTrade: number;
  worstTrade: number;
}

export interface StrategyPerformanceMetrics {
  winRate: number;
  profitFactor: number | null;
  avgWin: number;
  avgLoss: number;
  expectancy: number; // average PnL per trade
  status: 'profitable' | 'breakeven' | 'unprofitable';
}

export const DEFAULT_PLAYBOOK_STRATEGIES: StrategySetup[] = [
  {
    id: 'ict-fvg',
    name: 'ICT / SMC Fair Value Gap',
    category: 'ICT / SMC',
    description: 'Entrada en descuento/premium tras toma de liquidez interna o externa, confirmación con ruptura de estructura (MSS) y retroceso al FVG de 5m/15m.',
    targetRR: 2.5,
    timeframe: '5m / 15m',
    rulesChecklist: [
      'Barrido de liquidez previo (Buy-side o Sell-side Liquidity)',
      'Desplazamiento institucional limpio con Market Structure Shift (MSS)',
      'Entrada en el 50% del Fair Value Gap (Consecutive Mean)',
      'Stop Loss detrás del swing high/low que generó el desplazamiento',
      'Objetivo mínimo en liquidez opuesta (1:2.5 R:R)',
    ],
    tradesCount: 28,
    winningTrades: 19,
    losingTrades: 9,
    totalPnL: 5450,
    grossWins: 7900,
    grossLosses: 2450,
    bestTrade: 850,
    worstTrade: -350,
  },
  {
    id: 'orb-breakout',
    name: 'Opening Range Breakout (ORB 15m)',
    category: 'Momentum',
    description: 'Ruptura con volumen institucional del rango de los primeros 15 minutos (09:30 - 09:45 EST) en Nasdaq (NQ) o S&P 500 (ES).',
    targetRR: 2.0,
    timeframe: '15m / 1m',
    rulesChecklist: [
      'Identificar máximo y mínimo del rango de 09:30 a 09:45 EST',
      'Vela de ruptura con volumen > 1.5x de la media de 20 periodos',
      'Entrada al retest del borde del rango o confirmación de 1m',
      'Stop Loss en la mitad del rango de apertura',
      'Cierre obligatorio antes de las 11:30 EST',
    ],
    tradesCount: 22,
    winningTrades: 14,
    losingTrades: 8,
    totalPnL: 3200,
    grossWins: 5600,
    grossLosses: 2400,
    bestTrade: 650,
    worstTrade: -300,
  },
  {
    id: 'vwap-mean-reversion',
    name: 'VWAP Mean Reversion & Band Bounce',
    category: 'Mean Reversion',
    description: 'Operativa de reversión a la media cuando el precio extiende más de 2.0 desviaciones estándar respecto al VWAP de la sesión con absorción.',
    targetRR: 1.8,
    timeframe: '3m / 5m',
    rulesChecklist: [
      'Extensión del precio superior a 2.0 Desviaciones Estándar de VWAP',
      'Divergencia de delta o absorción clara en el gráfico de velas/DOM',
      'Vela de rechazo (martillo, estrella fugaz o envolvente)',
      'Primer objetivo en VWAP institucional central',
    ],
    tradesCount: 18,
    winningTrades: 12,
    losingTrades: 6,
    totalPnL: 2150,
    grossWins: 3800,
    grossLosses: 1650,
    bestTrade: 420,
    worstTrade: -310,
  },
  {
    id: 'trend-pullback-ema',
    name: 'Trend Pullback EMA 20 Retest',
    category: 'Price Action',
    description: 'Continuación de tendencia tras pullback controlado a la Media Móvil Exponencial de 20 periodos con bajo volumen relativo.',
    targetRR: 2.2,
    timeframe: '5m',
    rulesChecklist: [
      'Tendencia definida con EMA 20 > EMA 50 > EMA 200',
      'Pullback ordenado de bajo volumen sin velas de rango amplio',
      'Reacción alcista/bajista inmediata al testear la EMA 20',
      'Stop Loss por debajo del mínimo de la vela de pullback',
    ],
    tradesCount: 15,
    winningTrades: 9,
    losingTrades: 6,
    totalPnL: 1400,
    grossWins: 2900,
    grossLosses: 1500,
    bestTrade: 480,
    worstTrade: -270,
  },
];

/**
 * Calculates complete statistical performance for a trading strategy setup
 */
export function calculateStrategyMetrics(
  strategy: StrategySetup
): StrategyPerformanceMetrics {
  const { tradesCount, winningTrades, losingTrades, grossWins, grossLosses, totalPnL } = strategy;

  if (tradesCount === 0) {
    return {
      winRate: 0,
      profitFactor: null,
      avgWin: 0,
      avgLoss: 0,
      expectancy: 0,
      status: 'breakeven',
    };
  }

  const winRate = (winningTrades / tradesCount) * 100;
  const avgWin = winningTrades > 0 ? grossWins / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? grossLosses / losingTrades : 0;
  
  const profitFactor =
    grossLosses > 0
      ? grossWins / grossLosses
      : grossWins > 0
      ? 99.99
      : null;

  const expectancy = totalPnL / tradesCount;

  let status: 'profitable' | 'breakeven' | 'unprofitable' = 'breakeven';
  if (totalPnL > 0 && (profitFactor === null || profitFactor >= 1.2)) {
    status = 'profitable';
  } else if (totalPnL < 0 || (profitFactor !== null && profitFactor < 1.0)) {
    status = 'unprofitable';
  }

  return {
    winRate,
    profitFactor: profitFactor !== null ? Math.round(profitFactor * 100) / 100 : null,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    expectancy: Math.round(expectancy * 100) / 100,
    status,
  };
}
