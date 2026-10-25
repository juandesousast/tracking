export type ExpenseCategory =
  | 'evaluation'
  | 'activation'
  | 'reset'
  | 'subscription'
  | 'other'
  | string;

export interface PropFirm {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
  logo_url?: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  firm_id: string;
  account_size: number;
  account_type: string;
  status: string;
  account_number?: string | null;
  alias?: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  firm_id: string | null;
  account_id: string | null;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  date: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  firm_id: string | null;
  account_id: string | null;
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  status: string;
  date: string;
  created_at: string;
}

export interface FinancialSummary {
  totalExpenses: number;
  grossWithdrawals: number;
  totalFees: number;
  netWithdrawals: number;
  netProfit: number;
  roiPercentage: number;
}

export interface FirmFinancialSummary {
  firmId: string;
  firmName: string;
  summary: FinancialSummary;
  accountCount: number;
}

export interface TradovateCredential {
  id: string;
  user_id: string;
  connection_name: string;
  account_environment: 'demo' | 'live';
  username_encrypted: string;
  password_encrypted?: string | null;
  app_id: string;
  access_token_encrypted?: string | null;
  is_connected: boolean;
  created_at: string;
}

export interface CopierRule {
  id: string;
  user_id: string;
  group_name?: string | null;
  master_account_id: string;
  master_account_name: string;
  slave_account_id: string;
  slave_account_name: string;
  multiplier: number;
  convert_mini_to_micro: boolean;
  max_daily_loss?: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CopierSlave {
  id: string;
  account_id: string;
  account_name: string;
  firm_name?: string;
  multiplier: number;
  convert_mini_to_micro: boolean;
  max_daily_loss?: number | null;
  is_active: boolean;
  floating_pnl?: number;
}

export interface CopierGroup {
  id: string;
  user_id?: string;
  name: string;
  master_account_id: string;
  master_account_name: string;
  master_firm_name?: string;
  is_active: boolean;
  slaves: CopierSlave[];
  created_at: string;
}

export interface CopierLog {
  id: string;
  user_id: string;
  master_order_id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  slaves_count: number;
  latency_ms: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  created_at: string;
}

export interface TodayTradingMetrics {
  todayPnL: number;
  winsCount: number;
  lossesCount: number;
  bestTrade: number | null;
  worstTrade: number | null;
}

export interface ConsistencyMetrics {
  avgDailyPnL: number;
  bestDayPnL: number;
  worstDayPnL: number;
  profitFactor: number;
  winRate: number;
  totalTrades: number;
  totalPnL: number;
}

export interface DashboardTradingState {
  today: TodayTradingMetrics;
  consistency: ConsistencyMetrics;
  equityCurve: { date: string; balance: number; dailyPnL: number }[];
}

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type PositionStatus = 'OPEN' | 'CLOSED';
export type SessionStatus = 'not_started' | 'in_progress' | 'finished';

export interface BacktestingSession {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  initial_balance: number;
  current_balance: number;
  start_date: string;
  end_date: string;
  status: SessionStatus;
  created_at: string;
  updated_at?: string;
}

export interface BacktestingPosition {
  id: string;
  session_id: string;
  user_id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  status: PositionStatus;
  quantity: number;
  entry_price: number;
  exit_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  pnl?: number | null;
  r_multiple?: number | null;
  entry_time: string;
  exit_time?: string | null;
  created_at?: string;
}

export interface SimulatorSymbolConfig {
  value: string;
  label: string;
  category: 'INDEX' | 'FOREX' | 'COMMODITY' | 'CRYPTO';
  decimals: number;
  pricescale: number;
  contractSize: number;
  minmov: number;
  startDate: string;
  endDate: string;
}

export interface SimulatorSessionStats {
  trades: BacktestingPosition[];
  curve: { trade: number; balance: number; drawdown: number }[];
  netPnl: number;
  winningCount: number;
  losingCount: number;
  winRate: number;
  avgProfit: number;
  avgLoss: number;
  profitFactor: number | null;
  expectancy: number;
  avgR: number | null;
  maxDrawdown: number;
  maxDrawdownPct: number;
  maxWinStreak: number;
  maxLossStreak: number;
}

export interface AccountRiskConfig {
  id?: string;
  account_id: string;
  user_id?: string;
  template_id?: string | null;
  daily_loss_limit_amount: number | null;
  daily_loss_limit_action: 'liquidate' | 'notify';
  daily_profit_target_amount: number | null;
  max_contracts_limit: number | null;
  trailing_drawdown_limit: number | null;
  consistency_percentage_limit: number | null;
  auto_eod_close_time: string | null;
  is_active: boolean;
  updated_at?: string;
}


