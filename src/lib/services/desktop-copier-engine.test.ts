import { describe, it, expect, vi, beforeEach } from 'vitest';
// @ts-expect-error desktop module
const { DesktopCopierEngine, convertSymbolToMicro } = require('../../../desktop/main/copier-engine');

describe('Desktop Copier Engine & Symbol Converter', () => {
  describe('convertSymbolToMicro', () => {
    it('converts common mini contracts to micro contracts', () => {
      expect(convertSymbolToMicro('ES')).toBe('MES');
      expect(convertSymbolToMicro('NQ')).toBe('MNQ');
      expect(convertSymbolToMicro('YM')).toBe('MYM');
      expect(convertSymbolToMicro('RTY')).toBe('M2K');
      expect(convertSymbolToMicro('GC')).toBe('MGC');
      expect(convertSymbolToMicro('CL')).toBe('MCL');
    });

    it('converts futures contracts with month and year codes', () => {
      expect(convertSymbolToMicro('ESM4')).toBe('MESM4');
      expect(convertSymbolToMicro('NQU4')).toBe('MNQU4');
      expect(convertSymbolToMicro('YMZ4')).toBe('MYMZ4');
      expect(convertSymbolToMicro('RTYH5')).toBe('M2KH5');
    });

    it('preserves already micro symbols', () => {
      expect(convertSymbolToMicro('MNQ')).toBe('MNQ');
      expect(convertSymbolToMicro('MESM4')).toBe('MESM4');
      expect(convertSymbolToMicro('M2K')).toBe('M2K');
    });

    it('returns unknown symbol as is', () => {
      expect(convertSymbolToMicro('UNKNOWN_SYM')).toBe('UNKNOWN_SYM');
    });
  });

  describe('DesktopCopierEngine execution & safety isolation', () => {
    let engine: any;
    let sentWsMessages: Array<{ endpoint: string; data: any }> = [];

    beforeEach(() => {
      sentWsMessages = [];
      engine = new DesktopCopierEngine({
        onLog: vi.fn(),
        onStatusChange: vi.fn(),
        onOrderFill: vi.fn(),
      });

      // Mock WS sender
      engine.sendWsMessage = (endpoint: string, data: any) => {
        sentWsMessages.push({ endpoint, data });
        return true;
      };

      // Set user config
      engine.updateConfig({
        masterAccountId: 1001,
        isPaused: false,
        slaves: [
          {
            id: 2001,
            name: 'Apex-Slave-1',
            isActive: true,
            multiplier: 2,
            convertMiniToMicro: false,
          },
          {
            id: 2002,
            name: 'Topstep-Slave-2',
            isActive: true,
            multiplier: 1,
            convertMiniToMicro: true,
          },
          {
            id: 2003,
            name: 'Inactive-Slave-3',
            isActive: false,
            multiplier: 1,
            convertMiniToMicro: false,
          },
        ],
      });
    });

    it('replicates order from master account to active slaves with correct multipliers and conversions', async () => {
      await engine.handleTradovateOrder({
        id: 99991,
        accountId: 1001, // Master
        action: 'Buy',
        symbol: 'NQ',
        orderQty: 1,
        ordStatus: 'Filled',
      });

      // Should have sent 2 orders (slave 2001 and slave 2002, skipping inactive 2003)
      expect(sentWsMessages).toHaveLength(2);

      // Slave 2001: 2x multiplier on NQ => 2 NQ
      const slave1Msg = sentWsMessages.find((m) => m.data.accountId === 2001);
      expect(slave1Msg).toBeDefined();
      expect(slave1Msg?.data.symbol).toBe('NQ');
      expect(slave1Msg?.data.orderQty).toBe(2);
      expect(slave1Msg?.data.action).toBe('Buy');

      // Slave 2002: 1x multiplier with Mini-to-Micro => 1 MNQ
      const slave2Msg = sentWsMessages.find((m) => m.data.accountId === 2002);
      expect(slave2Msg).toBeDefined();
      expect(slave2Msg?.data.symbol).toBe('MNQ');
      expect(slave2Msg?.data.orderQty).toBe(1);
      expect(slave2Msg?.data.action).toBe('Buy');
    });

    it('does NOT replicate if the order is already processed (deduplication)', async () => {
      await engine.handleTradovateOrder({
        id: 99992,
        accountId: 1001,
        action: 'Sell',
        symbol: 'ES',
        orderQty: 2,
        ordStatus: 'Filled',
      });

      expect(sentWsMessages).toHaveLength(2);
      sentWsMessages = [];

      // Duplicate message arrived via WebSocket
      await engine.handleTradovateOrder({
        id: 99992,
        accountId: 1001,
        action: 'Sell',
        symbol: 'ES',
        orderQty: 2,
        ordStatus: 'Filled',
      });

      expect(sentWsMessages).toHaveLength(0);
    });

    it('does NOT replicate if the engine is paused', async () => {
      engine.updateConfig({ isPaused: true });

      await engine.handleTradovateOrder({
        id: 99993,
        accountId: 1001,
        action: 'Buy',
        symbol: 'NQ',
        orderQty: 1,
        ordStatus: 'Filled',
      });

      expect(sentWsMessages).toHaveLength(0);
    });

    it('does NOT replicate orders originating from non-master or slave accounts (prevents loopback)', async () => {
      await engine.handleTradovateOrder({
        id: 99994,
        accountId: 2001, // Sent from slave
        action: 'Buy',
        symbol: 'NQ',
        orderQty: 2,
        ordStatus: 'Filled',
      });

      expect(sentWsMessages).toHaveLength(0);
    });
  });
});
