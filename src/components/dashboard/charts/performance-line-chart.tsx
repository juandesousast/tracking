"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Expense, Withdrawal } from "@/types/database";
import {
  getMonthlyTimelineData,
  getGlobalTimelineData,
  TimelineDataPoint,
} from "@/lib/financials";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Calendar, RotateCcw, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PerformanceLineChartProps {
  expenses: Expense[];
  withdrawals: Withdrawal[];
  startDate?: string | null;
  endDate?: string | null;
  onResetFilters?: () => void;
}

export function PerformanceLineChart({
  expenses,
  withdrawals,
  startDate,
  endDate,
  onResetFilters,
}: PerformanceLineChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"global" | "monthly">("global");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine grouping mode based on date range duration
  const isDailyRange = useMemo(() => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return diffDays <= 31;
  }, [startDate, endDate]);

  const globalData = useMemo(() => {
    return getGlobalTimelineData(expenses, withdrawals);
  }, [expenses, withdrawals]);

  const monthlyData = useMemo(() => {
    return getMonthlyTimelineData(expenses, withdrawals);
  }, [expenses, withdrawals]);

  // If date range is <= 31 days, use global (daily cumulative) timeline data by default
  const activeData = isDailyRange
    ? globalData
    : timeframe === "global"
    ? globalData
    : monthlyData;

  const currentProfit = globalData.length > 0 ? globalData[globalData.length - 1].netProfit : 0;
  const isPositiveTrend = currentProfit >= 0;

  if (!isMounted) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs rounded-2xl p-6 h-[380px] flex items-center justify-center text-xs text-slate-400">
        Cargando gráfico de Cash Flow Projection...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs rounded-2xl p-6 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Cash Flow Projection
            </h3>
            {globalData.length > 0 && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border tabular-nums ${
                  isPositiveTrend
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
                    : "bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40"
                }`}
              >
                {isPositiveTrend ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isPositiveTrend ? "+" : ""}{formatCurrency(currentProfit)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isDailyRange
              ? "Vista diaria (rango <= 31 días) de Retiros Netos vs Gastos Totales."
              : "Línea continua de Retiros Netos vs Gastos Totales acumulados."}
          </p>
        </div>

        {/* Timeframe Segmented Selector (only if not forced daily range) */}
        {!isDailyRange && (
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-0.5 text-xs">
            <button
              onClick={() => setTimeframe("global")}
              className={`px-3 py-1 rounded-md transition-all text-xs font-semibold ${
                timeframe === "global"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Días / Global
            </button>
            <button
              onClick={() => setTimeframe("monthly")}
              className={`px-3 py-1 rounded-md transition-all text-xs font-semibold ${
                timeframe === "monthly"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Mensual
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 text-xs mb-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Retiros Netos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Gastos Totales</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
          <span className="text-slate-600 dark:text-slate-400 font-medium">Flujo Neto</span>
        </div>
      </div>

      {/* Chart or Empty State */}
      {activeData.length === 0 ? (
        <div className="h-[270px] w-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <LineChart className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Sin actividad en el período seleccionado
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-sm">
            No se registraron gastos ni retiros en las fechas o filtros especificados.
          </p>
          {onResetFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restablecer filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="h-[270px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 15, right: 20, left: 15, bottom: 5 }}>
              <defs>
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="stroke-slate-100 dark:stroke-slate-800/40" />
              <XAxis
                dataKey="displayDate"
                tickLine={false}
                axisLine={false}
                className="text-[11px] fill-slate-400 tabular-nums"
                dy={5}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={65}
                className="text-[11px] fill-slate-400 tabular-nums"
                tickFormatter={(val) => `${val} €`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPoint = payload[0].payload as TimelineDataPoint;
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[190px] tabular-nums">
                        <div className="font-semibold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-blue-600" />
                          {dataPoint.displayDate} ({dataPoint.date})
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                          <span>Retiros Netos:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(dataPoint.netWithdrawals)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                          <span>Gastos Totales:</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">{formatCurrency(dataPoint.totalExpenses)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 font-bold">
                          <span className="text-slate-900 dark:text-white">Flujo Neto:</span>
                          <span className={dataPoint.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                            {dataPoint.netProfit >= 0 ? "+" : ""}{formatCurrency(dataPoint.netProfit)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="netWithdrawals"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWithdrawals)"
              />
              <Area
                type="monotone"
                dataKey="totalExpenses"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpenses)"
              />
              <Area
                type="monotone"
                dataKey="netProfit"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
