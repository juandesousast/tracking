"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { PropFirm, Account, Expense, Withdrawal } from "@/types/database";
import {
  getFirms,
  getAccounts,
  getExpenses,
  getWithdrawals,
  deleteExpense,
  deleteWithdrawal,
  updateExpense,
  updateWithdrawal,
} from "@/lib/actions/actions";
import { formatCurrency } from "@/lib/formatters";
import { getPropFirmLogo } from "@/lib/constants/prop-firms";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Receipt,
  ArrowDownToLine,
  TrendingUp,
  TrendingDown,
  Building2,
  Trash2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { EditExpenseModal } from "@/components/modals/edit-expense-modal";
import { EditWithdrawalModal } from "@/components/modals/edit-withdrawal-modal";

interface UnifiedTradeRow {
  id: string;
  type: "withdrawal" | "expense";
  date: string;
  firmId: string;
  firmName: string;
  firmLogo: string | null;
  accountId?: string;
  accountLabel: string;
  description: string;
  netAmount: number;
  grossAmount?: number;
  feeAmount?: number;
  category?: string;
  status: string;
  rawExpense?: Expense;
  rawWithdrawal?: Withdrawal;
}

function TradesPageContent() {
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFirm, setSelectedFirm] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "wins" | "losses">("all");

  // Edit modals
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [f, a, e, w] = await Promise.all([
        getFirms(),
        getAccounts(),
        getExpenses(),
        getWithdrawals(),
      ]);
      setFirms(f);
      setAccounts(a);
      setExpenses(e);
      setWithdrawals(w);
    } catch (err) {
      console.error("Error loading trades data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const firmMap = useMemo(() => {
    const map = new Map<string, PropFirm>();
    firms.forEach((f) => map.set(f.id, f));
    return map;
  }, [firms]);

  const accountMap = useMemo(() => {
    const map = new Map<string, Account>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  // Unified trades rows
  const trades: UnifiedTradeRow[] = useMemo(() => {
    const rows: UnifiedTradeRow[] = [];

    withdrawals.forEach((w) => {
      const firm = w.firm_id ? firmMap.get(w.firm_id) : undefined;
      const firmName = firm?.name || "Empresa Desconocida";
      const firmLogo = getPropFirmLogo(firmName, firm?.logo_url);
      const acc = w.account_id ? accountMap.get(w.account_id) : undefined;
      const accountLabel = acc
        ? `${acc.account_number ? `#${acc.account_number}` : ""} ${acc.alias ? `(${acc.alias})` : ""}`.trim() || `$${acc.account_size.toLocaleString()}`
        : "Sin cuenta asignada";

      const net = typeof w.net_amount === "number" ? w.net_amount : (w.gross_amount || 0) - (w.fee_amount || 0);

      rows.push({
        id: w.id,
        type: "withdrawal",
        date: w.date,
        firmId: w.firm_id || "",
        firmName,
        firmLogo,
        accountId: w.account_id || undefined,
        accountLabel,
        description: `Retiro aprobado / cobro de beneficios`,
        netAmount: net,
        grossAmount: w.gross_amount,
        feeAmount: w.fee_amount,
        status: w.status,
        rawWithdrawal: w,
      });
    });

    expenses.forEach((e) => {
      const firm = e.firm_id ? firmMap.get(e.firm_id) : undefined;
      const firmName = firm?.name || "Empresa Desconocida";
      const firmLogo = getPropFirmLogo(firmName, firm?.logo_url);
      const acc = e.account_id ? accountMap.get(e.account_id) : undefined;
      const accountLabel = acc
        ? `${acc.account_number ? `#${acc.account_number}` : ""} ${acc.alias ? `(${acc.alias})` : ""}`.trim() || `$${acc.account_size.toLocaleString()}`
        : "General / Sin cuenta";

      rows.push({
        id: e.id,
        type: "expense",
        date: e.date,
        firmId: e.firm_id || "",
        firmName,
        firmLogo,
        accountId: e.account_id || undefined,
        accountLabel,
        description: e.description || e.category,
        netAmount: -Math.abs(e.amount),
        category: e.category,
        status: "completed",
        rawExpense: e,
      });
    });

    // Sort by date descending
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [withdrawals, expenses, firmMap, accountMap]);

  // Filtered rows
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (selectedFirm !== "all" && t.firmId !== selectedFirm) return false;
      if (selectedAccount !== "all" && t.accountId !== selectedAccount) return false;
      if (selectedType === "wins" && t.netAmount <= 0) return false;
      if (selectedType === "losses" && t.netAmount >= 0) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesFirm = t.firmName.toLowerCase().includes(query);
        const matchesAcc = t.accountLabel.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesDate = t.date.includes(query);
        if (!matchesFirm && !matchesAcc && !matchesDesc && !matchesDate) return false;
      }
      return true;
    });
  }, [trades, selectedFirm, selectedAccount, selectedType, searchTerm]);

  // Aggregate metrics
  const totalNet = useMemo(() => filteredTrades.reduce((acc, t) => acc + t.netAmount, 0), [filteredTrades]);
  const winsCount = useMemo(() => filteredTrades.filter((t) => t.netAmount > 0).length, [filteredTrades]);
  const lossesCount = useMemo(() => filteredTrades.filter((t) => t.netAmount < 0).length, [filteredTrades]);
  const winRate = useMemo(() => {
    const total = winsCount + lossesCount;
    return total > 0 ? (winsCount / total) * 100 : 0;
  }, [winsCount, lossesCount]);

  const handleDelete = async (row: UnifiedTradeRow) => {
    if (!confirm(`¿Estás seguro de eliminar este registro de ${row.firmName}?`)) return;
    try {
      if (row.type === "expense") {
        await deleteExpense(row.id);
      } else {
        await deleteWithdrawal(row.id);
      }
      await loadData();
    } catch (err) {
      console.error("Error deleting trade record:", err);
      alert("Error al eliminar el registro.");
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Libro Mayor de Operaciones & Cobros
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Historial de Trades & Movimientos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro unificado de cobros de beneficios, evaluaciones y comisiones institucionales.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-medium"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net PnL */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            PnL Neto Seleccionado
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-2xl font-bold tabular-nums tracking-tight ${
                totalNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {totalNet >= 0 ? "+" : ""}
              {formatCurrency(totalNet)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {filteredTrades.length} registros totales
          </p>
        </div>

        {/* Win Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Ratio de Cobros (Wins)
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold tabular-nums tracking-tight text-blue-600 dark:text-blue-400">
              {winRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">efectividad</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {winsCount} cobros vs {lossesCount} gastos
          </p>
        </div>

        {/* Total Wins */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cobros / Payouts Aprobados
          </span>
          <div className="flex items-center gap-2 mt-2">
            <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {winsCount}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Flujo de capital positivo
          </p>
        </div>

        {/* Total Expenses / Resets */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Gastos en Exámenes & Resets
          </span>
          <div className="flex items-center gap-2 mt-2">
            <ArrowDownRight className="h-5 w-5 text-rose-500" />
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {lossesCount}
            </span>
          </div>
          <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
            Costes operativos de trading
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por empresa, cuenta, descripción o fecha..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl border-slate-200 dark:border-slate-800 text-xs w-full"
          />
        </div>

        {/* Firm Filter */}
        <div className="w-full md:w-52">
          <Select
            value={selectedFirm}
            onValueChange={(val) => {
              if (val) setSelectedFirm(val);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 text-xs">
              <SelectValue placeholder="Todas las Empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Empresas</SelectItem>
              {firms.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Account Filter */}
        <div className="w-full md:w-56">
          <Select
            value={selectedAccount}
            onValueChange={(val) => {
              if (val) setSelectedAccount(val);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 text-xs">
              <SelectValue placeholder="Todas las Cuentas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Cuentas</SelectItem>
              {accounts.map((a) => {
                const firm = firmMap.get(a.firm_id);
                return (
                  <SelectItem key={a.id} value={a.id}>
                    {firm?.name} - ${a.account_size.toLocaleString()}{" "}
                    {a.alias ? `(${a.alias})` : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="w-full md:w-44">
          <Select
            value={selectedType}
            onValueChange={(val) => {
              if (val) setSelectedType(val as "all" | "wins" | "losses");
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 text-xs">
              <SelectValue placeholder="Todos los Tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Tipos</SelectItem>
              <SelectItem value="wins">Solo Ganancias (Cobros)</SelectItem>
              <SelectItem value="losses">Solo Pérdidas (Gastos)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trades Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">
              Transacciones Encontradas
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredTrades.length}
            </span>
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No se encontraron transacciones
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Prueba a cambiar los filtros o el término de búsqueda para ver más resultados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/60">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-500">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Empresa / Prop Firm</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Cuenta de Fondeo</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Tipo / Concepto</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-right">Monto Neto</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-center">Estado</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrades.map((trade) => {
                  const isPositive = trade.netAmount > 0;
                  return (
                    <TableRow key={trade.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      {/* Date */}
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {new Date(trade.date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>

                      {/* Firm & Logo */}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          {trade.firmLogo ? (
                            <img
                              src={trade.firmLogo}
                              alt={trade.firmName}
                              className="h-6 w-6 rounded-md object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-md bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                              <Building2 className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {trade.firmName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Account */}
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Wallet className="h-3.5 w-3.5 text-slate-400" />
                          <span>{trade.accountLabel}</span>
                        </div>
                      </TableCell>

                      {/* Type / Concept */}
                      <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              isPositive
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40"
                            }`}
                          >
                            {isPositive ? "COBRO (WIN)" : "GASTO (LOSS)"}
                          </span>
                          <span className="truncate max-w-[220px] text-slate-500 dark:text-slate-400">
                            {trade.description}
                          </span>
                        </div>
                      </TableCell>

                      {/* Net Amount */}
                      <TableCell className="text-right whitespace-nowrap">
                        <span
                          className={`text-xs font-bold tabular-nums tracking-tight ${
                            isPositive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {formatCurrency(trade.netAmount)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 capitalize">
                          {trade.status || "Completado"}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (trade.type === "expense" && trade.rawExpense) {
                                setEditingExpense(trade.rawExpense);
                              } else if (trade.type === "withdrawal" && trade.rawWithdrawal) {
                                setEditingWithdrawal(trade.rawWithdrawal);
                              }
                            }}
                            className="h-8 px-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(trade)}
                            className="h-8 px-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Edit Modals */}
      {editingExpense && (
        <EditExpenseModal
          open={!!editingExpense}
          onOpenChange={(open) => !open && setEditingExpense(null)}
          expense={editingExpense}
          firms={firms}
          accounts={accounts}
          onSubmit={async (id, data) => {
            await updateExpense(id, data);
            setEditingExpense(null);
            loadData();
          }}
        />
      )}
      {editingWithdrawal && (
        <EditWithdrawalModal
          open={!!editingWithdrawal}
          onOpenChange={(open) => !open && setEditingWithdrawal(null)}
          withdrawal={editingWithdrawal}
          firms={firms}
          accounts={accounts}
          onSubmit={async (id, data) => {
            await updateWithdrawal(id, data);
            setEditingWithdrawal(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

export default function TradesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TradesPageContent />
    </Suspense>
  );
}
