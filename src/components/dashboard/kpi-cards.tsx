"use client";

import { FinancialSummary } from "@/types/database";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { PeriodComparisonResult } from "@/lib/financials";
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Receipt,
  ArrowDownToLine,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface KpiCardsProps {
  summary: FinancialSummary;
  comparison?: PeriodComparisonResult;
}

export function KpiCards({ summary, comparison }: KpiCardsProps) {
  const isNetProfitPositive = summary.netProfit >= 0;

  const renderBadge = (changePercent?: number) => {
    if (changePercent === undefined || isNaN(changePercent)) return null;
    const isUp = changePercent >= 0;
    const Icon = isUp ? ArrowUpRight : ArrowDownRight;

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          isUp
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
            : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
        }`}
      >
        <Icon className="h-3 w-3" />
        {isUp ? "+" : ""}
        {changePercent.toFixed(1)}% vs período anterior
      </span>
    );
  };

  const cards = [
    {
      title: "Ganancia Neta",
      value: formatCurrency(summary.netProfit),
      subtitle: "Retiros Netos - Gastos Totales",
      badge: renderBadge(comparison?.netProfitChangePercent),
      icon: isNetProfitPositive ? TrendingUp : TrendingDown,
      iconColor: isNetProfitPositive
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400",
      bgColor: isNetProfitPositive
        ? "bg-emerald-50 dark:bg-emerald-950/40"
        : "bg-rose-50 dark:bg-rose-950/40",
    },
    {
      title: "ROI %",
      value: formatPercent(summary.roiPercentage),
      subtitle: "Rendimiento sobre capital invertido",
      badge: renderBadge(comparison?.roiChangePercent),
      icon: Percent,
      iconColor: summary.roiPercentage >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400",
      bgColor: summary.roiPercentage >= 0
        ? "bg-emerald-50 dark:bg-emerald-950/40"
        : "bg-rose-50 dark:bg-rose-950/40",
    },
    {
      title: "Gastos Totales",
      value: formatCurrency(summary.totalExpenses),
      subtitle: "Inversión en pruebas y resets",
      badge: renderBadge(comparison?.expensesChangePercent),
      icon: Receipt,
      iconColor: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
    },
    {
      title: "Retiros Totales",
      value: formatCurrency(summary.netWithdrawals),
      subtitle: "Ganancias cobradas",
      badge: renderBadge(comparison?.withdrawalsChangePercent),
      icon: ArrowDownToLine,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
          >
            {/* Header: Title + Icon */}
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>

            {/* Value */}
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums my-1">
              {card.value}
            </div>

            {/* Subtitle / Explanatory text & Badge */}
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-1">
              {card.badge && <div>{card.badge}</div>}
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}



