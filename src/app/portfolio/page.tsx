"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { PropFirm, Account, Expense, Withdrawal } from "@/types/database";
import {
  getFirms,
  getAccounts,
  getExpenses,
  getWithdrawals,
} from "@/lib/actions/actions";
import { formatCurrency } from "@/lib/formatters";
import {
  analyzePortfolioCapital,
  FirmCapitalAllocation,
} from "@/lib/services/portfolio-radar";
import { PropFirmLogo } from "@/components/ui/prop-firm-logo";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PieChart as PieIcon,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Link from "next/link";

const FIRM_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-teal-500",
];

function PortfolioPageContent() {
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fData, aData, eData, wData] = await Promise.all([
        getFirms(),
        getAccounts(),
        getExpenses(),
        getWithdrawals(),
      ]);
      setFirms(fData);
      setAccounts(aData);
      setExpenses(eData);
      setWithdrawals(wData);
    } catch (err) {
      console.error("Error loading portfolio data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const radar = useMemo(() => {
    return analyzePortfolioCapital(accounts, firms, expenses, withdrawals);
  }, [accounts, firms, expenses, withdrawals]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <PieIcon className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Radar de Portafolio & Asignación de Capital
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervisa la diversificación de capital multi-firma, concentración de contraparte y riesgo agregado de drawdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Link href="/cuentas">
            <Button size="sm" className="rounded-xl bg-blue-600 text-white shadow-xs">
              Gestionar Cuentas
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capital Fondeado
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-2 tabular-nums">
            {formatCurrency(radar.totalFundedCapital)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            En {radar.totalFundedAccounts} {radar.totalFundedAccounts === 1 ? "cuenta activa" : "cuentas activas"}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capital en Evaluación
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2 tabular-nums">
            {formatCurrency(radar.totalEvaluationCapital)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            En {radar.totalEvaluationAccounts} {radar.totalEvaluationAccounts === 1 ? "cuenta de examen" : "cuentas de examen"}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Drawdown en Riesgo
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-2 tabular-nums">
            {formatCurrency(radar.totalDrawdownAtRisk)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pérdida acumulada máxima permitida
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Score Diversificación
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {radar.diversificationScore}/100
            </p>
            <Badge
              className={`text-[10px] font-semibold ${
                radar.diversificationScore >= 70
                  ? "bg-emerald-500 text-white"
                  : radar.diversificationScore >= 40
                  ? "bg-amber-500 text-white"
                  : "bg-rose-500 text-white"
              }`}
            >
              {radar.diversificationScore >= 70
                ? "Óptimo"
                : radar.diversificationScore >= 40
                ? "Moderado"
                : "Concentrado"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Índice de dispersión Herfindahl
          </p>
        </div>
      </div>

      {/* Concentration Risk Alert Banner */}
      {radar.concentrationRiskLevel === "high" && radar.topConcentratedFirm && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-semibold text-sm">
              Alerta de Concentración de Capital: {radar.topConcentratedFirm.percentage.toFixed(1)}% en {radar.topConcentratedFirm.firmName}
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Tener más del 50% de tu capital fondeado concentrado en una sola empresa de fondeo incrementa el riesgo de contraparte (retrasos de pago, cambios de reglas o caídas de servidor). Se recomienda diversificar las cuentas entre al menos 2 o 3 firmas institucionales.
            </p>
          </div>
        </div>
      )}

      {/* Capital Distribution Visual Bar */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Distribución de Capital por Empresa de Fondeo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Porcentaje de capital total asignado por firma comercial
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            Total Capital: {formatCurrency(radar.totalCombinedCapital)}
          </span>
        </div>

        {/* Multi-segmented distribution bar */}
        {radar.firmAllocations.length === 0 ? (
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
        ) : (
          <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {radar.firmAllocations.map((alloc, idx) => {
              const totalPct =
                radar.totalCombinedCapital > 0
                  ? (alloc.totalCapital / radar.totalCombinedCapital) * 100
                  : 0;
              const color = FIRM_COLORS[idx % FIRM_COLORS.length];

              return (
                <div
                  key={alloc.firmId}
                  className={`${color} h-full transition-all duration-300 relative group cursor-pointer`}
                  style={{ width: `${totalPct}%` }}
                  title={`${alloc.firmName}: ${totalPct.toFixed(1)}% (${formatCurrency(alloc.totalCapital)})`}
                />
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {radar.firmAllocations.map((alloc, idx) => {
            const totalPct =
              radar.totalCombinedCapital > 0
                ? (alloc.totalCapital / radar.totalCombinedCapital) * 100
                : 0;
            const color = FIRM_COLORS[idx % FIRM_COLORS.length];

            return (
              <div key={alloc.firmId} className="flex items-center gap-2 text-xs">
                <span className={`h-3 w-3 rounded-full ${color}`} />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {alloc.firmName}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {totalPct.toFixed(1)}% ({formatCurrency(alloc.totalCapital)})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Firm Matrix Breakdown Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Desglose Institucional de Riesgo & Retorno por Firma
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Capital fondeado, retiros extraídos, gastos de evaluación y retorno neto sobre la inversión
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {radar.firmAllocations.length} {radar.firmAllocations.length === 1 ? "Firma" : "Firmas"}
          </Badge>
        </div>

        {radar.firmAllocations.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No hay firmas con capital registrado actualmente. Registra tus cuentas en la sección de Cuentas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5">Empresa de Fondeo</th>
                  <th className="py-3 px-4">Cuentas</th>
                  <th className="py-3 px-4 text-right">Capital Fondeado</th>
                  <th className="py-3 px-4 text-right">% Fondeo</th>
                  <th className="py-3 px-4 text-right">Drawdown en Riesgo</th>
                  <th className="py-3 px-4 text-right">Gastos Examen</th>
                  <th className="py-3 px-4 text-right">Retiros Cobrados</th>
                  <th className="py-3 px-5 text-right">ROI Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {radar.firmAllocations.map((alloc) => {
                  return (
                    <tr
                      key={alloc.firmId}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <PropFirmLogo
                            name={alloc.firmName}
                            logoUrl={alloc.firmLogo}
                            className="h-9 w-9 rounded-xl shadow-xs"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-sm">
                              {alloc.firmName}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Capital Total: {formatCurrency(alloc.totalCapital)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {alloc.totalAccountsCount} {alloc.totalAccountsCount === 1 ? "cuenta" : "cuentas"}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {alloc.fundedAccountsCount} fondeadas / {alloc.evalAccountsCount} eval
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(alloc.fundedCapital)}
                      </td>

                      <td className="py-4 px-4 text-right font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {alloc.percentageOfFundedCapital.toFixed(1)}%
                      </td>

                      <td className="py-4 px-4 text-right font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                        {formatCurrency(alloc.totalDrawdownAtRisk)}
                      </td>

                      <td className="py-4 px-4 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatCurrency(alloc.totalExpenses)}
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCurrency(alloc.netPayoutsExtracted)}
                      </td>

                      <td className="py-4 px-5 text-right tabular-nums">
                        <Badge
                          className={`font-semibold ${
                            alloc.netROI > 0
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                              : alloc.netROI < 0
                              ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-200 dark:border-rose-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {alloc.netROI > 0 ? "+" : ""}
                          {alloc.netROI.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PortfolioPageContent />
    </Suspense>
  );
}
