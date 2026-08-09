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
