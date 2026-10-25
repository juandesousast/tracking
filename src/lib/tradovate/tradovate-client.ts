/**
 * Tradovate Real-Time WebSocket Client
 * Operates purely in the browser to maintain the user's residential IP address (Prop Firm Safe).
 * Automatically maintains heartbeats, renews the access token every 15 minutes,
 * and streams real-time order/position events.
 */

export interface TradovateAccount {
  id: number;
  name: string;
  accountType: string;
  balance?: number;
  realizedPnL?: number;
  active: boolean;
}

export interface TradovateOrder {
  id: number;
  accountId: number;
  accountSpec?: string;
  contractId?: number;
  symbol?: string;
  action: 'Buy' | 'Sell';
  ordStatus: 'Filled' | 'Working' | 'Cancelled' | 'Rejected' | string;
  orderQty: number;
  cumQty?: number;
  avgPx?: number;
  orderType: 'Market' | 'Limit' | 'Stop' | string;
  timestamp: string;
}

export interface TradovatePosition {
  id: number;
  accountId: number;
  contractId: number;
  symbol?: string;
  netPos: number;
  netPrice: number;
  realizedPnL: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface TradovateClientConfig {
  token: string;
  environment: 'demo' | 'live';
  onStatusChange?: (status: ConnectionStatus, latencyMs: number) => void;
  onAccounts?: (accounts: TradovateAccount[]) => void;
  onOrder?: (order: TradovateOrder) => void;
  onPosition?: (position: TradovatePosition) => void;
  onTokenRenewed?: (newToken: string) => void;
  onError?: (error: string) => void;
}

export class TradovateClient {
  private ws: WebSocket | null = null;
  private token: string;
  private environment: 'demo' | 'live';
  private status: ConnectionStatus = 'disconnected';
  private reqId = 1;
  private pingInterval: NodeJS.Timeout | null = null;
  private tokenRenewInterval: NodeJS.Timeout | null = null;
  private pingStart = 0;
  private latencyMs = 0;
  private isDestroyed = false;

  private onStatusChange?: (status: ConnectionStatus, latencyMs: number) => void;
  private onAccounts?: (accounts: TradovateAccount[]) => void;
  private onOrder?: (order: TradovateOrder) => void;
  private onPosition?: (position: TradovatePosition) => void;
  private onTokenRenewed?: (newToken: string) => void;
  private onError?: (error: string) => void;

  public accounts: TradovateAccount[] = [];
  public positions: TradovatePosition[] = [];

  constructor(config: TradovateClientConfig) {
    this.token = config.token;
    this.environment = config.environment;
    this.onStatusChange = config.onStatusChange;
    this.onAccounts = config.onAccounts;
    this.onOrder = config.onOrder;
    this.onPosition = config.onPosition;
    this.onTokenRenewed = config.onTokenRenewed;
    this.onError = config.onError;
  }

  public connect(): void {
    if (this.isDestroyed || typeof window === 'undefined') return;

    this.setStatus('connecting');
    const wsUrl = this.environment === 'live'
      ? 'wss://live.tradovateapi.com/v1/websocket'
      : 'wss://demo.tradovateapi.com/v1/websocket';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.authorize();
        this.startHeartbeat();
        this.startTokenAutoRenew();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (err) => {
        console.error('Tradovate WS error:', err);
        this.onError?.('Error de conexión WebSocket con Tradovate');
        this.setStatus('error');
      };

      this.ws.onclose = () => {
        if (!this.isDestroyed) {
          this.setStatus('disconnected');
          this.cleanupTimers();
        }
      };
    } catch (err: any) {
      console.error('Failed to instantiate Tradovate WebSocket:', err);
      this.setStatus('error');
      this.onError?.(err?.message || 'Fallo de conexión');
    }
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.onStatusChange?.(status, this.latencyMs);
  }

  private authorize() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.pingStart = Date.now();
    const id = this.reqId++;
    this.ws.send(`authorize\n${id}\n\n${this.token}`);
  }

  private requestSync() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const id = this.reqId++;
    this.ws.send(`user/syncrequest\n${id}\n\n{}`);
  }

  private startHeartbeat() {
    this.cleanupTimers();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.pingStart = Date.now();
        this.ws.send('[]');
      }
    }, 2500);
  }

  private startTokenAutoRenew() {
    // Auto-renew every 15 minutes (900,000 ms) before expiration
    this.tokenRenewInterval = setInterval(() => {
      this.renewToken();
    }, 15 * 60 * 1000);
  }

  public async renewToken(): Promise<boolean> {
    try {
      const baseUrl = this.environment === 'live'
        ? 'https://live.tradovateapi.com'
        : 'https://demo.tradovateapi.com';

      const res = await fetch(`${baseUrl}/v1/auth/renewaccesstoken`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.accessToken) {
          this.token = data.accessToken;
          this.onTokenRenewed?.(data.accessToken);
          return true;
        }
      }
    } catch (err) {
      console.error('Error auto-renewing Tradovate token:', err);
    }
    return false;
  }

  private handleMessage(data: string) {
    if (data === 'o') {
      // SockJS open
      return;
    }
    if (data === 'h') {
      // SockJS heartbeat from server
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('[]');
      }
      return;
    }

    if (data.startsWith('a[')) {
      try {
        const rawJson = data.slice(2, -1);
        const parsed = JSON.parse(rawJson);
        const messages = Array.isArray(parsed) ? parsed : [parsed];

        for (const msg of messages) {
          this.processPayload(msg);
        }
      } catch (e) {
        console.error('Error parsing Tradovate message frame:', e);
      }
    }
  }

  private processPayload(msg: any) {
    // Measure latency if response to a request
    if (this.pingStart > 0) {
      this.latencyMs = Math.max(1, Date.now() - this.pingStart);
      this.pingStart = 0;
    }

    // Auth Response
    if (msg.s === 200 && msg.i === 1) {
      this.setStatus('connected');
      this.requestSync();
      return;
    }

    if (msg.s && msg.s !== 200) {
      console.warn('Tradovate returned error status:', msg);
      if (msg.errmsg || msg.errorText) {
        this.onError?.(msg.errmsg || msg.errorText);
      }
    }

    // User Sync Response
    if (msg.d && (msg.d.accounts || msg.d.cashBalances)) {
      const accList: TradovateAccount[] = (msg.d.accounts || []).map((a: any) => {
        const cash = (msg.d.cashBalances || []).find((c: any) => c.accountId === a.id);
        return {
          id: a.id,
          name: a.name,
          accountType: a.accountType || 'Customer',
          balance: cash?.amount ?? 0,
          realizedPnL: cash?.realizedPnL ?? 0,
          active: a.active !== false && !a.archived,
        };
      });

      this.accounts = accList;
      this.onAccounts?.(accList);
    }

    // Real-Time Props Events (Orders, Positions)
    if (msg.e === 'props' && msg.d) {
      const { entityType, entity } = msg.d;

      if (entityType === 'order' && entity) {
        const orderData: TradovateOrder = {
          id: entity.id,
          accountId: entity.accountId,
          accountSpec: entity.accountSpec,
          contractId: entity.contractId,
          symbol: entity.symbol,
          action: entity.action,
          ordStatus: entity.ordStatus,
          orderQty: entity.orderQty,
          cumQty: entity.cumQty,
          avgPx: entity.avgPx,
          orderType: entity.orderType,
          timestamp: entity.timestamp || new Date().toISOString(),
        };
        this.onOrder?.(orderData);
      }

      if (entityType === 'position' && entity) {
        const posData: TradovatePosition = {
          id: entity.id,
          accountId: entity.accountId,
          contractId: entity.contractId,
          symbol: entity.symbol,
          netPos: entity.netPos,
          netPrice: entity.netPrice,
          realizedPnL: entity.realizedPnL,
        };
        this.onPosition?.(posData);
      }
    }
  }

  /**
   * Places an order directly through the local browser WebSocket.
   * This guarantees that the order egresses with the trader's residential IP.
   */
  public async placeOrder(order: {
    accountId: number;
    accountSpec: string;
    action: 'Buy' | 'Sell';
    symbol: string;
    orderQty: number;
    orderType: 'Market' | 'Limit' | 'Stop';
    price?: number;
    isAutomated?: boolean;
  }): Promise<{ success: boolean; error?: string; latencyMs: number }> {
    const start = Date.now();
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return { success: false, error: 'WebSocket desconectado', latencyMs: 0 };
    }

    const id = this.reqId++;
    const payload = {
      accountSpec: order.accountSpec,
      accountId: order.accountId,
      action: order.action,
      symbol: order.symbol,
      orderQty: order.orderQty,
      orderType: order.orderType,
      price: order.price,
      isAutomated: order.isAutomated ?? true,
    };

    try {
      this.ws.send(`order/placeorder\n${id}\n\n${JSON.stringify(payload)}`);
      const latency = Math.max(1, Date.now() - start);
      return { success: true, latencyMs: latency };
    } catch (err: any) {
      return { success: false, error: err.message, latencyMs: Date.now() - start };
    }
  }

  /**
   * Liquidates / Flattens all positions for a specific account.
   */
  public async liquidateAccount(accountId: number): Promise<boolean> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    const id = this.reqId++;
    try {
      this.ws.send(`order/liquidateposition\n${id}\n\n${JSON.stringify({ accountId, admin: true })}`);
      return true;
    } catch (err) {
      console.error('Error executing liquidateAccount:', err);
      return false;
    }
  }

  public disconnect(): void {
    this.isDestroyed = true;
    this.cleanupTimers();
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  private cleanupTimers() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.tokenRenewInterval) {
      clearInterval(this.tokenRenewInterval);
      this.tokenRenewInterval = null;
    }
  }
}
