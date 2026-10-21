export interface RiskTemplate {
  id: string;
  firmName: string;
  accountSize: number;
  label: string;
  dailyLossLimit: number;
  maxDrawdown: number;
  maxContracts: number;
  consistencyPercent: number;
  eodCloseRequired: boolean;
  eodTime: string; // Time in CET or EST
  description: string;
}

export const PROP_FIRM_RISK_TEMPLATES: RiskTemplate[] = [
  {
    id: 'apex-50k',
    firmName: 'Apex Trader Funding',
    accountSize: 50000,
    label: 'Apex 50K Full',
    dailyLossLimit: 1250,
    maxDrawdown: 2500,
    maxContracts: 10,
    consistencyPercent: 30,
    eodCloseRequired: true,
    eodTime: '16:59 EST (22:59 CET)',
    description: 'Regla de consistencia del 30% en payout, trailing drawdown de $2,500 y cierre obligatorio antes del cierre de mercado.',
  },
  {
    id: 'apex-100k',
    firmName: 'Apex Trader Funding',
    accountSize: 100000,
    label: 'Apex 100K Full',
    dailyLossLimit: 2000,
    maxDrawdown: 3000,
    maxContracts: 14,
    consistencyPercent: 30,
    eodCloseRequired: true,
    eodTime: '16:59 EST (22:59 CET)',
    description: 'Trailing drawdown de $3,000, 14 contratos y regla del 30% para elegibilidad de retiro.',
  },
  {
    id: 'topstep-50k',
    firmName: 'Topstep',
    accountSize: 50000,
    label: 'Topstep 50K Combine',
    dailyLossLimit: 1000,
    maxDrawdown: 2000,
    maxContracts: 5,
    consistencyPercent: 50,
    eodCloseRequired: true,
    eodTime: '15:10 CT (22:10 CET)',
    description: 'Daily Loss Limit estricto de $1,000 (cierre automático) y Max Drawdown de $2,000 al fin del día (EOD).',
  },
  {
    id: 'topstep-100k',
    firmName: 'Topstep',
    accountSize: 100000,
    label: 'Topstep 100K Combine',
    dailyLossLimit: 2000,
    maxDrawdown: 3000,
    maxContracts: 10,
    consistencyPercent: 50,
    eodCloseRequired: true,
    eodTime: '15:10 CT (22:10 CET)',
    description: 'Daily loss de $2,000, 10 contratos y EOD drawdown de $3,000.',
  },
  {
    id: 'ftmo-50k',
    firmName: 'FTMO',
    accountSize: 50000,
    label: 'FTMO 50K Normal',
    dailyLossLimit: 2500, // 5%
    maxDrawdown: 5000, // 10%
    maxContracts: 5,
    consistencyPercent: 0,
    eodCloseRequired: false,
    eodTime: '23:59 CET',
    description: 'Pérdida diaria máxima del 5% ($2,500) y pérdida máxima total del 10% ($5,000).',
  },
  {
    id: 'fundednext-50k',
    firmName: 'FundedNext',
    accountSize: 50000,
    label: 'FundedNext 50K Futures / CFD',
    dailyLossLimit: 2500,
    maxDrawdown: 5000,
    maxContracts: 5,
    consistencyPercent: 40,
    eodCloseRequired: true,
    eodTime: '16:59 EST',
    description: 'Regla de consistencia del 40%, pérdida diaria del 5% y máximo drawdown de $5,000.',
  },
];
