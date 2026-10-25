"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { PropFirm, Account, Expense, Withdrawal } from "@/types/database";
import {
  getFirms,
  getAccounts,
  getExpenses,
  getWithdrawals,
  updateAccount,
  addAccount,
} from "@/lib/actions/actions";
import { formatCurrency } from "@/lib/formatters";
import {
  calculateAccountEvaluationProgress,
  AccountEvaluationProgress,
  getDefaultEvaluationSpecs,
} from "@/lib/services/progress-tracker";
import { PropFirmLogo } from "@/components/ui/prop-firm-logo";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Target,
  Trophy,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Flame,
  Search,
  Filter,
  Check,
  RefreshCw,
  Wallet,
  Plus,
} from "lucide-react";
import { AddAccountModal } from "@/components/modals/add-account-modal";

function ProgressTrackerContent() {
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "eval" | "ready" | "funded">("all");
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Simulated trade what-if amounts per account: { [accountId]: number }
  const [simulatedTrades, setSimulatedTrades] = useState<Record<string, number>>({});

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
      console.error("Error loading progress tracker data:", err);
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

  // Compute evaluation progress for all accounts
  const progressList: AccountEvaluationProgress[] = useMemo(() => {
    return accounts.map((acc) => {
      const firm = firmMap.get(acc.firm_id);
      const firmName = firm?.name || "Prop Firm";
      const simDelta = simulatedTrades[acc.id] || 0;

      // In case user added a simulated trade to see projection
      let simWithdrawals = withdrawals;
      if (simDelta !== 0) {
        simWithdrawals = [
          ...withdrawals,
          {
            id: `sim-${acc.id}`,
            user_id: acc.user_id,
            firm_id: acc.firm_id,
            account_id: acc.id,
            gross_amount: simDelta,
            fee_amount: 0,
            net_amount: simDelta,
            status: "simulated",
            date: new Date().toISOString().split("T")[0],
            created_at: new Date().toISOString(),
          },
        ];
      }

      return calculateAccountEvaluationProgress(acc, firmName, expenses, simWithdrawals);
    });
  }, [accounts, firmMap, expenses, withdrawals, simulatedTrades]);

  // Filter accounts
  const filteredProgress = useMemo(() => {
    return progressList.filter((item) => {
      // Search
      const matchesSearch =
        item.accountAlias.toLowerCase().includes(search.toLowerCase()) ||
        item.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
        item.firmName.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      // Status tab filter
      if (statusFilter === "eval") {
        return (
          item.status.toLowerCase().includes("eval") ||
          item.status.toLowerCase().includes("combine") ||
          item.status.toLowerCase().includes("step")
        );
      }
      if (statusFilter === "ready") {
        return item.isReadyToPass;
      }
      if (statusFilter === "funded") {
        return (
          item.status.toLowerCase().includes("funded") ||
          item.status.toLowerCase().includes("active") ||
          item.status.toLowerCase().includes("pa")
        );
      }
      return true;
    });
  }, [progressList, search, statusFilter]);

  // High level KPIs
  const kpis = useMemo(() => {
    const evalAccounts = progressList.filter(
      (p) =>
        p.status.toLowerCase().includes("eval") ||
        p.status.toLowerCase().includes("combine") ||
        p.status.toLowerCase().includes("step")
    );
    const readyToPass = progressList.filter((p) => p.isReadyToPass);
    const totalPotentialCapital = evalAccounts.reduce((sum, p) => sum + p.accountSize, 0);

    const avgProgress =
      evalAccounts.length > 0
        ? evalAccounts.reduce((sum, p) => sum + Math.min(100, Math.max(0, p.targetProgressPercent)), 0) /
          evalAccounts.length
        : 0;

    return {
      evalCount: evalAccounts.length,
      readyCount: readyToPass.length,
      totalPotentialCapital,
      avgProgress,
    };
  }, [progressList]);

  const handleMarkAsFunded = async (accProgress: AccountEvaluationProgress) => {
    setIsUpdating(accProgress.accountId);
    try {
      await updateAccount(accProgress.accountId, {
        firm_id: accProgress.firmId,
        account_size: accProgress.accountSize,
        account_type: "funded",
        status: "active",
        account_number: accProgress.accountNumber,
        alias: accProgress.accountAlias,
      });
      await loadData();
    } catch (err) {
      console.error("Error updating account status:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSetSimulatedTrade = (accId: string, amount: number) => {
    setSimulatedTrades((prev) => ({
      ...prev,
      [accId]: amount,
    }));
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Target className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tracker de Progreso a Pase de Evaluación
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervisa en tiempo real el cumplimiento del objetivo de ganancia, trailing drawdown, días mínimos y regla de consistencia de tus firmas de fondeo.
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
          <Button
            onClick={() => setIsAddAccountOpen(true)}
            size="sm"
            className="gap-2 font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Cuenta</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              En Evaluación
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            {kpis.evalCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cuentas activas en proceso de examen
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Listas para Pase
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <Trophy className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-2">
            {kpis.readyCount}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cumplen el 100% de los requisitos para fondeo
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Capital en Evaluación
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2 tabular-nums">
            {formatCurrency(kpis.totalPotentialCapital)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fondos potenciales a desbloquear
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Progreso Promedio
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2 tabular-nums">
            {kpis.avgProgress.toFixed(1)}%
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, kpis.avgProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
        <AnimatedTabs
          layoutId="progress-tracker-status"
          tabs={[
            { id: "all", label: "Todas", badge: progressList.length },
            { id: "eval", label: "En Evaluación", badge: kpis.evalCount },
            { id: "ready", label: "Listas para Pase 🏆", badge: kpis.readyCount },
            { id: "funded", label: "Fondeadas / PA" },
          ]}
          activeTab={statusFilter}
          onChange={(val) => setStatusFilter(val as any)}
        />

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por firma, cuenta o alias..."
            className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Account Progress Cards Grid */}
      {filteredProgress.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-3">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No se encontraron cuentas con el filtro actual
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Añade tus cuentas de evaluación para supervisar el avance de profit target, trailing drawdown y consistencia en tiempo real.
          </p>
          <Button
            onClick={() => setIsAddAccountOpen(true)}
            size="sm"
            className="gap-2 font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Cuenta de Evaluación</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProgress.map((item) => {
            const firm = firmMap.get(item.firmId);
            const isSimulated = (simulatedTrades[item.accountId] || 0) !== 0;

            return (
              <div
                key={item.accountId}
                className={`p-6 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between ${
                  item.isReadyToPass
                    ? "border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-500/20"
                    : item.drawdownStatus === "breached"
                    ? "border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20"
                    : "border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <div>
                  {/* Account Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <PropFirmLogo
                        name={item.firmName}
                        logoUrl={firm?.logo_url}
                        website={firm?.website}
                        className="h-11 w-11 rounded-xl shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            {item.accountAlias}
                          </h3>
                          {item.accountNumber && (
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                              #{item.accountNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.firmName} · Tamaño de Cuenta:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatCurrency(item.accountSize)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {item.isReadyToPass ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-1 shadow-xs">
                          <Trophy className="h-3 w-3" />
                          ¡Lista para Pase!
                        </Badge>
                      ) : item.drawdownStatus === "breached" ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          Drawdown Superado
                        </Badge>
                      ) : item.status.toLowerCase().includes("funded") ||
                        item.status.toLowerCase().includes("active") ? (
                        <Badge className="bg-blue-600 text-white">Fondeada / Activa</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20"
                        >
                          En Evaluación
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Target Progress Bar */}
                  <div className="space-y-2 mb-5 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-blue-600" />
                        Objetivo de Ganancia
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {item.targetProgressPercent.toFixed(1)}% ({formatCurrency(item.currentProfit)} / {formatCurrency(item.profitTarget)})
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.targetProgressPercent >= 100
                            ? "bg-emerald-500"
                            : item.targetProgressPercent > 60
                            ? "bg-blue-600"
                            : item.targetProgressPercent > 0
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, item.targetProgressPercent))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Saldo Actual: {formatCurrency(item.currentBalance)}</span>
                      <span>
                        {item.profitRemaining > 0
                          ? `Faltan ${formatCurrency(item.profitRemaining)}`
                          : "¡Objetivo alcanzado! 🎯"}
                      </span>
                    </div>
                  </div>

                  {/* Drawdown & Safety Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {/* Trailing Drawdown Buffer */}
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                        Colchón Trailing Drawdown
                      </span>
                      <p
                        className={`text-lg font-bold tabular-nums ${
                          item.drawdownStatus === "breached"
                            ? "text-rose-600"
                            : item.drawdownStatus === "danger"
                            ? "text-rose-500"
                            : item.drawdownStatus === "warning"
                            ? "text-amber-500"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatCurrency(item.drawdownBuffer)}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Liquidación a: {formatCurrency(item.liquidationThreshold)}
                      </span>
                    </div>

                    {/* Consistency Rule */}
                    <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                        Regla de Consistencia {item.consistencyLimitPercent ? `(Max ${item.consistencyLimitPercent}%)` : ""}
                      </span>
                      <p
                        className={`text-lg font-bold tabular-nums ${
                          item.consistencyPassed
                            ? "text-slate-900 dark:text-white"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {item.currentProfit > 0
                          ? `${item.bestDayPercentage.toFixed(1)}%`
                          : "0.0%"}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Mejor día: {formatCurrency(item.bestDayProfit)}
                      </span>
                    </div>
                  </div>

                  {/* Requirements Checklist */}
                  <div className="space-y-2 mb-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      Requisitos de Pase
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* Target Reached */}
                      <div
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium ${
                          item.currentProfit >= item.profitTarget
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-500"
                        }`}
                      >
                        {item.currentProfit >= item.profitTarget ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px]">
                            1
                          </div>
                        )}
                        <span>Target Ganancia</span>
                      </div>

                      {/* Min Trading Days */}
                      <div
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium ${
                          item.tradingDaysPassed
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-500"
                        }`}
                      >
                        {item.tradingDaysPassed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px]">
                            {item.tradingDaysCompleted}
                          </div>
                        )}
                        <span>
                          Días: {item.tradingDaysCompleted}/{item.minTradingDaysRequired}
                        </span>
                      </div>

                      {/* Consistency */}
                      <div
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium ${
                          item.consistencyPassed
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {item.consistencyPassed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                        )}
                        <span>Consistencia</span>
                      </div>
                    </div>
                  </div>

                  {/* What-If Simulator Bar */}
                  <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                        Simulador What-If (+/- PnL proyectado)
                      </span>
                      {isSimulated && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleSetSimulatedTrade(item.accountId, 0)}
                          className="h-5 px-1.5 text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700"
                        >
                          Restablecer
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Ej. +500 o -300"
                        value={simulatedTrades[item.accountId] || ""}
                        onChange={(e) =>
                          handleSetSimulatedTrade(
                            item.accountId,
                            e.target.value ? Number(e.target.value) : 0
                          )
                        }
                        className="h-8 text-xs rounded-lg bg-white dark:bg-slate-900"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {isSimulated ? "Simulado 🧪" : "Probar impacto"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.missingRequirements.length > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {item.missingRequirements[0]}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" />
                        Todos los requisitos aprobados
                      </span>
                    )}
                  </div>

                  {item.isReadyToPass && (
                    <Button
                      onClick={() => handleMarkAsFunded(item)}
                      disabled={isUpdating === item.accountId}
                      size="sm"
                      className="gap-1.5 shrink-0"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{isUpdating === item.accountId ? "Guardando..." : "Marcar Fondeada"}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        open={isAddAccountOpen}
        onOpenChange={setIsAddAccountOpen}
        firms={firms}
        onSubmit={async (accData) => {
          await addAccount(accData);
          await loadData();
        }}
      />
    </div>
  );
}

export default function ProgressTrackerPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProgressTrackerContent />
    </Suspense>
  );
}
