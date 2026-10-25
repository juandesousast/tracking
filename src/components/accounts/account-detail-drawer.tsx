"use client";

import { useMemo } from "react";
import { Account, PropFirm, Expense, Withdrawal } from "@/types/database";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { PropFirmLogo } from "@/components/ui/prop-firm-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  Receipt,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Plus,
  Calendar,
  ExternalLink,
  Layers,
} from "lucide-react";

interface AccountDetailDrawerProps {
  account: Account | null;
  firm?: PropFirm;
  expenses: Expense[];
  withdrawals: Withdrawal[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (acc: Account) => void;
  onStatusChange: (accId: string, nextStatus: string) => Promise<void>;
  onAddWithdrawal: (acc: Account) => void;
}

export function AccountDetailDrawer({
  account,
  firm,
  expenses,
  withdrawals,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onAddWithdrawal,
}: AccountDetailDrawerProps) {
  if (!account) return null;

  // Filter financial transactions tied specifically to this account
  const accountExpenses = useMemo(
    () => expenses.filter((e) => e.account_id === account.id),
    [expenses, account.id]
  );

  const accountWithdrawals = useMemo(
    () => withdrawals.filter((w) => w.account_id === account.id),
    [withdrawals, account.id]
  );

  const totalSpent = useMemo(
    () => accountExpenses.reduce((sum, e) => sum + e.amount, 0),
    [accountExpenses]
  );

  const totalWithdrawn = useMemo(
    () =>
      accountWithdrawals
        .filter((w) => w.status === "completed")
        .reduce((sum, w) => sum + w.net_amount, 0),
    [accountWithdrawals]
  );

  const pendingWithdrawals = useMemo(
    () =>
      accountWithdrawals
        .filter((w) => w.status === "pending")
        .reduce((sum, w) => sum + w.net_amount, 0),
    [accountWithdrawals]
  );

  const netAccountProfit = totalWithdrawn - totalSpent;

  // Calculate consistency rule simulation (Standard 30% or 40% rule)
  const maxAllowedSingleDayPercent = 30;
  const bestWithdrawal = useMemo(() => {
    if (accountWithdrawals.length === 0) return 0;
    return Math.max(...accountWithdrawals.map((w) => w.net_amount));
  }, [accountWithdrawals]);

  const bestDayWeight = totalWithdrawn > 0 ? (bestWithdrawal / totalWithdrawn) * 100 : 0;
  const isConsistencyOk = bestDayWeight <= maxAllowedSingleDayPercent || totalWithdrawn === 0;

  // Status configuration styling
  const statusStyles: Record<string, { label: string; badgeClass: string }> = {
    Active: {
      label: "Activa (En Trading)",
      badgeClass:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    },
    Passed: {
      label: "Aprobada (Paso a Fondeo)",
      badgeClass:
        "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    },
    Failed: {
      label: "Regla Violada / Reset",
      badgeClass:
        "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    },
    Paused: {
      label: "Pausada",
      badgeClass:
        "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
  };

  const currentStatusInfo = statusStyles[account.status] || {
    label: account.status,
    badgeClass: "bg-slate-100 text-slate-700",
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col justify-between overflow-y-auto bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800 shadow-2xl"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <SheetHeader className="text-left space-y-2 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PropFirmLogo
                  name={firm?.name || "Prop Firm"}
                  logoUrl={firm?.logo_url}
                  size="md"
                />
                <div>
                  <SheetTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    {account.alias || `Cuenta $${account.account_size.toLocaleString()}`}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{firm?.name || "Empresa de Fondeo"}</span>
                    <span>•</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      ${account.account_size.toLocaleString()} USD
                    </span>
                  </SheetDescription>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="outline" className={`text-xs font-semibold ${currentStatusInfo.badgeClass}`}>
                {currentStatusInfo.label}
              </Badge>
              {account.account_type && (
                <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                  {account.account_type}
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onAddWithdrawal(account);
              }}
              className="w-full text-xs font-semibold gap-1.5"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              <span>Registrar Retiro</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(account);
              }}
              className="w-full text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Pencil className="h-3.5 w-3.5 text-slate-500" />
              <span>Editar Cuenta</span>
            </Button>
          </div>

          {/* Financial Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Cobros Cobrados</span>
              </div>
              <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(totalWithdrawn)}
              </p>
              {pendingWithdrawals > 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
                  +{formatCurrency(pendingWithdrawals)} pendientes
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Receipt className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                <span>Coste en Exámenes</span>
              </div>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-[10px] text-slate-400">
                {accountExpenses.length} pagos registrados
              </p>
            </div>
          </div>

          {/* Net Profit Summary Strip */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Retorno Neto de la Cuenta
              </span>
              <p
                className={`text-2xl font-extrabold tracking-tight tabular-nums mt-0.5 ${
                  netAccountProfit >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {netAccountProfit >= 0 ? `+${formatCurrency(netAccountProfit)}` : formatCurrency(netAccountProfit)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">ROI Cuenta</span>
              <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">
                {totalSpent > 0 ? `${((totalWithdrawn / totalSpent) * 100).toFixed(1)}%` : "N/A"}
              </span>
            </div>
          </div>

          {/* Consistency Rule Meter */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                <Scale className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Regla de Consistencia ({maxAllowedSingleDayPercent}%)</span>
              </div>
              <span
                className={`font-mono font-bold ${
                  isConsistencyOk ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {bestDayWeight.toFixed(1)}% mejor día
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isConsistencyOk ? "bg-emerald-500" : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(bestDayWeight, 100)}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {isConsistencyOk
                ? "La cuenta cumple con la regla de consistencia: ningún cobro supera el 30% del total generado."
                : "Atención: Tu mejor día representa más del 30% del profit total. Requiere más días con beneficio para solicitar retiro."}
            </p>
          </div>

          {/* Associated Transactions List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
              <span>Movimientos de esta Cuenta</span>
              <span className="text-[11px] font-normal text-slate-400">
                {accountWithdrawals.length + accountExpenses.length} registro(s)
              </span>
            </h4>

            {accountWithdrawals.length === 0 && accountExpenses.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                Aún no hay retiros ni gastos vinculados a esta cuenta.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {accountWithdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-2xs text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          Retiro Recibido
                        </p>
                        <p className="text-[10px] text-slate-400">{w.date}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(w.net_amount)}
                    </span>
                  </div>
                ))}

                {accountExpenses.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shadow-2xs text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600">
                        <Receipt className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {e.category}
                        </p>
                        <p className="text-[10px] text-slate-400">{e.date}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Quick Status Change */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">Cambiar estado rápido:</span>
          <div className="flex items-center gap-1.5">
            {["Active", "Passed", "Failed", "Paused"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={account.status === st ? "default" : "outline"}
                onClick={() => onStatusChange(account.id, st)}
                className={`text-[11px] h-7 px-2.5 rounded-lg font-semibold ${
                  account.status === st
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                }`}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
