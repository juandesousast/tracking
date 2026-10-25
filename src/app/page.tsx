"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { PropFirm, Account, Expense, Withdrawal } from "@/types/database";
import {
  calculateTradingDashboardMetrics,
  calculateFinancialSummary,
  getDailyPnLMap,
} from "@/lib/financials";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getPropFirmLogo } from "@/lib/constants/prop-firms";
import { PageSkeleton } from "@/components/ui/page-skeleton";

import {
  getFirms,
  getAccounts,
  getExpenses,
  getWithdrawals,
  addFirm,
  addAccount,
  addExpense,
  addWithdrawal,
  updateFirm,
  deleteFirm,
  updateAccount,
  deleteAccount,
  updateExpense,
  deleteExpense,
  updateWithdrawal,
  deleteWithdrawal,
} from "@/lib/actions/actions";

import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  ArrowDownToLine,
  Building2,
  Calendar,
  Sparkles,
  Layers,
  ChevronRight,
  Repeat,
  ShieldCheck,
  Award,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import { AddFirmModal } from "@/components/modals/add-firm-modal";
import { AddAccountModal } from "@/components/modals/add-account-modal";
import { AddExpenseModal } from "@/components/modals/add-expense-modal";
import { AddWithdrawalModal } from "@/components/modals/add-withdrawal-modal";
import { EditFirmModal } from "@/components/modals/edit-firm-modal";
import { EditAccountModal } from "@/components/modals/edit-account-modal";
import { EditExpenseModal } from "@/components/modals/edit-expense-modal";
import { EditWithdrawalModal } from "@/components/modals/edit-withdrawal-modal";

function HomePageContent() {
  const [isLoading, setIsLoading] = useState(true);

  // Core Data
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Selected Account Filter ("all" or specific account ID)
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

  // Modal States
  const [isAddFirmOpen, setIsAddFirmOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddWithdrawalOpen, setIsAddWithdrawalOpen] = useState(false);

  // Edit Targets
  const [editingFirm, setEditingFirm] = useState<PropFirm | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);

  const loadData = useCallback(async () => {
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
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const firmMap = useMemo(() => {
    const map = new Map<string, PropFirm>();
    firms.forEach((f) => map.set(f.id, f));
    return map;
  }, [firms]);

  // Executive Tradelio Metrics
  const dashboardMetrics = useMemo(() => {
    return calculateTradingDashboardMetrics(expenses, withdrawals, accounts, selectedAccountId);
  }, [expenses, withdrawals, accounts, selectedAccountId]);

  // Funding Health Metrics
  const fundingSummary = useMemo(() => {
    const relevantExpenses =
      selectedAccountId === "all"
        ? expenses
        : expenses.filter((e) => e.account_id === selectedAccountId);

    const relevantWithdrawals =
      selectedAccountId === "all"
        ? withdrawals
        : withdrawals.filter((w) => w.account_id === selectedAccountId);

    return calculateFinancialSummary(relevantExpenses, relevantWithdrawals);
  }, [expenses, withdrawals, selectedAccountId]);

  // Active accounts with resolved logos
  const activeAccountsList = useMemo(() => {
    const active = accounts.filter((a) => a.status === "active");
    return active.map((a) => {
      const firm = firmMap.get(a.firm_id);
      const firmName = firm?.name || "Empresa Desconocida";
      const logoUrl = getPropFirmLogo(firmName, firm?.logo_url);
      return {
        ...a,
        firmName,
        logoUrl,
      };
    });
  }, [accounts, firmMap]);

  // Recent transactions list
  const recentTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      type: "withdrawal" | "expense";
      firmName: string;
      logoUrl: string | null;
      accountLabel: string;
      description: string;
      amount: number;
      rawExpense?: Expense;
      rawWithdrawal?: Withdrawal;
    }> = [];

    const relevantWithdrawals =
      selectedAccountId === "all"
        ? withdrawals
        : withdrawals.filter((w) => w.account_id === selectedAccountId);

    const relevantExpenses =
      selectedAccountId === "all"
        ? expenses
        : expenses.filter((e) => e.account_id === selectedAccountId);

    relevantWithdrawals.forEach((w) => {
      const firm = w.firm_id ? firmMap.get(w.firm_id) : undefined;
      const firmName = firm?.name || "Empresa Desconocida";
      const logoUrl = getPropFirmLogo(firmName, firm?.logo_url);
      const net = typeof w.net_amount === "number" ? w.net_amount : (w.gross_amount || 0) - (w.fee_amount || 0);

      list.push({
        id: w.id,
        date: w.date,
        type: "withdrawal",
        firmName,
        logoUrl,
        accountLabel: w.account_id ? "Cuenta Fondeada" : "General",
        description: "Cobro de beneficios aprobado",
        amount: net,
        rawWithdrawal: w,
      });
    });

    relevantExpenses.forEach((e) => {
      const firm = e.firm_id ? firmMap.get(e.firm_id) : undefined;
      const firmName = firm?.name || "Empresa Desconocida";
      const logoUrl = getPropFirmLogo(firmName, firm?.logo_url);

      list.push({
        id: e.id,
        date: e.date,
        type: "expense",
        firmName,
        logoUrl,
        accountLabel: e.account_id ? "Cuenta Asignada" : "Evaluación",
        description: e.description || e.category,
        amount: -Math.abs(e.amount),
        rawExpense: e,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  }, [withdrawals, expenses, selectedAccountId, firmMap]);

  // Handlers
  const handleAddFirm = async (firmData: { name: string; website: string | null; logo_url?: string | null }) => {
    try {
      const created = await addFirm(firmData);
      setFirms((prev) => [...prev, created]);
    } catch (err) {
      console.error("Error adding firm:", err);
    }
  };

  const handleAddAccount = async (accData: {
    firm_id: string;
    account_size: number;
    account_type: string;
    status: string;
    account_number?: string | null;
    alias?: string | null;
  }) => {
    try {
      const created = await addAccount(accData);
      setAccounts((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding account:", err);
    }
  };

  const handleAddExpense = async (expenseData: {
    firm_id: string | null;
    account_id: string | null;
    amount: number;
    category: string;
    description: string | null;
    date: string;
  }) => {
    if (!expenseData.firm_id) return;
    try {
      const created = await addExpense({
        firm_id: expenseData.firm_id,
        account_id: expenseData.account_id,
        amount: expenseData.amount,
        category: expenseData.category,
        description: expenseData.description,
        date: expenseData.date,
      });
      setExpenses((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleAddWithdrawal = async (wData: {
    firm_id: string | null;
    account_id: string | null;
    gross_amount: number;
    fee_amount: number;
    status: string;
    date: string;
  }) => {
    if (!wData.firm_id) return;
    try {
      const created = await addWithdrawal({
        firm_id: wData.firm_id,
        account_id: wData.account_id,
        gross_amount: wData.gross_amount,
        fee_amount: wData.fee_amount,
        status: wData.status,
        date: wData.date,
      });
      setWithdrawals((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding withdrawal:", err);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  const { today, consistency, equityCurve } = dashboardMetrics;

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Executive Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mesa Ejecutiva de Trading & Fondeo
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Dashboard General de Rendimiento
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas de consistencia institucional, pulso de trading en vivo y evolución de capital.
          </p>
        </div>

        {/* Account Selector & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Account Filter Dropdown */}
          <div className="w-56">
            <Select
              value={selectedAccountId}
              onValueChange={(val) => {
                if (val) setSelectedAccountId(val);
              }}
            >
              <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-medium bg-white dark:bg-slate-900 shadow-xs">
                <SelectValue placeholder="Todas las Cuentas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-3.5 w-3.5 text-blue-500" />
                    <span>Todas las Cuentas</span>
                  </div>
                </SelectItem>
                {accounts.map((a) => {
                  const firm = firmMap.get(a.firm_id);
                  const logo = getPropFirmLogo(firm?.name || "", firm?.logo_url);
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      <div className="flex items-center gap-2">
                        {logo ? (
                          <img src={logo} alt="" className="h-4 w-4 rounded-xs object-contain" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span>
                          {firm?.name} - ${a.account_size.toLocaleString()}{" "}
                          {a.alias ? `(${a.alias})` : ""}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <Button
            size="sm"
            onClick={() => setIsAddWithdrawalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Retiro</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddExpenseOpen(true)}
            className="gap-1.5"
          >
            <Receipt className="h-4 w-4" />
            <span>Registrar Gasto</span>
          </Button>
        </div>
      </div>

      {/* 2. SECTION: Pulso de Hoy (Today's Trading Performance) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pulso del Día de Trading
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              ({new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" })})
            </span>
          </div>
          <Link
            href="/calendario"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
          >
            Ver Calendario Mensual
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="PnL Neto de Hoy"
            value={`${today.todayPnL > 0 ? "+" : ""}${formatCurrency(today.todayPnL)}`}
            subtitle="Sesión activa de hoy"
            badge={{
              text: today.todayPnL > 0 ? "Positivo" : today.todayPnL < 0 ? "En Negativo" : "Sin Cambios",
              variant: today.todayPnL > 0 ? "positive" : today.todayPnL < 0 ? "negative" : "neutral",
            }}
            icon={today.todayPnL >= 0 ? TrendingUp : TrendingDown}
            iconColor={today.todayPnL >= 0 ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}
          />
          <StatCard
            title="Operaciones de Hoy"
            value={today.winsCount + today.lossesCount}
            subtitle={`${today.winsCount} Ganadores • ${today.lossesCount} Perdedores`}
            badge={{
              text: `${today.winsCount + today.lossesCount} trades`,
              variant: "info",
            }}
            icon={Layers}
            iconColor="text-blue-500 bg-blue-500/10"
          />
          <StatCard
            title="Mejor Operación de Hoy"
            value={today.bestTrade !== null ? `+${formatCurrency(today.bestTrade)}` : "—"}
            subtitle="Pico máximo de beneficio"
            badge={{ text: "Máximo PnL", variant: "positive" }}
            icon={Award}
            iconColor="text-amber-500 bg-amber-500/10"
          />
          <StatCard
            title="Peor Operación de Hoy"
            value={today.worstTrade !== null ? formatCurrency(today.worstTrade) : "—"}
            subtitle="Mayor pérdida controlada"
            badge={{ text: "Control de Riesgo", variant: "negative" }}
            icon={ShieldCheck}
            iconColor="text-rose-500 bg-rose-500/10"
          />
        </div>
      </div>

      {/* 3. SECTION: Rendimiento Global & Consistencia Institucional */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Métricas de Consistencia Institucional
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="PnL Neto Acumulado"
            value={`${consistency.totalPnL >= 0 ? "+" : ""}${formatCurrency(consistency.totalPnL)}`}
            subtitle="Beneficio limpio descontando gastos"
            badge={{
              text: consistency.totalPnL >= 0 ? "En Ganancia" : "En Pérdida",
              variant: consistency.totalPnL >= 0 ? "positive" : "negative",
            }}
            icon={Wallet}
            iconColor="text-emerald-500 bg-emerald-500/10"
          />
          <StatCard
            title="Win Rate de Días"
            value={`${consistency.winRate.toFixed(1)}%`}
            subtitle={`Sobre ${consistency.totalTrades} jornadas activas`}
            badge={{ text: "Consistencia", variant: "info" }}
            icon={TrendingUp}
            iconColor="text-blue-500 bg-blue-500/10"
          />
          <StatCard
            title="Profit Factor"
            value={consistency.profitFactor.toFixed(2)}
            subtitle="Ganancias brutas vs pérdidas"
            badge={{ text: "Ratio", variant: "neutral" }}
            icon={Award}
            iconColor="text-purple-500 bg-purple-500/10"
          />
          <StatCard
            title="Promedio Diario de PnL"
            value={`${consistency.avgDailyPnL >= 0 ? "+" : ""}${formatCurrency(consistency.avgDailyPnL)}`}
            subtitle="Rendimiento diario esperado"
            badge={{
              text: "Por Jornada",
              variant: consistency.avgDailyPnL >= 0 ? "positive" : "negative",
            }}
            icon={Sparkles}
            iconColor="text-cyan-500 bg-cyan-500/10"
          />
        </div>
      </div>

      {/* 4. SECTION: Curva de Capital (2/3) & Cuentas Activas con Logos (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Equity Growth Curve Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Curva de Crecimiento de Capital (Equity Curve)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evolución acumulada de los fondos asignados y resultados netos.
              </p>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              Analítica Detallada
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {equityCurve.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
              Registra transacciones o cuentas para visualizar la curva de equity.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardEquityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), "Balance Total"]}
                    labelFormatter={(lbl) => `Fecha: ${lbl}`}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#dashboardEquityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Active Accounts with Official Logos (1 Col) */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Cuentas Activas & Firmas
              </h2>
              <Link
                href="/cuentas"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Ver todas ({accounts.length})
              </Link>
            </div>

            {activeAccountsList.length === 0 ? (
              <div className="py-12 text-center">
                <Wallet className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No hay cuentas de fondeo activas registradas.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddAccountOpen(true)}
                  className="mt-3 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Añadir Cuenta</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAccountsList.slice(0, 4).map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {acc.logoUrl ? (
                        <img
                          src={acc.logoUrl}
                          alt={acc.firmName}
                          className="h-8 w-8 rounded-lg object-contain bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
                          <Building2 className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {acc.firmName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {acc.account_number ? `#${acc.account_number}` : ""} {acc.alias ? `• ${acc.alias}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                        ${acc.account_size.toLocaleString()}
                      </div>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        Activa
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Capital Total Asignado:</span>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              $
              {activeAccountsList
                .reduce((sum, a) => sum + (Number(a.account_size) || 0), 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 5. SECTION: Salud de Fondeo & Capital (Prop Firm Funding Health) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Salud Financiera & Retorno de Fondeo (Funding ROI)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Balance entre los costes de evaluación / reinicios y los cobros reales transferidos.
            </p>
          </div>
          <Link
            href="/gastos"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Ver Detalle de Gastos
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Invertido en Pruebas
            </span>
            <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white mt-1">
              {formatCurrency(fundingSummary.totalExpenses)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Exámenes, activaciones y resets</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Cobros Netos (Payouts)
            </span>
            <div className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(fundingSummary.netWithdrawals)}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Beneficios limpios en cuenta bancaria</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ROI Global de Fondeo
            </span>
            <div
              className={`text-xl font-bold tabular-nums mt-1 ${
                fundingSummary.roiPercentage >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
              }`}
            >
              {fundingSummary.roiPercentage >= 0 ? "+" : ""}
              {fundingSummary.roiPercentage.toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Rendimiento sobre capital invertido</p>
          </div>
        </div>
      </div>

      {/* 6. SECTION: Últimos Movimientos & Acciones Rápidas */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Últimos Movimientos Registrados
            </h2>
          </div>
          <Link
            href="/trades"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            Ver Libro Mayor Completo
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No hay movimientos recientes registrados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => {
              const isWin = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {tx.logoUrl ? (
                      <img
                        src={tx.logoUrl}
                        alt={tx.firmName}
                        className="h-7 w-7 rounded-md object-contain bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {tx.firmName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {tx.date} • {tx.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-bold tabular-nums ${
                        isWin ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isWin ? "+" : ""}
                      {formatCurrency(tx.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (tx.type === "expense" && tx.rawExpense) {
                          setEditingExpense(tx.rawExpense);
                        } else if (tx.type === "withdrawal" && tx.rawWithdrawal) {
                          setEditingWithdrawal(tx.rawWithdrawal);
                        }
                      }}
                      className="h-7 px-2 text-xs font-medium text-slate-500 hover:text-slate-900"
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddFirmModal
        open={isAddFirmOpen}
        onOpenChange={setIsAddFirmOpen}
        onSubmit={handleAddFirm}
      />
      <AddAccountModal
        open={isAddAccountOpen}
        onOpenChange={setIsAddAccountOpen}
        firms={firms}
        onSubmit={handleAddAccount}
      />
      <AddExpenseModal
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        firms={firms}
        accounts={accounts}
        onSubmit={handleAddExpense}
        onFirmAdded={(f: PropFirm) => setFirms((prev) => [...prev, f])}
      />
      <AddWithdrawalModal
        open={isAddWithdrawalOpen}
        onOpenChange={setIsAddWithdrawalOpen}
        firms={firms}
        accounts={accounts}
        onSubmit={handleAddWithdrawal}
        onFirmAdded={(f: PropFirm) => setFirms((prev) => [...prev, f])}
      />

      {editingFirm && (
        <EditFirmModal
          open={!!editingFirm}
          onOpenChange={(open) => !open && setEditingFirm(null)}
          firm={editingFirm}
          onSubmit={async (id, data) => {
            await updateFirm(id, data);
            setEditingFirm(null);
            loadData();
          }}
        />
      )}

      {editingAccount && (
        <EditAccountModal
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
          account={editingAccount}
          firms={firms}
          onSubmit={async (id, data) => {
            await updateAccount(id, data);
            setEditingAccount(null);
            loadData();
          }}
        />
      )}

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

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
