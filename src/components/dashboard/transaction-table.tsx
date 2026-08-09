"use client";

import { useState, useMemo } from "react";
import { Expense, Withdrawal, PropFirm, Account } from "@/types/database";
import { formatCurrency } from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDownToLine,
  Receipt,
  Search,
  Calendar,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

export interface TransactionTableProps {
  expenses: Expense[];
  withdrawals: Withdrawal[];
  firms: PropFirm[];
  accounts: Account[];
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;
  onEditWithdrawal?: (withdrawal: Withdrawal) => void;
  onDeleteWithdrawal?: (id: string) => void;
}

export type TransactionType = "all" | "expense" | "withdrawal";

export function TransactionTable({
  expenses,
  withdrawals,
  firms,
  accounts,
  onEditExpense,
  onDeleteExpense,
  onEditWithdrawal,
  onDeleteWithdrawal,
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType>("all");
  const [firmFilter, setFirmFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "expense" | "withdrawal" } | null>(null);

  const firmMap = useMemo(() => {
    const map = new Map<string, string>();
    firms.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [firms]);

  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((a) => {
      const firmName = firmMap.get(a.firm_id) || "";
      const details = [
        a.account_number ? `#${a.account_number}` : null,
        a.alias ? a.alias : null,
      ]
        .filter(Boolean)
        .join(" - ");
      const extra = details ? ` (${details})` : "";
      map.set(a.id, `${formatCurrency(a.account_size)} ${firmName ? `(${firmName})` : ""}${extra}`);
    });
    return map;
  }, [accounts, firmMap]);

  // Combine expenses and withdrawals into a unified transaction list
  const unifiedTransactions = useMemo(() => {
    const list: Array<{
      id: string;
      raw: Expense | Withdrawal;
      type: "expense" | "withdrawal";
      firmId: string | null;
      firmName: string;
      accountInfo: string;
      date: string;
      categoryOrStatus: string;
      grossAmount?: number;
      feeAmount?: number;
      amount: number;
      description?: string | null;
    }> = [];

    expenses.forEach((e) => {
      list.push({
        id: e.id,
        raw: e,
        type: "expense",
        firmId: e.firm_id,
        firmName: e.firm_id ? firmMap.get(e.firm_id) || "Firma" : "General",
        accountInfo: e.account_id ? accountMap.get(e.account_id) || "Cuenta" : "Global",
        date: e.date,
        categoryOrStatus: e.category,
        amount: e.amount,
        description: e.description,
      });
    });

    withdrawals.forEach((w) => {
      const net = (w.gross_amount || 0) - (w.fee_amount || 0);
      list.push({
        id: w.id,
        raw: w,
        type: "withdrawal",
        firmId: w.firm_id,
        firmName: w.firm_id ? firmMap.get(w.firm_id) || "Firma" : "General",
        accountInfo: w.account_id ? accountMap.get(w.account_id) || "Cuenta" : "Global",
        date: w.date,
        categoryOrStatus: w.status,
        grossAmount: w.gross_amount,
        feeAmount: w.fee_amount,
        amount: net,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, withdrawals, firmMap, accountMap]);

  // Search & Filters
  const filteredTransactions = useMemo(() => {
    return unifiedTransactions.filter((tx) => {
      if (typeFilter !== "all" && tx.type !== typeFilter) {
        return false;
      }
      if (firmFilter !== "all" && tx.firmId !== firmFilter) {
        return false;
      }
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchesFirm = tx.firmName.toLowerCase().includes(query);
        const matchesAccount = tx.accountInfo.toLowerCase().includes(query);
        const matchesCategory = tx.categoryOrStatus.toLowerCase().includes(query);
        const matchesDescription = tx.description?.toLowerCase().includes(query) || false;
        if (!matchesFirm && !matchesAccount && !matchesCategory && !matchesDescription) {
          return false;
        }
      }
      return true;
    });
  }, [unifiedTransactions, typeFilter, firmFilter, searchTerm]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "expense") {
      onDeleteExpense?.(deleteTarget.id);
    } else {
      onDeleteWithdrawal?.(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-xs rounded-2xl overflow-hidden">
        {/* Card Header with Search & Filters */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Registro unificado con buscador y filtros de gastos y retiros.
            </p>
          </div>

          {/* Search Input & Segmented Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Type Segmented Buttons */}
            <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-0.5 text-xs">
              <button
                onClick={() => setTypeFilter("all")}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-semibold ${
                  typeFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter("withdrawal")}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-semibold ${
                  typeFilter === "withdrawal"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Retiros
              </button>
              <button
                onClick={() => setTypeFilter("expense")}
                className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-semibold ${
                  typeFilter === "expense"
                    ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Gastos
              </button>
            </div>

            {/* Firm Select Filter */}
            <select
              value={firmFilter}
              onChange={(e) => setFirmFilter(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-2.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 focus-visible:outline-none"
            >
              <option value="all">Todas las firmas</option>
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-0 overflow-x-auto">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <Search className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Sin transacciones que coincidan con la búsqueda
              </p>
              <p className="text-[11px]">Intenta cambiando el texto o los filtros.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40">
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-4">Tipo</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fecha</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Empresa / Cuenta</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categoría / Estado</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Monto Neto</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center pr-4 w-12">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => {
                  const isWithdrawal = tx.type === "withdrawal";
                  return (
                    <TableRow key={tx.id} className="border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <TableCell className="pl-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-7 w-7 rounded-lg flex items-center justify-center border ${
                              isWithdrawal
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
                                : "bg-rose-50 text-rose-600 border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40"
                            }`}
                          >
                            {isWithdrawal ? (
                              <ArrowDownToLine className="h-3.5 w-3.5" />
                            ) : (
                              <Receipt className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {isWithdrawal ? "Retiro" : "Gasto"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {tx.date}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <div>
                          <div className="font-semibold text-xs text-slate-900 dark:text-white">{tx.firmName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">{tx.accountInfo}</div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        {isWithdrawal ? (
                          <div
                            className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border tabular-nums ${
                              tx.categoryOrStatus === "Completed" || tx.categoryOrStatus === "Passed"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
                                : tx.categoryOrStatus === "Active"
                                ? "bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800/40"
                                : "bg-amber-50 text-amber-600 border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40"
                            }`}
                          >
                            {tx.categoryOrStatus}
                          </div>
                        ) : (
                          <div className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {tx.categoryOrStatus}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-extrabold tracking-tight text-xs py-3 tabular-nums">
                        <span className={isWithdrawal ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                          {isWithdrawal ? "+" : "-"}{formatCurrency(tx.amount)}
                        </span>
                        {isWithdrawal && tx.feeAmount !== undefined && tx.feeAmount > 0 && (
                          <div className="text-[10px] text-slate-400 font-normal tabular-nums">
                            Fee: {formatCurrency(tx.feeAmount)}
                          </div>
                        )}
                        {!isWithdrawal && tx.description && (
                          <div className="text-[10px] text-slate-400 font-normal truncate max-w-[140px] ml-auto">
                            {tx.description}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center pr-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <DropdownMenuItem
                              onClick={() => {
                                if (isWithdrawal) {
                                  onEditWithdrawal?.(tx.raw as Withdrawal);
                                } else {
                                  onEditExpense?.(tx.raw as Expense);
                                }
                              }}
                              className="gap-2 text-xs cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget({ id: tx.id, type: tx.type })}
                              className="gap-2 text-xs text-rose-600 dark:text-rose-400 cursor-pointer"
                            >
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

      {/* Delete confirmation alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Esta acción no se puede deshacer. Se eliminará permanentemente la transacción seleccionada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="text-xs bg-rose-600 text-white hover:bg-rose-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
