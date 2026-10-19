import { describe, it, expect } from 'vitest';
import {
  normalizeEconomicEvent,
  filterEconomicEvents,
  getFallbackEconomicEvents,
  EconomicEvent,
} from './economic-events';

describe('Economic Events Service', () => {
  it('should normalize raw events cleanly', () => {
    const raw = {
      id: 'event-123',
      title: 'Consumer Price Index (YoY)',
      country: 'US',
      currency: 'USD',
      date: '2026-10-25T12:30:00Z',
      importance: 3,
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
    expect(normalized.importance).toBe(3);
    expect(normalized.currency).toBe('USD');
    expect(normalized.actual).toBe(3.1);
    expect(normalized.forecast).toBe(3.2);
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
      },
    ];

    const highImpact = filterEconomicEvents(events, { minImportance: 3 });
    expect(highImpact).toHaveLength(1);
    expect(highImpact[0].id).toBe('2');
  });

  it('should filter events by currency', () => {
    const events = getFallbackEconomicEvents();
    const usdEvents = filterEconomicEvents(events, { currency: 'USD' });
    expect(usdEvents.every((e) => e.currency === 'USD')).toBe(true);

    const eurEvents = filterEconomicEvents(events, { currency: 'EUR' });
    expect(eurEvents.every((e) => e.currency === 'EUR')).toBe(true);
  });
});
