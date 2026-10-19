export interface ImpactedAsset {
  symbol: string; // e.g. 'MNQ / NQ', 'MES / ES', 'EUR/USD', 'USD/CAD'
  name: string;
  type: 'futures' | 'forex' | 'commodities';
}

export interface EconomicEvent {
  id: string;
  title: string;
  country: string;
  currency: string;
  date: string; // ISO string
  importance: number; // 1 = Low, 2 = Medium, 3 = High
  actual: number | string | null;
  forecast: number | string | null;
  previous: number | string | null;
  unit: string;
  period: string;
  source: string;
  comment: string;
  impactedAssets: ImpactedAsset[];
}

export interface EconomicEventsFilter {
  minImportance?: number; // 1, 2, or 3
  currency?: string; // 'all' or 'USD', 'EUR', etc.
  assetSymbol?: string; // 'all' or 'MNQ / NQ', 'MES / ES', 'EUR/USD', 'USD/CAD'
  fromDate?: string;
  toDate?: string;
}

/**
 * Maps a currency and news title to the specific trading contracts / pairs it impacts most.
 */
export function getImpactedAssets(currency: string, title?: string): ImpactedAsset[] {
  const c = currency.toUpperCase();
  const t = (title || '').toLowerCase();

  switch (c) {
    case 'USD':
      return [
        { symbol: 'MNQ / NQ', name: 'Nasdaq 100 Futuros', type: 'futures' },
        { symbol: 'MES / ES', name: 'S&P 500 Futuros', type: 'futures' },
        { symbol: 'EUR/USD', name: 'Euro / Dólar', type: 'forex' },
        { symbol: 'USD/CAD', name: 'Dólar / Canadiense', type: 'forex' },
        { symbol: 'GBP/USD', name: 'Cable', type: 'forex' },
        { symbol: 'USD/JPY', name: 'Dólar / Yen', type: 'forex' },
        { symbol: 'GC / Oro', name: 'Oro Comex', type: 'commodities' },
        { symbol: 'CL / Crudo', name: 'Petróleo WTI', type: 'commodities' },
      ];
    case 'CAD':
      return [
        { symbol: 'USD/CAD', name: 'Dólar / Canadiense', type: 'forex' },
        { symbol: 'CL / Crudo', name: 'Petróleo WTI', type: 'commodities' },
      ];
    case 'EUR':
      return [
        { symbol: 'EUR/USD', name: 'Euro / Dólar', type: 'forex' },
        { symbol: 'DAX 40', name: 'DAX Alemán', type: 'futures' },
        { symbol: 'MES / ES', name: 'S&P 500 (Global)', type: 'futures' },
      ];
    case 'CNY':
      return [
        { symbol: 'MNQ / NQ', name: 'Nasdaq 100 (Cadenas Tech)', type: 'futures' },
        { symbol: 'AUD/USD', name: 'Aussie / Dólar', type: 'forex' },
        { symbol: 'MES / ES', name: 'S&P 500 (Asia)', type: 'futures' },
      ];
    case 'GBP':
      return [
        { symbol: 'GBP/USD', name: 'Cable', type: 'forex' },
        { symbol: 'EUR/GBP', name: 'Euro / Libra', type: 'forex' },
      ];
    case 'JPY':
      return [
        { symbol: 'USD/JPY', name: 'Dólar / Yen', type: 'forex' },
      ];
    case 'AUD':
      return [
        { symbol: 'AUD/USD', name: 'Aussie / Dólar', type: 'forex' },
      ];
    case 'CHF':
      return [
        { symbol: 'USD/CHF', name: 'Dólar / Franco', type: 'forex' },
        { symbol: 'EUR/CHF', name: 'Euro / Franco', type: 'forex' },
      ];
    default:
      return [];
  }
}

/**
 * Maps Reuters/TradingView importance scale (-1=low, 0=medium, 1,2=high)
 * to standard institutional 1, 2, 3 (🟡 Low, 🟠 Medium, 🔴 High) scale.
 */
export function normalizeReutersImportance(rawImportance: any): number {
  const imp = typeof rawImportance === 'number' ? rawImportance : 0;
  if (imp >= 1) return 3; // High impact (🔴) (PIB/GDP, IPC/CPI, Ventas Minoristas, Tipos, NFP)
  if (imp === 0) return 2; // Medium impact (🟠) (Vivienda, Subastas de deuda, Desempleo, Balanzas)
  return 1; // Low impact (🟡) (Subastas secundarias, índices menores, sentimiento)
}

/**
 * Normalizes an raw event from TradingView / Reuters API into our typed structure.
 */
export function normalizeEconomicEvent(raw: any): EconomicEvent {
  const currency = String(raw.currency || 'USD').toUpperCase();
  const title = String(raw.title || raw.indicator || 'Evento Económico');

  return {
    id: String(raw.id || Math.random().toString(36).slice(2)),
    title,
    country: String(raw.country || ''),
    currency,
    date: raw.date ? new Date(raw.date).toISOString() : new Date().toISOString(),
    importance: normalizeReutersImportance(raw.importance),
    actual: raw.actual !== undefined && raw.actual !== null ? raw.actual : null,
    forecast: raw.forecast !== undefined && raw.forecast !== null ? raw.forecast : null,
    previous: raw.previous !== undefined && raw.previous !== null ? raw.previous : null,
    unit: String(raw.unit || ''),
    period: String(raw.period || ''),
    source: String(raw.source || ''),
    comment: String(raw.comment || ''),
    impactedAssets: getImpactedAssets(currency, title),
  };
}

/**
 * Filter and sort economic events.
 */
export function filterEconomicEvents(
  events: EconomicEvent[],
  filters: EconomicEventsFilter
): EconomicEvent[] {
  return events.filter((ev) => {
    if (filters.minImportance && ev.importance < filters.minImportance) {
      return false;
    }
    if (filters.currency && filters.currency !== 'all' && ev.currency !== filters.currency) {
      return false;
    }
    if (filters.assetSymbol && filters.assetSymbol !== 'all') {
      const hasAsset = ev.impactedAssets?.some((a) => a.symbol === filters.assetSymbol);
      if (!hasAsset) return false;
    }
    if (filters.fromDate && ev.date < filters.fromDate) {
      return false;
    }
    if (filters.toDate && ev.date > filters.toDate) {
      return false;
    }
    return true;
  });
}

/**
 * Fetches real-time economic calendar events from TradingView / Reuters API.
 * Uses fallback data if network request fails or runs offline.
 */
export async function getEconomicEvents(
  from?: string,
  to?: string
): Promise<EconomicEvent[]> {
  // Broad 8-day window (24h in the past to capture today completely + 7 days forward)
  const fromDate = from || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const toDate = to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // NOTE: We do NOT filter by minImportance in the API query string because Reuters uses -1/0/1,
  // and passing minImportance=1 cuts out 85% of market events including housing, unemployment & T-Bills.
  const url = `https://chartevents-reuters.tradingview.com/events?from=${encodeURIComponent(
    fromDate
  )}&to=${encodeURIComponent(toDate)}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 180 }, // Cache 3 min
    });

    if (!res.ok) {
      throw new Error(`TradingView Reuters API returned status ${res.status}`);
    }

    const data = await res.json();
    const rawEvents = Array.isArray(data.result) ? data.result : [];

    return rawEvents
      .map(normalizeEconomicEvent)
      .sort((a: EconomicEvent, b: EconomicEvent) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (err) {
    console.warn('Falling back to local / static events due to API fetch error:', err);
    return getFallbackEconomicEvents();
  }
}

/**
 * Curated fallback high-impact macroeconomic events when network is disconnected.
 */
export function getFallbackEconomicEvents(): EconomicEvent[] {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  return [
    {
      id: 'fb-1',
      title: 'Decisión de Tipos de Interés FOMC (FED)',
      country: 'US',
      currency: 'USD',
      date: `${todayStr}T18:00:00.000Z`,
      importance: 3,
      actual: null,
      forecast: 5.25,
      previous: 5.5,
      unit: '%',
      period: 'Oct 2026',
      source: 'Federal Reserve',
      comment: 'Decisión del comité de política monetaria sobre los tipos de interés oficiales de EE.UU.',
    },
    {
      id: 'fb-2',
      title: 'Nóminas No Agrícolas (NFP)',
      country: 'US',
      currency: 'USD',
      date: `${todayStr}T12:30:00.000Z`,
      importance: 3,
      actual: null,
      forecast: 175,
      previous: 142,
      unit: 'K',
      period: 'Sep 2026',
      source: 'BLS',
      comment: 'Cambio en el número de personas empleadas durante el último mes, excluyendo la industria agraria.',
    },
    {
      id: 'fb-3',
      title: 'Índice de Precios al Consumo (IPC Subyacente)',
      country: 'US',
      currency: 'USD',
      date: `${todayStr}T12:30:00.000Z`,
      importance: 3,
      actual: null,
      forecast: 3.2,
      previous: 3.2,
      unit: '%',
      period: 'Sep 2026',
      source: 'BLS',
      comment: 'Mide el cambio en los precios de bienes y servicios excluyendo alimentos y energía.',
    },
    {
      id: 'fb-4',
      title: 'Decisión de Tipos de Interés BCE',
      country: 'EU',
      currency: 'EUR',
      date: `${todayStr}T12:15:00.000Z`,
      importance: 3,
      actual: null,
      forecast: 3.65,
      previous: 3.65,
      unit: '%',
      period: 'Oct 2026',
      source: 'ECB',
      comment: 'Tipo de interés fijado por el Banco Central Europeo para la zona euro.',
    },
    {
      id: 'fb-5',
      title: 'PMI Manufacturero de EE.UU. (ISM)',
      country: 'US',
      currency: 'USD',
      date: `${todayStr}T14:00:00.000Z`,
      importance: 2,
      actual: null,
      forecast: 48.5,
      previous: 47.2,
      unit: '',
      period: 'Sep 2026',
      source: 'ISM',
      comment: 'Nivel del índice difuso basado en gerentes de compras encuestados en el sector manufacturero.',
      impactedAssets: getImpactedAssets('USD', 'PMI'),
    },
  ].map((e) => ({
    ...e,
    impactedAssets: e.impactedAssets || getImpactedAssets(e.currency, e.title),
  }));
}
