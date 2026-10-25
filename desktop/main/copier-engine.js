const WebSocket = require('ws');

// Polyfill WebSocket for Node / Electron runtime for @supabase/realtime-js
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = WebSocket;
}

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ahwbibmicwtnyochrsrn.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod2JpYm1pY3d0bnlvY2hyc3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMDc4MDAsImV4cCI6MjEwMTc4MzgwMH0.vOlRb0Z9rd3blNVR-cAoV7JvWyoz3uYpszA35i43WZk';

const MINI_TO_MICRO_MAP = {
  NQ: 'MNQ',
  ES: 'MES',
  YM: 'MYM',
  RTY: 'M2K',
  CL: 'MCL',
  GC: 'MGC',
  SI: 'SIL',
  HG: 'MHG',
};

function convertSymbolToMicro(symbol) {
  if (!symbol) return symbol;
  for (const [mini, micro] of Object.entries(MINI_TO_MICRO_MAP)) {
    if (symbol.startsWith(mini) && !symbol.startsWith(micro)) {
      return symbol.replace(mini, micro);
    }
  }
  return symbol;
}

class DesktopCopierEngine {
  constructor({ sendWsMessage, onLog, onStatusChange }) {
    this.sendWsMessage = sendWsMessage;
    this.onLog = onLog || console.log;
    this.onStatusChange = onStatusChange || (() => {});

    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        transport: WebSocket,
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    this.realtimeChannel = null;

    // Config state
    this.mode = 'local'; // 'local' | 'master' | 'slave'
    this.channelId = 'room-default';
    this.masterAccountId = null;
    this.masterAccountName = '';
    this.slaves = []; // [{ id, name, multiplier: 1, convertMiniToMicro: false }]
    this.processedOrderIds = new Set();
  }

  updateConfig(config) {
    if (config.mode) this.mode = config.mode;
    if (config.channelId && config.channelId !== this.channelId) {
      this.channelId = config.channelId;
      if (this.mode === 'master' || this.mode === 'slave') {
        this.subscribeRealtime();
      }
    }
    if (config.masterAccountId !== undefined) this.masterAccountId = config.masterAccountId;
    if (config.masterAccountName !== undefined) this.masterAccountName = config.masterAccountName;
    if (config.slaves !== undefined) this.slaves = config.slaves;

    this.onLog(
      new Date().toLocaleTimeString(),
      `Configuración actualizada: Modo <strong>${this.mode.toUpperCase()}</strong> | Canal: <code>${this.channelId}</code> | Slaves: ${this.slaves.length}`
    );
  }

  subscribeRealtime() {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }

    const channelName = `copier-relay-${this.channelId}`;
    this.onLog(new Date().toLocaleTimeString(), `Suscrito a canal Realtime: <code>${channelName}</code>`);

    this.realtimeChannel = this.supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    this.realtimeChannel.on('broadcast', { event: 'trade_signal' }, (payload) => {
      if (payload && payload.payload) {
        this.handleRemoteTradeSignal(payload.payload);
      }
    });

    this.realtimeChannel.subscribe((status) => {
      this.onLog(new Date().toLocaleTimeString(), `Estado de red Realtime: <strong>${status}</strong>`);
      this.onStatusChange({ realtimeStatus: status });
    });
  }

  async broadcastSignal(signal) {
    if (!this.realtimeChannel) {
      this.subscribeRealtime();
    }
    if (!this.realtimeChannel) return false;

    try {
      await this.realtimeChannel.send({
        type: 'broadcast',
        event: 'trade_signal',
        payload: signal,
      });
      this.onLog(
        new Date().toLocaleTimeString(),
        `📡 Señal emitida a la red (<10ms): <strong>${signal.action}</strong> ${signal.quantity}x ${signal.symbol}`
      );
      return true;
    } catch (err) {
      console.error('[CopierEngine] Broadcast error:', err);
      this.onLog(new Date().toLocaleTimeString(), `Error emitiendo señal: ${err.message}`);
      return false;
    }
  }

  /**
   * Called when a native Tradovate WebSocket order event arrives.
   */
  handleTradovateOrder(order) {
    if (!order || !order.id) return;

    // Prevent duplicate processing
    const dedupeKey = `${order.id}-${order.ordStatus}`;
    if (this.processedOrderIds.has(dedupeKey)) return;
    this.processedOrderIds.add(dedupeKey);

    // Keep dedupe set memory bounded
    if (this.processedOrderIds.size > 2000) {
      const iter = this.processedOrderIds.values();
      for (let i = 0; i < 500; i++) {
        this.processedOrderIds.delete(iter.next().value);
      }
    }

    const isMaster =
      String(order.accountId) === String(this.masterAccountId) ||
      order.accountSpec === this.masterAccountName;

    // We replicate when the master order is placed or filled
    if (isMaster) {
      const action = order.action === 'Buy' ? 'BUY' : 'SELL';
      const qty = Number(order.orderQty) || 1;
      const symbol = order.symbol;

      this.onLog(
        new Date().toLocaleTimeString(),
        `🎯 Orden Master detectada [${order.accountSpec || order.accountId}]: <strong>${action}</strong> ${qty} ${symbol} (${order.ordStatus})`
      );

      // 1. If in MASTER mode, broadcast signal to friend/slaves
      if (this.mode === 'master') {
        this.broadcastSignal({
          id: `sig-${order.id}-${Date.now()}`,
          groupId: this.channelId,
          masterAccountId: String(order.accountId),
          masterAccountName: order.accountSpec || '',
          symbol: symbol,
          action: action,
          quantity: qty,
          orderType: 'MARKET',
          timestamp: new Date().toISOString(),
        });
      }

      // 2. If LOCAL or MASTER with local slave accounts configured, copy to local slaves
      if (this.slaves && this.slaves.length > 0) {
        this.replicateToLocalSlaves({
          masterOrderId: order.id,
          symbol,
          action,
          quantity: qty,
        });
      }
    }
  }

  /**
   * Replicates an order to locally configured Tradovate slave accounts on the same machine.
   */
  replicateToLocalSlaves({ masterOrderId, symbol, action, quantity }) {
    for (const slave of this.slaves) {
      if (slave.isActive === false) continue;

      let targetSymbol = symbol;
      if (slave.convertMiniToMicro) {
        targetSymbol = convertSymbolToMicro(symbol);
      }

      const multiplier = Number(slave.multiplier) || 1;
      const finalQty = Math.max(1, Math.round(quantity * multiplier));

      this.onLog(
        new Date().toLocaleTimeString(),
        `⚡ Replicando local a [${slave.name || slave.id}]: <strong>${action}</strong> ${finalQty}x ${targetSymbol}`
      );

      const tradovateAction = action === 'BUY' ? 'Buy' : 'Sell';
      const orderPayload = {
        accountSpec: slave.name || undefined,
        accountId: Number(slave.id),
        action: tradovateAction,
        symbol: targetSymbol,
        orderQty: finalQty,
        orderType: 'Market',
        isAutomated: true,
      };

      this.sendWsMessage('order/placeorder', orderPayload);
    }
  }

  /**
   * Called when a trade signal is received from the Supabase Realtime network (Friend or Remote Master).
   */
  handleRemoteTradeSignal(signal) {
    if (this.mode !== 'slave') {
      return; // Ignore if not in slave mode
    }

    const startMs = Date.now();
    const signalTime = new Date(signal.timestamp).getTime();
    const networkLatency = isNaN(signalTime) ? 0 : Math.max(0, startMs - signalTime);

    this.onLog(
      new Date().toLocaleTimeString(),
      `📥 Señal recibida de la Red (<${networkLatency}ms): <strong>${signal.action}</strong> ${signal.quantity}x ${signal.symbol}`
    );

    // Replicate to all slave accounts configured on this local machine
    if (!this.slaves || this.slaves.length === 0) {
      this.onLog(
        new Date().toLocaleTimeString(),
        `<span style="color: #fbbf24;">⚠️ Aviso: Señal recibida pero no hay cuentas Slave seleccionadas para ejecutar.</span>`
      );
      return;
    }

    for (const slave of this.slaves) {
      if (slave.isActive === false) continue;

      let targetSymbol = signal.symbol;
      if (slave.convertMiniToMicro) {
        targetSymbol = convertSymbolToMicro(signal.symbol);
      }

      const multiplier = Number(slave.multiplier) || 1;
      const finalQty = Math.max(1, Math.round(signal.quantity * multiplier));

      this.onLog(
        new Date().toLocaleTimeString(),
        `🚀 Ejecutando con IP Casa en [${slave.name || slave.id}]: <strong>${signal.action}</strong> ${finalQty}x ${targetSymbol}`
      );

      const tradovateAction = signal.action === 'BUY' ? 'Buy' : 'Sell';
      const orderPayload = {
        accountSpec: slave.name || undefined,
        accountId: Number(slave.id),
        action: tradovateAction,
        symbol: targetSymbol,
        orderQty: finalQty,
        orderType: 'Market',
        isAutomated: true,
      };

      this.sendWsMessage('order/placeorder', orderPayload);
    }
  }

  cleanup() {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }
}

module.exports = {
  DesktopCopierEngine,
  convertSymbolToMicro,
};
