import { describe, it, expect } from 'vitest';
import {
  normalizeEconomicEvent,
  filterEconomicEvents,
  getFallbackEconomicEvents,
  getImpactedAssets,
  EconomicEvent,
} from './economic-events';

describe('Economic Events Service', () => {
  it('should normalize raw events cleanly with impacted assets', () => {
    const raw = {
      id: 'event-123',
      title: 'Consumer Price Index (YoY)',
      country: 'US',
      currency: 'USD',
      date: '2026-10-25T12:30:00Z',
      importance: 1, // Reuters scale 1 = High (3 stars)
      actual: 3.1,
      forecast: 3.2,
      previous: 3.4,
      unit: '%',
      period: 'Sep',
      source: 'BLS',
      comment: 'Core CPI measure',
    };

    const normalized = normalizeEconomicEvent(raw);
    expect(normalized.id).toBe('event-123');
    expect(normalized.title).toBe('Consumer Price Index (YoY)');
    expect(normalized.importance).toBe(3); // Normalized to 3 stars
    expect(normalized.currency).toBe('USD');
    expect(normalized.actual).toBe(3.1);
    expect(normalized.forecast).toBe(3.2);
    expect(normalized.impactedAssets.some((a) => a.symbol === 'MNQ / NQ')).toBe(true);
    expect(normalized.impactedAssets.some((a) => a.symbol === 'MES / ES')).toBe(true);
    expect(normalized.impactedAssets.some((a) => a.symbol === 'EUR/USD')).toBe(true);
    expect(normalized.impactedAssets.some((a) => a.symbol === 'USD/CAD')).toBe(true);
  });

  it('should correctly map impacted assets by currency', () => {
    const cadAssets = getImpactedAssets('CAD');
    expect(cadAssets.some((a) => a.symbol === 'USD/CAD')).toBe(true);
    expect(cadAssets.some((a) => a.symbol === 'CL / Crudo')).toBe(true);

    const eurAssets = getImpactedAssets('EUR');
    expect(eurAssets.some((a) => a.symbol === 'EUR/USD')).toBe(true);

    const cnyAssets = getImpactedAssets('CNY');
    expect(cnyAssets.some((a) => a.symbol === 'MNQ / NQ')).toBe(true);
  });

  it('should filter events by minimum importance level', () => {
    const events: EconomicEvent[] = [
      {
        id: '1',
        title: 'Low event',
        country: 'US',
        currency: 'USD',
        date: '2026-10-20T10:00:00Z',
        importance: 1,
        actual: null,
        forecast: null,
        previous: null,
        unit: '',
        period: '',
        source: '',
        comment: '',
        impactedAssets: [],
      },
      {
        id: '2',
        title: 'High event',
        country: 'US',
        currency: 'USD',
        date: '2026-10-20T12:00:00Z',
        importance: 3,
        actual: null,
        forecast: null,
        previous: null,
        unit: '',
        period: '',
        source: '',
        comment: '',
        impactedAssets: [{ symbol: 'MNQ / NQ', name: 'Nasdaq', type: 'futures' }],
      },
    ];

    const highImpact = filterEconomicEvents(events, { minImportance: 3 });
    expect(highImpact).toHaveLength(1);
    expect(highImpact[0].id).toBe('2');
  });

  it('should filter events by impacted asset symbol', () => {
    const cadEvent: EconomicEvent = {
      id: 'cad-1',
      title: 'Canada CPI',
      country: 'CA',
      currency: 'CAD',
      date: '2026-10-20T12:30:00Z',
      importance: 3,
      actual: 3.1,
      forecast: 3.2,
      previous: 3.0,
      unit: '%',
      period: 'Sep',
      source: 'StatsCan',
      comment: '',
      impactedAssets: [
        { symbol: 'USD/CAD', name: 'Dólar Canadiense', type: 'forex' },
        { symbol: 'CL / Crudo', name: 'Petróleo', type: 'commodities' },
      ],
    };

    const usdEvent: EconomicEvent = {
      id: 'usd-1',
      title: 'FOMC Decision',
      country: 'US',
      currency: 'USD',
      date: '2026-10-20T18:00:00Z',
      importance: 3,
      actual: null,
      forecast: 5.25,
      previous: 5.5,
      unit: '%',
      period: 'Oct',
      source: 'Fed',
      comment: '',
      impactedAssets: [
        { symbol: 'MNQ / NQ', name: 'Nasdaq', type: 'futures' },
        { symbol: 'MES / ES', name: 'S&P 500', type: 'futures' },
        { symbol: 'USD/CAD', name: 'Dólar Canadiense', type: 'forex' },
      ],
    };

    const events = [cadEvent, usdEvent];

    const cadFiltered = filterEconomicEvents(events, { assetSymbol: 'USD/CAD' });
    expect(cadFiltered).toHaveLength(2); // Both affect USD/CAD

    const mnqFiltered = filterEconomicEvents(events, { assetSymbol: 'MNQ / NQ' });
    expect(mnqFiltered).toHaveLength(1);
    expect(mnqFiltered[0].id).toBe('usd-1');
  });

  it('should filter events by currency', () => {
    const events = getFallbackEconomicEvents();
    const usdEvents = filterEconomicEvents(events, { currency: 'USD' });
    expect(usdEvents.every((e) => e.currency === 'USD')).toBe(true);

    const eurEvents = filterEconomicEvents(events, { currency: 'EUR' });
    expect(eurEvents.every((e) => e.currency === 'EUR')).toBe(true);
  });
});
