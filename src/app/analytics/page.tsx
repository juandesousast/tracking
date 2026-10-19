"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { PropFirm, Account, Expense, Withdrawal } from "@/types/database";
import { getFirms, getAccounts, getExpenses, getWithdrawals } from "@/lib/actions/actions";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { calculateTradingDashboardMetrics, getDailyPnLMap } from "@/lib/financials";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Percent,
  Activity,
  Award,
  RefreshCw,
  Wallet,
  Building2,
  Calendar,
} from "lucide-react";

function AnalyticsPageContent() {
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

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
      console.error("Error loading analytics data:", err);
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

  const dashboardMetrics = useMemo(() => {
    return calculateTradingDashboardMetrics(expenses, withdrawals, accounts, selectedAccountId);
  }, [expenses, withdrawals, accounts, selectedAccountId]);

  const dailyMap = useMemo(() => {
    return getDailyPnLMap(expenses, withdrawals, selectedAccountId);
  }, [expenses, withdrawals, selectedAccountId]);

  // Daily distribution data for bar chart
  const dailyDistributionData = useMemo(() => {
    const sortedDates = Array.from(dailyMap.keys()).sort();
    return sortedDates.map((date) => {
      const entry = dailyMap.get(date)!;
      return {
        date: date.slice(5), // MM-DD
        pnl: entry.netProfit,
        expenses: entry.totalExpenses,
        withdrawals: entry.totalWithdrawals,
      };
    });
  }, [dailyMap]);

  // Expenses category breakdown
  const expensesBreakdown = useMemo(() => {
    const categories: Record<string, number> = {
      evaluation: 0,
      activation: 0,
      reset: 0,
      subscription: 0,
      other: 0,
    };

    const relevantExpenses =
      selectedAccountId === "all"
        ? expenses
        : expenses.filter((e) => e.account_id === selectedAccountId);

    relevantExpenses.forEach((e) => {
      const cat = e.category in categories ? e.category : "other";
      categories[cat] += Number(e.amount) || 0;
    });

    const totalExp = Object.values(categories).reduce((sum, val) => sum + val, 0);

    return {
      categories,
      totalExp,
    };
  }, [expenses, selectedAccountId]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  const { consistency, equityCurve } = dashboardMetrics;

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Analítica de Rendimiento Institucional
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Analítica Avanzada & Curva de Capital
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Métricas de consistencia cuantitativa, factor de beneficio y evolución temporal de equity.
          </p>
        </div>

        {/* Global Account Selector */}
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Select
              value={selectedAccountId}
              onValueChange={(val) => {
                if (val) setSelectedAccountId(val);
              }}
            >
              <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-medium">
                <SelectValue placeholder="Todas las Cuentas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Cuentas</SelectItem>
                {accounts.map((a) => {
                  const firm = firmMap.get(a.firm_id);
                  return (
                    <SelectItem key={a.id} value={a.id}>
                      {firm?.name} - ${a.account_size.toLocaleString()} {a.alias ? `(${a.alias})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
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

      {/* 4 Quantitative Consistency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profit Factor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Profit Factor
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                consistency.profitFactor >= 1.5
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              {consistency.profitFactor >= 1.5 ? "Excelente" : "Moderado"}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
              {consistency.profitFactor.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Ratio Ganancias Brutas / Pérdidas
          </p>
        </div>

        {/* Win Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Win Rate de Días Operativos
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black tabular-nums tracking-tight text-blue-600 dark:text-blue-400">
              {consistency.winRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {consistency.totalTrades} días con actividad registrada
          </p>
        </div>

        {/* Best Day PnL */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Mejor Día Registrado
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(consistency.bestDayPnL)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Pico máximo de beneficio diario
          </p>
        </div>

        {/* Worst Day / Drawdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Peor Día / Drawdown Máximo
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold tabular-nums tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(consistency.worstDayPnL)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Mayor pérdida o coste en 1 jornada
          </p>
        </div>
      </div>

      {/* Primary Chart: Curva de Capital (Cumulative Equity Curve) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Curva de Capital Acumulado (Equity Curve)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evolución continua del balance neto a lo largo del tiempo.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium">PnL Neto Total</span>
            <div
              className={`text-lg font-bold tabular-nums ${
                consistency.totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
              }`}
            >
              {consistency.totalPnL >= 0 ? "+" : ""}
              {formatCurrency(consistency.totalPnL)}
            </div>
          </div>
        </div>

        {equityCurve.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-slate-400 text-xs">
            Sin datos suficientes para graficar la curva de capital.
          </div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(Number(val)), "Balance"]}
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
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#equityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Grid of 2 Charts: Daily PnL Distribution & Expense Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily PnL Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            Distribución de PnL Diario
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Rendimiento por día con discriminación visual de días verdes y rojos.
          </p>

          {dailyDistributionData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-400 text-xs">
              No hay jornadas registradas.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyDistributionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={(val) => `${val >= 0 ? "+" : ""}${val}€`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), "PnL Diario"]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {dailyDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? "#10b981" : "#f43f5e"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Expenses Category Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Estructura de Costes de Fondeo
            </h2>
            <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
              Total: {formatCurrency(expensesBreakdown.totalExp)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Desglose de gastos en pruebas de evaluación, activaciones y reinicios.
          </p>

          <div className="space-y-4">
            {[
              {
                label: "Pruebas de Evaluación (Challenges)",
                amount: expensesBreakdown.categories.evaluation,
                color: "bg-blue-500",
              },
              {
                label: "Tarifas de Activación (Funded Fee)",
                amount: expensesBreakdown.categories.activation,
                color: "bg-emerald-500",
              },
              {
                label: "Reinicios de Cuenta (Resets)",
                amount: expensesBreakdown.categories.reset,
                color: "bg-amber-500",
              },
              {
                label: "Suscripciones Mensuales",
                amount: expensesBreakdown.categories.subscription,
                color: "bg-purple-500",
              },
              {
                label: "Otros Costes",
                amount: expensesBreakdown.categories.other,
                color: "bg-slate-400",
              },
            ].map((item) => {
              const pct =
                expensesBreakdown.totalExp > 0
                  ? (item.amount / expensesBreakdown.totalExp) * 100
                  : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                    <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                      {formatCurrency(item.amount)} ({pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AnalyticsPageContent />
    </Suspense>
  );
}
