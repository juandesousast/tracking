"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FirmFinancialSummary } from "@/types/database";
import { formatCurrency } from "@/lib/formatters";

interface FirmPerformanceChartProps {
  firmSummaries: FirmFinancialSummary[];
}

export function FirmPerformanceChart({ firmSummaries }: FirmPerformanceChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = firmSummaries.map((firm) => ({
    name: firm.firmName,
    gastos: firm.summary.totalExpenses,
    retiros: firm.summary.netWithdrawals,
    lucro: firm.summary.netProfit,
  }));

  if (!isMounted) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs rounded-2xl p-6 h-[380px] flex items-center justify-center text-xs text-slate-400">
        Cargando comparativa por empresa...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs rounded-2xl p-6 flex flex-col justify-between h-full">
      <div className="pb-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Comparativa por Empresa
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Comparación directa de Gastos Totales vs Retiros Netos por firma de fondeo.
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[270px] w-full flex items-center justify-center text-xs text-slate-400">
          No hay firmas registradas para comparar.
        </div>
      ) : (
        <div className="h-[270px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 15, right: 20, left: 15, bottom: 5 }} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="stroke-slate-100 dark:stroke-slate-800/40" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                className="text-[11px] fill-slate-400"
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
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const gastos = (payload.find((p) => p.dataKey === "gastos")?.value as number) || 0;
                    const retiros = (payload.find((p) => p.dataKey === "retiros")?.value as number) || 0;
                    const profit = retiros - gastos;
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[170px] tabular-nums">
                        <div className="font-semibold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                          {label}
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            Gastos:
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(gastos)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Retiros Netos:
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(retiros)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800 font-bold">
                          <span className="text-slate-900 dark:text-white">Ganancia:</span>
                          <span className={profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                            {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize mr-2">{value}</span>
                )}
              />
              <Bar
                dataKey="gastos"
                name="Gastos"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="retiros"
                name="Retiros Netos"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

