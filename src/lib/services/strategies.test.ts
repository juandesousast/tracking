import { describe, it, expect } from 'vitest';
import {
  calculateStrategyMetrics,
  DEFAULT_PLAYBOOK_STRATEGIES,
  StrategySetup,
} from './strategies';

describe('Strategies Playbook Service', () => {
  it('calculates metrics for a profitable strategy', () => {
    const testStrat: StrategySetup = {
      id: 'test-1',
      name: 'Test Scalp',
      category: 'Momentum',
      description: 'Test setup',
      targetRR: 2.0,
      timeframe: '1m',
      rulesChecklist: ['Rule 1', 'Rule 2'],
      tradesCount: 10,
      winningTrades: 7,
      losingTrades: 3,
      totalPnL: 800,
      grossWins: 1400,
      grossLosses: 600,
      bestTrade: 300,
      worstTrade: -200,
    };

    const metrics = calculateStrategyMetrics(testStrat);

    expect(metrics.winRate).toBe(70);
    // Profit factor = 1400 / 600 = 2.33
    expect(metrics.profitFactor).toBe(2.33);
    // Avg win = 1400 / 7 = 200
    expect(metrics.avgWin).toBe(200);
    // Avg loss = 600 / 3 = 200
    expect(metrics.avgLoss).toBe(200);
    // Expectancy = 800 / 10 = 80
    expect(metrics.expectancy).toBe(80);
    expect(metrics.status).toBe('profitable');
  });

  it('handles empty trades count gracefully', () => {
    const emptyStrat: StrategySetup = {
      id: 'empty',
      name: 'Empty Setup',
      category: 'Custom',
      description: 'No trades yet',
      targetRR: 2.0,
      timeframe: '5m',
      rulesChecklist: [],
      tradesCount: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      grossWins: 0,
      grossLosses: 0,
      bestTrade: 0,
      worstTrade: 0,
    };

    const metrics = calculateStrategyMetrics(emptyStrat);
    expect(metrics.winRate).toBe(0);
    expect(metrics.profitFactor).toBeNull();
    expect(metrics.expectancy).toBe(0);
    expect(metrics.status).toBe('breakeven');
  });

  it('verifies default playbook strategies have valid data', () => {
    expect(DEFAULT_PLAYBOOK_STRATEGIES.length).toBeGreaterThan(0);
    DEFAULT_PLAYBOOK_STRATEGIES.forEach((strat) => {
      const metrics = calculateStrategyMetrics(strat);
      expect(metrics.winRate).toBeGreaterThan(0);
      expect(metrics.profitFactor).toBeGreaterThan(1);
      expect(metrics.status).toBe('profitable');
    });
  });
});
