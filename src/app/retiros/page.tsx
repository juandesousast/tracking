"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PropFirm, Account, Withdrawal } from "@/types/database";
import { formatCurrency } from "@/lib/formatters";
import {
  calculateGrossWithdrawals,
  calculateTotalFees,
  calculateNetWithdrawals,
} from "@/lib/financials";
import {
  getFirms,
  getAccounts,
  getWithdrawals,
  addWithdrawal,
  updateWithdrawal,
  deleteWithdrawal,
} from "@/lib/actions/actions";

import { AddWithdrawalModal } from "@/components/modals/add-withdrawal-modal";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { EditWithdrawalModal } from "@/components/modals/edit-withdrawal-modal";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  ArrowDownToLine,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function RetirosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [firmFilter, setFirmFilter] = useState("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedFirms, fetchedAccounts, fetchedWithdrawals] = await Promise.all([
        getFirms(),
        getAccounts(),
        getWithdrawals(),
      ]);
      setFirms(fetchedFirms);
      setAccounts(fetchedAccounts);
      setWithdrawals(fetchedWithdrawals);
    } catch (err) {
      console.error("Error loading withdrawals page:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleAddWithdrawal = async (wData: {
    firm_id: string | null;
    account_id: string | null;
    gross_amount: number;
    fee_amount: number;
    status: string;
    date: string;
  }) => {
    try {
      const created = await addWithdrawal({
        firm_id: wData.firm_id,
        account_id: wData.account_id,
        gross_amount: wData.gross_amount,
        fee_amount: wData.fee_amount,
        status: wData.status,
        date: wData.date,
      });
      setWithdrawals((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding withdrawal:", err);
    }
  };

  const handleUpdateWithdrawal = async (
    id: string,
    wData: {
      firm_id: string;
      account_id: string | null;
      gross_amount: number;
      fee_amount: number;
      status: string;
      date: string;
    }
  ) => {
    try {
      const updated = await updateWithdrawal(id, wData);
      setWithdrawals((prev) => prev.map((w) => (w.id === id ? updated : w)));
    } catch (err) {
      console.error("Error updating withdrawal:", err);
    }
  };

  const handleDeleteWithdrawal = async (id: string) => {
    try {
      await deleteWithdrawal(id);
      setWithdrawals((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Error deleting withdrawal:", err);
    }
  };

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchesStatus =
        statusFilter === "all" ||
        w.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesFirm = firmFilter === "all" || w.firm_id === firmFilter;
      return matchesStatus && matchesFirm;
    });
  }, [withdrawals, statusFilter, firmFilter]);

  const grossTotal = useMemo(() => calculateGrossWithdrawals(filteredWithdrawals), [filteredWithdrawals]);
  const feesTotal = useMemo(() => calculateTotalFees(filteredWithdrawals), [filteredWithdrawals]);
  const netTotal = useMemo(() => calculateNetWithdrawals(filteredWithdrawals), [filteredWithdrawals]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "completed":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Completado
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1 text-[11px]">
            <Clock className="h-3 w-3 text-amber-600" />
            Pendiente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 text-[11px]">
            <AlertCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <>
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowDownToLine className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              Retiros de Ganancias
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Control independiente de pagos cobrados, comisiones y montos netos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              className="text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Nuevo Retiro
            </Button>
          </div>
        </div>

        {/* Dashboard Filters Bar */}
        <DashboardFilters firms={firms} />

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Monto Bruto Solicitado
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight mt-1 block">
              {formatCurrency(grossTotal)}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Comisiones y Fees Totales
            </span>
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums tracking-tight mt-1 block">
              -{formatCurrency(feesTotal)}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Monto Neto Cobrado
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight mt-1 block">
              {formatCurrency(netTotal)}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Filtrar por:
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-status-withdrawal" className="text-xs text-slate-500">Estado:</label>
            <select
              id="filter-status-withdrawal"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-2.5 text-xs focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-firm-withdrawal" className="text-xs text-slate-500">Empresa:</label>
            <select
              id="filter-firm-withdrawal"
              value={firmFilter}
              onChange={(e) => setFirmFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-2.5 text-xs focus:outline-none"
            >
              <option value="all">Todas las empresas</option>
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs overflow-hidden">
          {filteredWithdrawals.length === 0 ? (
            <div className="p-12 text-center">
              <ArrowDownToLine className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                No hay retiros registrados
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Registra tu primer retiro de ganancias para medir tu ROI real.
              </p>
              <Button size="sm" onClick={() => setIsAddOpen(true)} className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Registrar Retiro
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold">Empresa</TableHead>
                  <TableHead className="text-xs font-semibold">Cuenta</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Monto Bruto</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Fee</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Monto Neto</TableHead>
                  <TableHead className="text-xs font-semibold">Estado</TableHead>
                  <TableHead className="text-xs font-semibold w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((w) => {
                  const firm = firms.find((f) => f.id === w.firm_id);
                  const account = accounts.find((a) => a.id === w.account_id);
                  const net = (w.gross_amount || 0) - (w.fee_amount || 0);

                  return (
                    <TableRow key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <TableCell className="text-xs font-medium tabular-nums">
                        {w.date}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {firm?.name || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {account ? `${account.account_type} (${formatCurrency(account.account_size, "USD")})` : "—"}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300 text-right tabular-nums">
                        {formatCurrency(w.gross_amount)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-rose-600 dark:text-rose-400 text-right tabular-nums">
                        {w.fee_amount > 0 ? `-${formatCurrency(w.fee_amount)}` : "€0,00"}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400 text-right tabular-nums">
                        +{formatCurrency(net)}
                      </TableCell>
                      <TableCell>{getStatusBadge(w.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <DropdownMenuItem onClick={() => setEditingWithdrawal(w)} className="gap-2 text-xs cursor-pointer">
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingId(w.id)} className="gap-2 text-xs text-rose-600 cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      )}

      {/* Modals */}
      <AddWithdrawalModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        firms={firms}
        accounts={accounts}
        onSubmit={handleAddWithdrawal}
      />

      <EditWithdrawalModal
        open={!!editingWithdrawal}
        onOpenChange={(open) => !open && setEditingWithdrawal(null)}
        withdrawal={editingWithdrawal}
        firms={firms}
        accounts={accounts}
        onSubmit={handleUpdateWithdrawal}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Retiro?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Esta acción es irreversible y eliminará este registro de retiro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDeleteWithdrawal(deletingId);
                  setDeletingId(null);
                }
              }}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Eliminar Retiro
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
