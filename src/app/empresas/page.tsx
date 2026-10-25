"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PropFirm, Account, Expense, Withdrawal } from "@/types/database";
import {
  getFirms,
  getAccounts,
  getExpenses,
  getWithdrawals,
  addFirm,
  updateFirm,
  deleteFirm,
  addAccount,
} from "@/lib/actions/actions";
import { AddFirmModal } from "@/components/modals/add-firm-modal";
import { EditFirmModal } from "@/components/modals/edit-firm-modal";
import { AddAccountModal } from "@/components/modals/add-account-modal";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  Plus,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  Globe,
  Wallet,
  ExternalLink,
  Award,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Percent,
} from "lucide-react";
import { getPropFirmLogo } from "@/lib/constants/prop-firms";
import { PropFirmLogo } from "@/components/ui/prop-firm-logo";
import { formatCurrency, formatPercent } from "@/lib/formatters";

interface FirmFinancialMetric {
  firm: PropFirm;
  logoUrl: string | null;
  accountsCount: number;
  totalExpenses: number;
  netWithdrawals: number;
  netProfit: number;
  roi: number;
}

export default function EmpresasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddFirmOpen, setIsAddFirmOpen] = useState(false);
  const [editingFirm, setEditingFirm] = useState<PropFirm | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Quick Create Account Modal
  const [quickCreateAccountFirm, setQuickCreateAccountFirm] = useState<PropFirm | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedFirms, fetchedAccounts, fetchedExpenses, fetchedWithdrawals] =
        await Promise.all([
          getFirms(),
          getAccounts(),
          getExpenses(),
          getWithdrawals(),
        ]);
      setFirms(fetchedFirms);
      setAccounts(fetchedAccounts);
      setExpenses(fetchedExpenses);
      setWithdrawals(fetchedWithdrawals);
    } catch (err) {
      console.error("Error loading empresas page:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Firm handlers
  const handleAddFirm = async (firmData: {
    name: string;
    website: string | null;
    logo_url?: string | null;
  }) => {
    try {
      const created = await addFirm(firmData);
      setFirms((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding firm:", err);
    }
  };

  const handleUpdateFirm = async (
    id: string,
    firmData: { name: string; website: string | null; logo_url?: string | null }
  ) => {
    try {
      const updated = await updateFirm(id, firmData);
      setFirms((prev) => prev.map((f) => (f.id === id ? updated : f)));
    } catch (err) {
      console.error("Error updating firm:", err);
    }
  };

  const handleDeleteFirm = async (id: string) => {
    try {
      await deleteFirm(id);
      setFirms((prev) => prev.filter((f) => f.id !== id));
      setAccounts((prev) => prev.filter((a) => a.firm_id !== id));
    } catch (err) {
      console.error("Error deleting firm:", err);
    }
  };

  // Quick Account handler
  const handleAddAccount = async (accData: {
    firm_id: string;
    account_size: number;
    account_type: string;
    status: string;
    account_number?: string | null;
    alias?: string | null;
  }) => {
    try {
      const created = await addAccount(accData);
      setAccounts((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding account:", err);
    }
  };

  // Financial Metrics by Firm (Ranking)
  const firmMetrics: FirmFinancialMetric[] = useMemo(() => {
    return firms.map((firm) => {
      const firmAccounts = accounts.filter((a) => a.firm_id === firm.id);
      const firmExpenses = expenses.filter((e) => e.firm_id === firm.id);
      const firmWithdrawals = withdrawals.filter((w) => w.firm_id === firm.id);

      const totalExpenses = firmExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const netWithdrawals = firmWithdrawals.reduce((sum, w) => {
        const net =
          typeof w.net_amount === "number"
            ? w.net_amount
            : (Number(w.gross_amount) || 0) - (Number(w.fee_amount) || 0);
        return sum + net;
      }, 0);

      const netProfit = netWithdrawals - totalExpenses;
      const roi =
        totalExpenses > 0
          ? ((netWithdrawals - totalExpenses) / totalExpenses) * 100
          : netWithdrawals > 0
          ? 100
          : 0;

      const logoUrl = getPropFirmLogo(firm.name, firm.logo_url);

      return {
        firm,
        logoUrl,
        accountsCount: firmAccounts.length,
        totalExpenses,
        netWithdrawals,
        netProfit,
        roi,
      };
    });
  }, [firms, accounts, expenses, withdrawals]);

  // Global Totals
  const globalSummary = useMemo(() => {
    const totalInvested = firmMetrics.reduce((s, m) => s + m.totalExpenses, 0);
    const totalPayouts = firmMetrics.reduce((s, m) => s + m.netWithdrawals, 0);
    const netProfit = totalPayouts - totalInvested;
    const globalRoi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

    // Best firm
    const sortedByProfit = [...firmMetrics].sort((a, b) => b.netProfit - a.netProfit);
    const topFirm = sortedByProfit.length > 0 && sortedByProfit[0].netProfit > 0 ? sortedByProfit[0] : null;

    return {
      totalInvested,
      totalPayouts,
      netProfit,
      globalRoi,
      topFirm,
    };
  }, [firmMetrics]);

  // Filtered firms
  const filteredFirmMetrics = useMemo(() => {
    if (!searchQuery.trim()) return firmMetrics;
    const q = searchQuery.toLowerCase();
    return firmMetrics.filter(
      (m) =>
        m.firm.name.toLowerCase().includes(q) ||
        (m.firm.website && m.firm.website.toLowerCase().includes(q))
    );
  }, [firmMetrics, searchQuery]);

  return (
    <>
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gestión de Capital & Ranking de Fondeo
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
                Empresas de Fondeo & Ranking
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Catálogo institucional de firmas registradas con cálculo de ROI, exámenes pagados y cobros netos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                className="h-9 text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs rounded-xl"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                Actualizar
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddFirmOpen(true)}
                className="gap-2 font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Nueva Empresa</span>
              </Button>
            </div>
          </div>

          {/* 3 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Invertido */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Inversión en Exámenes
              </span>
              <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white mt-2">
                {formatCurrency(globalSummary.totalInvested)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Coste acumulado en pruebas</p>
            </div>

            {/* Total Cobrado */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Retiros Netos (Payouts)
              </span>
              <div className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-2">
                +{formatCurrency(globalSummary.totalPayouts)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Capital cobrado en cuenta</p>
            </div>

            {/* Global ROI */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                ROI Global de Fondeo
              </span>
              <div
                className={`text-2xl font-bold tabular-nums mt-2 ${
                  globalSummary.globalRoi >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {globalSummary.globalRoi >= 0 ? "+" : ""}
                {globalSummary.globalRoi.toFixed(1)}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Retorno sobre inversión</p>
            </div>

            {/* Top Performer Firm */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Firma Más Rentable
                </span>
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              {globalSummary.topFirm ? (
                <div className="mt-2">
                  <div className="text-lg font-bold truncate text-slate-900 dark:text-white">
                    {globalSummary.topFirm.firm.name}
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 tabular-nums">
                    +{formatCurrency(globalSummary.topFirm.netProfit)} de beneficio neto
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-400 mt-3 font-medium">Aún sin cobros netos</div>
              )}
            </div>
          </div>

          {/* Search Bar & Quick Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre o sitio web de la empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              <span>{firms.length} empresas registradas</span>
              <span>•</span>
              <span>{accounts.length} cuentas vinculadas</span>
            </div>
          </div>

          {/* Content */}
          {filteredFirmMetrics.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Building2 className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {searchQuery ? "No se encontraron firmas coincidentes" : "No hay empresas de fondeo registradas"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {searchQuery
                    ? `No se encontraron resultados para "${searchQuery}". Intenta con otro término de búsqueda.`
                    : "Crea tu primera empresa de fondeo para asociar tus cuentas de trading y llevar el control de tus finanzas."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFirmMetrics.map((item) => {
                const { firm, logoUrl, accountsCount, totalExpenses, netWithdrawals, netProfit, roi } = item;
                const isProfitable = netProfit > 0;

                return (
                  <Card
                    key={firm.id}
                    className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header with Official Logo */}
                      <CardHeader className="pb-3 pt-5 px-5 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <PropFirmLogo
                            name={firm.name}
                            logoUrl={firm.logo_url}
                            website={firm.website}
                            size="lg"
                          />
                          <div className="min-w-0">
                            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {firm.name}
                            </CardTitle>
                            {firm.website && (
                              <a
                                href={firm.website.startsWith("http") ? firm.website : `https://${firm.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors truncate"
                              >
                                <Globe className="h-3 w-3" />
                                {firm.website.replace(/^https?:\/\//, "")}
                                <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" />}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                          >
                            <DropdownMenuItem
                              onClick={() => setEditingFirm(firm)}
                              className="gap-2 text-xs cursor-pointer font-medium"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeletingId(firm.id)}
                              className="gap-2 text-xs text-rose-600 cursor-pointer font-medium"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>

                      {/* Financial Metrics Breakdown */}
                      <CardContent className="px-5 pb-4 pt-1 space-y-3">
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Gastado</span>
                            <div className="font-bold tabular-nums text-slate-700 dark:text-slate-300">
                              {formatCurrency(totalExpenses)}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">Cobrado</span>
                            <div className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                              +{formatCurrency(netWithdrawals)}
                            </div>
                          </div>
                        </div>

                        {/* Net Profit & ROI Pill */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-slate-500 font-medium">Beneficio Neto:</span>
                          <span
                            className={`font-bold tabular-nums ${
                              isProfitable
                                ? "text-emerald-600 dark:text-emerald-400"
                                : netProfit < 0
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {netProfit > 0 ? "+" : ""}
                            {formatCurrency(netProfit)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">ROI de la Firma:</span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isProfitable
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {roi >= 0 ? "+" : ""}
                            {roi.toFixed(1)}%
                          </span>
                        </div>
                      </CardContent>
                    </div>

                    {/* Card Footer: Linked Accounts & Quick Add Button */}
                    <div className="px-5 py-3.5 bg-slate-50/60 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                        <Wallet className="h-3.5 w-3.5 text-slate-400" />
                        <span>{accountsCount} {accountsCount === 1 ? "cuenta" : "cuentas"}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setQuickCreateAccountFirm(firm)}
                        className="gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Vincular Cuenta</span>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddFirmModal
        open={isAddFirmOpen}
        onOpenChange={setIsAddFirmOpen}
        onSubmit={handleAddFirm}
      />

      {editingFirm && (
        <EditFirmModal
          open={!!editingFirm}
          onOpenChange={(open) => !open && setEditingFirm(null)}
          firm={editingFirm}
          onSubmit={async (id, data) => {
            await handleUpdateFirm(id, data);
            setEditingFirm(null);
          }}
        />
      )}

      {quickCreateAccountFirm && (
        <AddAccountModal
          open={!!quickCreateAccountFirm}
          onOpenChange={(open) => !open && setQuickCreateAccountFirm(null)}
          firms={firms}
          onSubmit={async (data) => {
            await handleAddAccount(data);
            setQuickCreateAccountFirm(null);
          }}
        />
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">
              ¿Eliminar empresa de fondeo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
              Esta acción no se puede deshacer. Se desvincularán las cuentas, gastos y retiros asociados a esta firma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs font-semibold rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDeleteFirm(deletingId);
                  setDeletingId(null);
                }
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
