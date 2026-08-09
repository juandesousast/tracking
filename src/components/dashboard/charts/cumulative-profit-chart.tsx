"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Expense, Withdrawal } from "@/types/database";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CumulativeProfitChartProps {
  expenses: Expense[];
  withdrawals: Withdrawal[];
}

interface ChartPoint {
  date: string;
  displayDate: string;
  cumulativeNetProfit: number;
  cumulativeExpenses: number;
  cumulativeWithdrawals: number;
}

export function CumulativeProfitChart({ expenses, withdrawals }: CumulativeProfitChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Process data chronologically
  const chartData = (() => {
    // Combine events
    type Event = {
      date: string;
      expenseAmount: number;
      withdrawalAmount: number;
    };

    const eventsMap = new Map<string, Event>();

    expenses.forEach((e) => {
      if (!e.date) return;
      const dateKey = e.date.slice(0, 10);
      const existing = eventsMap.get(dateKey) || { date: dateKey, expenseAmount: 0, withdrawalAmount: 0 };
      existing.expenseAmount += e.amount || 0;
      eventsMap.set(dateKey, existing);
    });

    withdrawals.forEach((w) => {
      if (!w.date) return;
      const dateKey = w.date.slice(0, 10);
      const net = (w.gross_amount || 0) - (w.fee_amount || 0);
      const existing = eventsMap.get(dateKey) || { date: dateKey, expenseAmount: 0, withdrawalAmount: 0 };
      existing.withdrawalAmount += net;
      eventsMap.set(dateKey, existing);
    });

    const sortedDates = Array.from(eventsMap.keys()).sort((a, b) => (a > b ? 1 : -1));

    let runningExpenses = 0;
    let runningWithdrawals = 0;

    const data: ChartPoint[] = sortedDates.map((dateStr) => {
      const event = eventsMap.get(dateStr)!;
      runningExpenses += event.expenseAmount;
      runningWithdrawals += event.withdrawalAmount;
      const cumulativeNetProfit = runningWithdrawals - runningExpenses;

      const dateObj = new Date(dateStr);
      const displayDate = isNaN(dateObj.getTime())
        ? dateStr
        : dateObj.toLocaleDateString("es-ES", { month: "short", day: "numeric" });

      return {
        date: dateStr,
        displayDate,
        cumulativeNetProfit,
        cumulativeExpenses: runningExpenses,
        cumulativeWithdrawals: runningWithdrawals,
      };
    });

    return data;
  })();

  const currentProfit = chartData.length > 0 ? chartData[chartData.length - 1].cumulativeNetProfit : 0;
  const isPositiveTrend = currentProfit >= 0;

  if (!isMounted) {
    return (
      <Card className="border border-border/60 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Evolución Acumulada de Ganancias</CardTitle>
          <CardDescription className="text-xs">
            Evolución en el tiempo de la ganancia neta (Retiros Netos - Gastos Totales).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full flex items-center justify-center text-muted-foreground text-xs">
            Cargando gráfico...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/60 shadow-xs">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Evolución Acumulada de Ganancias
            {chartData.length > 0 && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                  isPositiveTrend
                    ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-500 dark:text-rose-400"
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
          </CardTitle>
          <CardDescription className="text-xs">
            Histórico temporal acumulado del rendimiento financiero neto.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[280px] w-full flex items-center justify-center text-xs text-muted-foreground">
            No hay datos suficientes para mostrar la evolución acumulada.
          </div>
        ) : (
          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800/40" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  className="text-[11px] fill-muted-foreground"
                  dy={5}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-[11px] fill-muted-foreground"
                  tickFormatter={(val) => `${val}€`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = payload[0].payload as ChartPoint;
                      const profit = dataPoint.cumulativeNetProfit;
                      return (
                        <div className="rounded-lg border border-border/80 bg-background/95 p-3 shadow-md backdrop-blur-xs text-xs space-y-1.5 min-w-[170px]">
                          <div className="font-semibold text-foreground pb-1 border-b border-border/40">
                            {dataPoint.date}
                          </div>
                          <div className="flex justify-between items-center text-muted-foreground">
                            <span>Retiros acum.:</span>
                            <span className="font-medium text-emerald-500">{formatCurrency(dataPoint.cumulativeWithdrawals)}</span>
                          </div>
                          <div className="flex justify-between items-center text-muted-foreground">
                            <span>Gastos acum.:</span>
                            <span className="font-medium text-amber-500">{formatCurrency(dataPoint.cumulativeExpenses)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-border/40 font-semibold">
                            <span className="text-foreground">Ganancia Neta:</span>
                            <span className={profit >= 0 ? "text-emerald-500" : "text-rose-500"}>
                              {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
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
                  dataKey="cumulativeNetProfit"
                  stroke={isPositiveTrend ? "#10b981" : "#f43f5e"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={isPositiveTrend ? "url(#emeraldGradient)" : "url(#roseGradient)"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
