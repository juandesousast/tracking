import { Withdrawal, Expense, Account, PropFirm } from "@/types/database";

/**
 * Escapes a cell value according to RFC 4180 standard for CSV.
 */
export function escapeCSVCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Builds CSV string content with UTF-8 BOM for flawless Excel/Numbers compatibility.
 */
export function buildCSVContent(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCSVCell).join(",");
  const rowLines = rows.map((row) => row.map(escapeCSVCell).join(","));
  return `\uFEFF${[headerLine, ...rowLines].join("\r\n")}`;
}

/**
 * Triggers a browser download of a CSV file from data.
 */
export function downloadCSV(filename: string, csvContent: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Withdrawals (Payouts) to CSV
 */
export function exportWithdrawalsToCSV(
  withdrawals: Withdrawal[],
  accounts: Account[] = [],
  firms: PropFirm[] = [],
  customFilename?: string
): void {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const firmMap = new Map(firms.map((f) => [f.id, f]));

  const headers = [
    "ID Retiro",
    "Fecha",
    "Empresa",
    "Cuenta / Alias",
    "Tamaño Cuenta ($)",
    "Importe Bruto ($)",
    "Comisión Retiro ($)",
    "Importe Neto Recibido ($)",
    "Estado",
    "Notas",
  ];

  const rows = withdrawals.map((w) => {
    const acc = w.account_id ? accountMap.get(w.account_id) : undefined;
    const firm = (acc && firmMap.get(acc.firm_id)) || (w.firm_id ? firmMap.get(w.firm_id) : undefined);
    const firmName = firm?.name || "Sin Empresa";
    const accountLabel = acc ? `${acc.alias || "Cuenta"} ($${acc.account_size.toLocaleString()})` : "General";

    return [
      w.id,
      w.date,
      firmName,
      accountLabel,
      acc ? acc.account_size : "",
      w.gross_amount ?? w.net_amount,
      w.fee_amount ?? 0,
      w.net_amount,
      w.status === "completed" ? "Completado" : "Pendiente",
      "",
    ];
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `retiros-propfirms-${dateStr}.csv`;
  const csv = buildCSVContent(headers, rows);
  downloadCSV(filename, csv);
}

/**
 * Export Expenses (Evaluations, Resets, Fees) to CSV
 */
export function exportExpensesToCSV(
  expenses: Expense[],
  accounts: Account[] = [],
  firms: PropFirm[] = [],
  customFilename?: string
): void {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const firmMap = new Map(firms.map((f) => [f.id, f]));

  const headers = [
    "ID Gasto",
    "Fecha",
    "Empresa",
    "Categoría",
    "Cuenta Asociada",
    "Importe ($)",
    "Deducible Fiscal",
    "ID Factura / Recibo",
    "Notas",
  ];

  const rows = expenses.map((e) => {
    const acc = e.account_id ? accountMap.get(e.account_id) : undefined;
    const firm = (acc && firmMap.get(acc.firm_id)) || (e.firm_id ? firmMap.get(e.firm_id) : undefined);
    const firmName = firm?.name || "General";
    const accountLabel = acc ? `${acc.alias || "Cuenta"} ($${acc.account_size.toLocaleString()})` : "Sin cuenta";

    return [
      e.id,
      e.date,
      firmName,
      e.category,
      accountLabel,
      e.amount,
      "Sí",
      "",
      e.description || "",
    ];
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `gastos-examenes-${dateStr}.csv`;
  const csv = buildCSVContent(headers, rows);
  downloadCSV(filename, csv);
}

/**
 * Export Unified Trade & Financial Transactions Ledger
 */
export interface ExportableTransaction {
  id: string;
  type: "withdrawal" | "expense";
  date: string;
  firmName: string;
  accountLabel: string;
  category?: string;
  netAmount: number;
  status: string;
  notes?: string;
}

export function exportTransactionsToCSV(
  transactions: ExportableTransaction[],
  customFilename?: string
): void {
  const headers = [
    "ID",
    "Tipo",
    "Fecha",
    "Empresa",
    "Cuenta",
    "Categoría / Concepto",
    "Impacto Neto ($)",
    "Estado",
    "Notas",
  ];

  const rows = transactions.map((t) => [
    t.id,
    t.type === "withdrawal" ? "Retiro (Cobro)" : "Gasto (Inversión)",
    t.date,
    t.firmName,
    t.accountLabel,
    t.category || (t.type === "withdrawal" ? "Payout" : "Examen"),
    t.type === "withdrawal" ? `+${t.netAmount}` : `-${t.netAmount}`,
    t.status,
    t.notes || "",
  ]);

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `transacciones-trading-${dateStr}.csv`;
  const csv = buildCSVContent(headers, rows);
  downloadCSV(filename, csv);
}

/**
 * Export Fiscal Tax Summary for a Financial Year
 */
export function exportTaxSummaryToCSV(
  expenses: Expense[],
  withdrawals: Withdrawal[],
  year: number = new Date().getFullYear(),
  customFilename?: string
): void {
  const yearExpenses = expenses.filter((e) => e.date.startsWith(String(year)));
  const yearWithdrawals = withdrawals.filter((w) => w.date.startsWith(String(year)) && w.status === "completed");

  const totalGrossPayouts = yearWithdrawals.reduce((sum, w) => sum + (w.gross_amount ?? w.net_amount), 0);
  const totalPayoutFees = yearWithdrawals.reduce((sum, w) => sum + (w.fee_amount ?? 0), 0);
  const totalNetPayouts = yearWithdrawals.reduce((sum, w) => sum + w.net_amount, 0);

  const totalExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);
  const deductibleExpenses = totalExpenses;
  const netTaxableIncome = totalNetPayouts - deductibleExpenses;

  const headers = ["Concepto Fiscal", `Año Fiscal ${year} (USD)`];
  const rows = [
    ["Cobros Brutos Registrados", totalGrossPayouts],
    ["Comisiones de Retiro Retenidas", totalPayoutFees],
    ["Cobros Netos Percibidos", totalNetPayouts],
    ["Total Gastos en Exámenes / Resets", totalExpenses],
    ["Gastos Fiscalmente Deducibles", deductibleExpenses],
    ["Base Imponible Estimada (Cobros Netos - Gastos Deducibles)", netTaxableIncome],
    ["Tasa de Retorno del Capital (ROI %)", totalExpenses > 0 ? `${((totalNetPayouts / totalExpenses) * 100).toFixed(2)}%` : "N/A"],
  ];

  const filename = customFilename || `resumen-fiscal-trading-${year}.csv`;
  const csv = buildCSVContent(headers, rows);
  downloadCSV(filename, csv);
}
