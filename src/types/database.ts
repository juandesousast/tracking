export interface PropFirm {
  id: string;
  user_id: string;
  name: string;
  website: string | null;
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
  category: string;
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

