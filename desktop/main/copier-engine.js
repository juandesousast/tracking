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
        autoRefreshToken: true,
      },
    });

    this.currentUser = null;
    this.isPaused = false;
    this.stats = {
      replicatedToday: 0,
      totalLatencyMs: 0,
      lastLatencyMs: 0,
    };

    // Config state
    this.masterAccountId = null;
    this.masterAccountName = '';
    this.slaves = []; // [{ id, name, multiplier: 1, convertMiniToMicro: false, isActive: true, maxDailyLoss: null }]
    this.processedOrderIds = new Set();
  }

  // --- Auth Methods ---
  async login(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      this.currentUser = data.user;
      this.onLog(
        new Date().toLocaleTimeString(),
        `Sesión iniciada como <strong>${data.user.email}</strong> en EdgeFlow.`
      );

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        session: data.session,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async restoreSession(session) {
    if (!session || !session.access_token || !session.refresh_token) {
      return false;
    }
    try {
      const { data, error } = await this.supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      if (error || !data.user) {
        return false;
      }

      this.currentUser = data.user;
      this.onLog(
        new Date().toLocaleTimeString(),
        `Sesión restaurada para <strong>${data.user.email}</strong>.`
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  async logout() {
    this.currentUser = null;
    try {
      await this.supabase.auth.signOut();
    } catch (e) {}
    this.onLog(new Date().toLocaleTimeString(), 'Sesión de EdgeFlow cerrada.');
    return { success: true };
  }

  // --- Copier Configuration ---
  updateConfig(config) {
    if (config.masterAccountId !== undefined) this.masterAccountId = config.masterAccountId;
    if (config.masterAccountName !== undefined) this.masterAccountName = config.masterAccountName;
    if (config.slaves !== undefined) this.slaves = config.slaves;
    if (config.isPaused !== undefined) this.isPaused = config.isPaused;

    const activeSlavesCount = (this.slaves || []).filter((s) => s.isActive !== false).length;
    this.onLog(
      new Date().toLocaleTimeString(),
      `Configuración actualizada: Master <strong>${this.masterAccountName || 'Sin asignar'}</strong> | Slaves Activas: <strong>${activeSlavesCount}</strong>`
    );
  }

  /**
   * Called when an order event arrives from the local Tradovate WebSocket.
   */
  handleTradovateOrder(order) {
    if (!order || !order.id) return;
    if (this.isPaused) {
      this.onLog(
        new Date().toLocaleTimeString(),
        `<span style="color: #fbbf24;">⏸️ Réplica pausada globalmente. Orden ignorada.</span>`
      );
      return;
    }

    // Prevent duplicate processing
    const dedupeKey = `${order.id}-${order.ordStatus}`;
    if (this.processedOrderIds.has(dedupeKey)) return;
    this.processedOrderIds.add(dedupeKey);

    // Keep set bounded
    if (this.processedOrderIds.size > 2000) {
      const iter = this.processedOrderIds.values();
      for (let i = 0; i < 500; i++) {
        this.processedOrderIds.delete(iter.next().value);
      }
    }

    const isMaster =
      String(order.accountId) === String(this.masterAccountId) ||
      order.accountSpec === this.masterAccountName;

    // Only process orders originating from the designated Master Account
    if (isMaster) {
      const action = order.action === 'Buy' ? 'BUY' : 'SELL';
      const qty = Number(order.orderQty) || 1;
      const symbol = order.symbol;
      const status = order.ordStatus;

      // Replicate on Working or Filled orders
      if (status === 'Working' || status === 'Filled') {
        const startTime = Date.now();
        this.onLog(
          new Date().toLocaleTimeString(),
          `🎯 Orden Master en [${order.accountSpec || order.accountId}]: <strong class="${action === 'BUY' ? 'console-buy' : 'console-sell'}">${action}</strong> ${qty}x ${symbol} (${status})`
        );

        this.replicateToLocalSlaves({
          masterOrderId: order.id,
          symbol,
          action,
          quantity: qty,
          startTime,
        });
      }
    }
  }

  /**
   * Replicates an order to locally configured Tradovate slave accounts on this PC.
   */
  async replicateToLocalSlaves({ masterOrderId, symbol, action, quantity, startTime }) {
    const activeSlaves = (this.slaves || []).filter((s) => s.isActive !== false);

    if (activeSlaves.length === 0) {
      this.onLog(
        new Date().toLocaleTimeString(),
        `<span style="color: #64748b;">ℹ️ No hay cuentas esclavas activas asignadas a este Master.</span>`
      );
      return;
    }

    const tradovateAction = action === 'BUY' ? 'Buy' : 'Sell';
    let executedCount = 0;

    for (const slave of activeSlaves) {
      let targetSymbol = symbol;
      if (slave.convertMiniToMicro) {
        targetSymbol = convertSymbolToMicro(symbol);
      }

      const multiplier = Number(slave.multiplier) || 1;
      const finalQty = Math.max(1, Math.round(quantity * multiplier));

      const orderPayload = {
        accountSpec: slave.name || undefined,
        accountId: Number(slave.id),
        action: tradovateAction,
        symbol: targetSymbol,
        orderQty: finalQty,
        orderType: 'Market',
        isAutomated: true,
      };

      const sent = this.sendWsMessage('order/placeorder', orderPayload);
      if (sent) {
        executedCount++;
        const elapsedMs = Math.max(1, Date.now() - startTime);
        this.stats.replicatedToday++;
        this.stats.lastLatencyMs = elapsedMs;
        this.stats.totalLatencyMs += elapsedMs;

        const convBadge =
          targetSymbol !== symbol
            ? `<span style="font-size: 10px; background: rgba(59,130,246,0.15); color: #60a5fa; padding: 1px 4px; border-radius: 3px;">${symbol} ➔ ${targetSymbol}</span>`
            : '';

        this.onLog(
          new Date().toLocaleTimeString(),
          `⚡ Replicado en [${slave.name || slave.id}]: <strong class="${action === 'BUY' ? 'console-buy' : 'console-sell'}">${action}</strong> ${finalQty}x ${targetSymbol} ${convBadge} <span style="color: #34d399; font-size: 11px;">(${elapsedMs}ms)</span>`
        );
      }
    }

    // Sync trade execution to user's EdgeFlow cloud account if authenticated
    if (this.currentUser && executedCount > 0) {
      const avgLatency = Math.round((Date.now() - startTime) / executedCount);
      this.syncTradeLog({
        masterOrderId: String(masterOrderId),
        symbol,
        action,
        quantity,
        slavesCount: executedCount,
        latencyMs: avgLatency,
      });
    }

    this.onStatusChange({
      stats: {
        replicatedToday: this.stats.replicatedToday,
        avgLatencyMs: Math.round(this.stats.totalLatencyMs / Math.max(1, this.stats.replicatedToday)),
      },
    });
  }

  // --- Cloud Sync & Auxiliary Services ---

  async getCloudAccounts() {
    if (!this.currentUser) return [];
    try {
      const { data, error } = await this.supabase
        .from('accounts')
        .select(`
          id,
          account_size,
          account_type,
          status,
          account_number,
          alias,
          firm_id,
          prop_firms (
            name,
            logo_url
          )
        `)
        .eq('user_id', this.currentUser.id);

      if (error) {
        console.error('[CopierEngine] Error fetching cloud accounts:', error.message);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error('[CopierEngine] getCloudAccounts error:', e.message);
      return [];
    }
  }

  async getCloudCopierLogs() {
    if (!this.currentUser) return [];
    try {
      const { data, error } = await this.supabase
        .from('copier_logs')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error('[CopierEngine] Error fetching cloud logs:', error.message);
        return [];
      }
      return data || [];
    } catch (e) {
      return [];
    }
  }

  async getEconomicNews() {
    try {
      const from = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      const to = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const url = `https://chartevents-reuters.tradingview.com/events?from=${encodeURIComponent(
        from
      )}&to=${encodeURIComponent(to)}`;

      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      const rawEvents = Array.isArray(json.result) ? json.result : [];

      return rawEvents
        .filter((ev) => ev.currency === 'USD' || ev.currency === 'EUR')
        .map((ev) => ({
          id: String(ev.id || Math.random()),
          title: ev.title || ev.indicator || 'Evento Económico',
          currency: ev.currency || 'USD',
          date: ev.date || new Date().toISOString(),
          importance: ev.importance >= 1 ? 3 : (ev.importance === 0 ? 2 : 1),
          actual: ev.actual ?? null,
          forecast: ev.forecast ?? null,
          previous: ev.previous ?? null,
          unit: ev.unit || '',
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 20);
    } catch (e) {
      console.error('[CopierEngine] Error fetching news:', e.message);
      return [];
    }
  }

  /**
   * Syncs trade to Supabase `copier_logs` table so user sees it in their web dashboard.
   */
  async syncTradeLog({ masterOrderId, symbol, action, quantity, slavesCount, latencyMs }) {
    if (!this.currentUser) return;
    try {
      await this.supabase.from('copier_logs').insert({
        user_id: this.currentUser.id,
        master_order_id: masterOrderId,
        symbol: symbol.toUpperCase(),
        action: action === 'BUY' ? 'BUY' : 'SELL',
        quantity: quantity,
        slaves_count: slavesCount,
        latency_ms: latencyMs,
        status: 'SUCCESS',
      });
    } catch (err) {
      console.error('[CopierEngine] Error syncing trade to cloud:', err);
    }
  }

  cleanup() {
    this.processedOrderIds.clear();
  }
}

module.exports = {
  DesktopCopierEngine,
  convertSymbolToMicro,
};
