import { Candle, generateHistoricalCandles } from './simulator-engine';

const YAHOO_SYMBOL_MAP: Record<string, string> = {
  NAS100: 'NQ=F',
  NQ: 'NQ=F',
  US30: 'YM=F',
  YM: 'YM=F',
  ES: 'ES=F',
  EURUSD: 'EURUSD=X',
  GBPUSD: 'GBPUSD=X',
  XAUUSD: 'GC=F',
  USDCAD: 'CAD=X',
  BTCUSD: 'BTC-USD',
  BTC: 'BTC-USD',
};

/**
 * Fetches real historical market data (OHLCV) without cost or API keys.
 * Falls back gracefully to the deterministic model if offline or blocked.
 */
export async function fetchRealMarketCandles(
  symbol: string,
  startDateStr: string,
  endDateStr: string,
  interval: string = '1h'
): Promise<{ candles: Candle[]; isRealData: boolean }> {
  const normSymbol = symbol.toUpperCase().replace(/[\/\-_]/g, '');
  const yahooTicker = YAHOO_SYMBOL_MAP[normSymbol] || normSymbol;

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      yahooTicker
    )}?interval=${interval}&range=1mo`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'application/json',
      },
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!res.ok) {
      throw new Error(`Yahoo Finance responded with status ${res.status}`);
    }

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    const timestamps: number[] = result?.timestamp || [];
    const quotes = result?.indicators?.quote?.[0];

    if (!timestamps.length || !quotes) {
      throw new Error('Empty candlestick data returned');
    }

    const opens: (number | null)[] = quotes.open || [];
    const highs: (number | null)[] = quotes.high || [];
    const lows: (number | null)[] = quotes.low || [];
    const closes: (number | null)[] = quotes.close || [];
    const volumes: (number | null)[] = quotes.volume || [];

    const candles: Candle[] = [];

    for (let i = 0; i < timestamps.length; i++) {
      const open = opens[i];
      const high = highs[i];
      const low = lows[i];
      const close = closes[i];
      const time = timestamps[i];

      // Skip null ticks (market halts or gaps)
      if (
        open === null ||
        high === null ||
        low === null ||
        close === null ||
        open === undefined ||
        high === undefined ||
        low === undefined ||
        close === undefined
      ) {
        continue;
      }

      candles.push({
        time,
        open: Number(open.toFixed(4)),
        high: Number(high.toFixed(4)),
        low: Number(low.toFixed(4)),
        close: Number(close.toFixed(4)),
        volume: volumes[i] ? Math.round(volumes[i]!) : 100,
      });
    }

    if (candles.length > 0) {
      return { candles, isRealData: true };
    }
  } catch (err) {
    console.warn(`Fallback to local candle engine for ${symbol}:`, err);
  }

  // Graceful fallback
  const fallback = generateHistoricalCandles(symbol, startDateStr, endDateStr, 60);
  return { candles: fallback, isRealData: false };
}
