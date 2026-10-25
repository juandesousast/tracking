import { TradovateClient, TradovateOrder } from './tradovate-client';
import { CopierRule } from '@/types/database';

export interface CopyExecutionResult {
  ruleId: string;
  slaveAccountId: string;
  slaveAccountName: string;
  symbol: string;
  action: 'Buy' | 'Sell';
  originalQty: number;
  copiedQty: number;
  latencyMs: number;
  success: boolean;
  error?: string;
}

// Futures symbol mapper for mini to micro
const MINI_TO_MICRO_MAP: Record<string, string> = {
  NQ: 'MNQ',
  ES: 'MES',
  YM: 'MYM',
  RTY: 'M2K',
  CL: 'MCL',
  GC: 'MGC',
  SI: 'SIL',
  HG: 'MHG',
  ZB: '2YY',
  ZN: '5YY',
  ZF: '2YY',
};

export function convertSymbolToMicro(symbol: string): string {
  if (!symbol) return symbol;
  
  // Example symbol format: NQZ4, NQH5, ESZ4, MNQZ4
  for (const [mini, micro] of Object.entries(MINI_TO_MICRO_MAP)) {
    if (symbol.startsWith(mini) && !symbol.startsWith(micro)) {
      return symbol.replace(mini, micro);
    }
  }
  return symbol;
}

export class CopyEngine {
  private client: TradovateClient;
  private rules: CopierRule[] = [];
  private isEnabled: boolean = true;
  private processedOrderIds = new Set<number>();
  private onReplicationLog?: (result: CopyExecutionResult) => void;

  constructor(
    client: TradovateClient,
    rules: CopierRule[],
    isEnabled: boolean = true,
    onReplicationLog?: (result: CopyExecutionResult) => void
  ) {
    this.client = client;
    this.rules = rules;
    this.isEnabled = isEnabled;
    this.onReplicationLog = onReplicationLog;
  }

  public updateRules(rules: CopierRule[]) {
    this.rules = rules;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Processes a master order update and replicates it to all active slave accounts.
   */
  public async handleMasterOrder(order: TradovateOrder): Promise<CopyExecutionResult[]> {
    if (!this.isEnabled) {
      return [];
    }

    // Only replicate on order fill or active new working orders
    if (order.ordStatus !== 'Filled' && order.ordStatus !== 'Working') {
      return [];
    }

    // Deduplicate order events
    if (this.processedOrderIds.has(order.id)) {
      return [];
    }
    this.processedOrderIds.add(order.id);

    // Limit set size to avoid memory leaks
    if (this.processedOrderIds.size > 2000) {
      const arr = Array.from(this.processedOrderIds);
      this.processedOrderIds = new Set(arr.slice(1000));
    }

    const matchingRules = this.rules.filter(
      (r) =>
        r.is_active &&
        (r.master_account_id === String(order.accountId) ||
          r.master_account_name.toLowerCase() === (order.accountSpec || '').toLowerCase())
    );

    if (matchingRules.length === 0) {
      return [];
    }

    const results: CopyExecutionResult[] = [];

    for (const rule of matchingRules) {
      const start = Date.now();
      const slaveAccountIdNum = Number(rule.slave_account_id);
      const targetSymbol = rule.convert_mini_to_micro
        ? convertSymbolToMicro(order.symbol || '')
        : (order.symbol || '');

      const multiplier = Number(rule.multiplier) || 1;
      const targetQty = Math.max(1, Math.round(order.orderQty * multiplier));

      try {
        const placeRes = await this.client.placeOrder({
          accountId: slaveAccountIdNum,
          accountSpec: rule.slave_account_name,
          action: order.action,
          symbol: targetSymbol,
          orderQty: targetQty,
          orderType: (order.orderType as any) || 'Market',
          price: order.avgPx,
          isAutomated: true,
        });

        const latency = Math.max(1, Date.now() - start);
        const result: CopyExecutionResult = {
          ruleId: rule.id,
          slaveAccountId: rule.slave_account_id,
          slaveAccountName: rule.slave_account_name,
          symbol: targetSymbol,
          action: order.action,
          originalQty: order.orderQty,
          copiedQty: targetQty,
          latencyMs: latency,
          success: placeRes.success,
          error: placeRes.error,
        };

        results.push(result);
        this.onReplicationLog?.(result);
      } catch (err: any) {
        const latency = Math.max(1, Date.now() - start);
        const result: CopyExecutionResult = {
          ruleId: rule.id,
          slaveAccountId: rule.slave_account_id,
          slaveAccountName: rule.slave_account_name,
          symbol: targetSymbol,
          action: order.action,
          originalQty: order.orderQty,
          copiedQty: targetQty,
          latencyMs: latency,
          success: false,
          error: err?.message || 'Error desconocido al colocar orden esclava',
        };
        results.push(result);
        this.onReplicationLog?.(result);
      }
    }

    return results;
  }
}
