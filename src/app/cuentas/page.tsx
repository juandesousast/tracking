"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../dashboard-layout";
import { PropFirm, Account } from "@/types/database";
import { formatCurrency } from "@/lib/formatters";
import {
  getFirms,
  getAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
} from "@/lib/actions/actions";

import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { AddAccountModal } from "@/components/modals/add-account-modal";
import { PageSkeleton } from "@/components/ui/page-skeleton";


import { EditAccountModal } from "@/components/modals/edit-account-modal";
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
  Wallet,
  Plus,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  PauseCircle,
} from "lucide-react";

export default function CuentasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [firmFilter, setFirmFilter] = useState<string>("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedFirms, fetchedAccounts] = await Promise.all([
        getFirms(),
        getAccounts(),
      ]);
      setFirms(fetchedFirms);
      setAccounts(fetchedAccounts);
    } catch (err) {
      console.error("Error loading accounts page:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
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

  const handleUpdateAccount = async (
    id: string,
    accData: {
      firm_id: string;
      account_size: number;
      account_type: string;
      status: string;
      account_number?: string | null;
      alias?: string | null;
    }
  ) => {
    try {
      const updated = await updateAccount(id, accData);
      setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error("Error updating account:", err);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting account:", err);
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesStatus =
        statusFilter === "all" ||
        acc.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesFirm = firmFilter === "all" || acc.firm_id === firmFilter;
      return matchesStatus && matchesFirm;
    });
  }, [accounts, statusFilter, firmFilter]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "active":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Active
          </Badge>
        );
      case "passed":
        return (
          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800 gap-1 text-[11px]">
            <Clock className="h-3 w-3 text-blue-600" />
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800 gap-1 text-[11px]">
            <XCircle className="h-3 w-3 text-rose-600" />
            Failed
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1 text-[11px]">
            <PauseCircle className="h-3 w-3 text-amber-600" />
            Paused
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Cuentas de Trading
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gestión independiente de challenges, eval y cuentas fondeadas.
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
              className="gap-1.5 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Nueva Cuenta
            </Button>
          </div>
        </div>

        {/* Dashboard Filters Bar */}
        <DashboardFilters firms={firms} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Filtrar por:
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-status" className="text-xs text-slate-500">Estado:</label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-2.5 text-xs focus:outline-none"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Active</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-firm" className="text-xs text-slate-500">Empresa:</label>
            <select
              id="filter-firm"
              value={firmFilter}
              onChange={(e) => setFirmFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-2.5 text-xs focus:outline-none"
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

        {/* Content */}
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <Wallet className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No hay cuentas registradas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Crea tu primera cuenta de trading para comenzar el seguimiento.
            </p>
            <Button size="sm" onClick={() => setIsAddOpen(true)} className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Agregar Cuenta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((acc) => {
              const firm = firms.find((f) => f.id === acc.firm_id);
              return (
                <Card
                  key={acc.id}
                  className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs rounded-2xl overflow-hidden"
                >
                  <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {firm?.name || "Sin Empresa"}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(acc.status)}
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400" />}>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <DropdownMenuItem onClick={() => setEditingAccount(acc)} className="gap-2 text-xs cursor-pointer">
                            <Pencil className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeletingId(acc.id)} className="gap-2 text-xs text-rose-600 cursor-pointer">
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 pt-2">
                    <div className="mt-1">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                        {formatCurrency(acc.account_size, "USD")}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span>Tipo: <strong className="text-slate-700 dark:text-slate-300">{acc.account_type}</strong></span>
                      {acc.account_number && (
                        <span>Nº: <strong className="text-slate-700 dark:text-slate-300">#{acc.account_number}</strong></span>
                      )}
                    </div>

                    {acc.alias && (
                      <p className="text-[11px] text-slate-400 italic mt-2 truncate">
                        "{acc.alias}"
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Modals */}
      <AddAccountModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        firms={firms}
        onSubmit={handleAddAccount}
      />

      <EditAccountModal
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
        account={editingAccount}
        firms={firms}
        onSubmit={handleUpdateAccount}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Cuenta de Trading?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Esta acción es irreversible y eliminará esta cuenta de trading de tus registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDeleteAccount(deletingId);
                  setDeletingId(null);
                }
              }}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Eliminar Cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
