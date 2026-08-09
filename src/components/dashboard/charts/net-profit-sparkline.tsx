"use client";

import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { Expense, Withdrawal } from "@/types/database";
import { getGlobalTimelineData } from "@/lib/financials";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";

interface NetProfitSparklineProps {
  expenses: Expense[];
  withdrawals: Withdrawal[];
}

export function NetProfitSparkline({ expenses, withdrawals }: NetProfitSparklineProps) {
  const data = useMemo(() => {
    return getGlobalTimelineData(expenses, withdrawals);
  }, [expenses, withdrawals]);

  const latestProfit = data.length > 0 ? data[data.length - 1].netProfit : 0;
  const isPositive = latestProfit >= 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs rounded-2xl p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Net Profit Sparkline
          </span>
          <div
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isPositive
                ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
                : "bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40"
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{isPositive ? "Ganancia Acumulada" : "Pérdida Acumulada"}</span>
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums my-1">
          {isPositive ? "+" : ""}{formatCurrency(latestProfit)}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tendencia del balance neto en tiempo real.
        </p>
      </div>

      {/* Mini Sparkline Chart */}
      <div className="h-28 w-full mt-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            Sin datos para sparkline
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={isPositive ? "#10b981" : "#f43f5e"}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={isPositive ? "#10b981" : "#f43f5e"}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const point = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold tabular-nums shadow-lg">
                        {point.displayDate}: {formatCurrency(point.netProfit)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="netProfit"
                stroke={isPositive ? "#10b981" : "#f43f5e"}
                strokeWidth={2.5}
                fill="url(#sparklineGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

