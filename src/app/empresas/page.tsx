"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../dashboard-layout";
import { PropFirm, Account } from "@/types/database";
import {
  getFirms,
  getAccounts,
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
} from "lucide-react";

export default function EmpresasPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
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
      const [fetchedFirms, fetchedAccounts] = await Promise.all([
        getFirms(),
        getAccounts(),
      ]);
      setFirms(fetchedFirms);
      setAccounts(fetchedAccounts);
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
  const handleAddFirm = async (firmData: { name: string; website: string | null }) => {
    try {
      const created = await addFirm(firmData);
      setFirms((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding firm:", err);
    }
  };

  const handleUpdateFirm = async (
    id: string,
    firmData: { name: string; website: string | null }
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

  // Filtered firms
  const filteredFirms = useMemo(() => {
    if (!searchQuery.trim()) return firms;
    const q = searchQuery.toLowerCase();
    return firms.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.website && f.website.toLowerCase().includes(q))
    );
  }, [firms, searchQuery]);

  // Account count per firm
  const accountCountByFirm = useMemo(() => {
    const map = new Map<string, number>();
    accounts.forEach((acc) => {
      if (acc.firm_id) {
        map.set(acc.firm_id, (map.get(acc.firm_id) || 0) + 1);
      }
    });
    return map;
  }, [accounts]);

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
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Empresas de Fondeo
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Catálogo de firmas de prop trading registradas para tus cuentas y evaluaciones.
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
              onClick={() => setIsAddFirmOpen(true)}
              className="gap-1.5 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Nueva Empresa
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
          <input
            type="text"
            placeholder="Buscar por nombre o sitio web..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs focus:outline-none"
          />
        </div>

        {/* Content */}
        {filteredFirms.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <Building2 className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No hay empresas de fondeo registradas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Crea tu primera empresa de fondeo para asociar cuentas de trading.
            </p>
            <Button size="sm" onClick={() => setIsAddFirmOpen(true)} className="text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Agregar Empresa
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFirms.map((firm) => {
              const accCount = accountCountByFirm.get(firm.id) || 0;
              return (
                <Card
                  key={firm.id}
                  className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  <CardHeader className="pb-2 pt-4 px-5 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3 truncate">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {firm.name}
                      </CardTitle>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 shrink-0" />}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <DropdownMenuItem onClick={() => setEditingFirm(firm)} className="gap-2 text-xs cursor-pointer">
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeletingId(firm.id)} className="gap-2 text-xs text-rose-600 cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="px-5 pb-5 pt-2 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {firm.website ? (
                        <a
                          href={firm.website.startsWith("http") ? firm.website : `https://${firm.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline truncate max-w-full"
                        >
                          <Globe className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{firm.website}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                        </a>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Sin sitio web registrado</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <Wallet className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {accCount} {accCount === 1 ? "cuenta asociada" : "cuentas asociadas"}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuickCreateAccountFirm(firm)}
                        className="h-7 text-[11px] px-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1 font-semibold"
                      >
                        <Plus className="h-3 w-3" />
                        Crear Cuenta
                      </Button>
                    </div>
                  </CardContent>
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

      <EditFirmModal
        open={!!editingFirm}
        onOpenChange={(open) => !open && setEditingFirm(null)}
        firm={editingFirm}
        onSubmit={handleUpdateFirm}
      />

      {quickCreateAccountFirm && (
        <AddAccountModal
          open={!!quickCreateAccountFirm}
          onOpenChange={(open) => !open && setQuickCreateAccountFirm(null)}
          firms={firms}
          onSubmit={async (accData) => {
            await handleAddAccount(accData);
            setQuickCreateAccountFirm(null);
          }}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Empresa de Fondeo?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Esta acción eliminará la empresa de fondeo. Asegúrate de desvincular o reasignar las cuentas asociadas previamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDeleteFirm(deletingId);
                  setDeletingId(null);
                }
              }}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Eliminar Empresa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
