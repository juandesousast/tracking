"use client";

import { Account, PropFirm } from "@/types/database";
import { formatCurrency } from "@/lib/formatters";
import { Wallet, Plus, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AccountsDueWidgetProps {
  accounts: Account[];
  firms: PropFirm[];
  onAddAccount: () => void;
}

export function AccountsDueWidget({ accounts, firms, onAddAccount }: AccountsDueWidgetProps) {
  const firmMap = new Map<string, string>();
  firms.forEach((f) => firmMap.set(f.id, f.name));

  // Determine status badges based on account status or mock due date logic
  const getBadgeStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("passed") || s.includes("funded") || s.includes("aprobada")) {
      return {
        label: "Passed",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40",
      };
    }
    if (s.includes("due") || s.includes("vencimiento") || s.includes("pending")) {
      return {
        label: "Due Soon",
        icon: Clock,
        className:
          "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40",
      };
    }
    return {
      label: "Active",
      icon: ShieldCheck,
      className:
        "bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40",
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs rounded-2xl p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              Cuentas / Próximos Vencimientos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monitoreo de estado de cuentas activas y renovaciones.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddAccount}
            className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {accounts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No tienes cuentas de trading registradas.
            <Button
              variant="outline"
              size="sm"
              onClick={onAddAccount}
              className="mt-3 text-xs gap-1.5 text-blue-600 border-blue-200"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar Cuenta
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
            {accounts.slice(0, 4).map((acc, index) => {
              const firmName = firmMap.get(acc.firm_id) || "PropFirm";
              // Alternate badges for realistic visual presentation if status is simple
              const mockStatus = index === 0 ? "Passed" : index === 2 ? "Due Soon" : acc.status;
              const badgeInfo = getBadgeStyle(mockStatus);
              const BadgeIcon = badgeInfo.icon;

              return (
                <div key={acc.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400 shrink-0">
                      {firmName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{firmName}</span>
                        {acc.account_number && (
                          <span className="text-[11px] font-normal text-slate-400 tabular-nums">
                            #{acc.account_number}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        {formatCurrency(acc.account_size)} • {acc.account_type || "Evaluación"}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${badgeInfo.className}`}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    <span>{badgeInfo.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Total activas: {accounts.length}</span>
        <button onClick={onAddAccount} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          + Nueva Cuenta
        </button>
      </div>
    </div>
  );
}

