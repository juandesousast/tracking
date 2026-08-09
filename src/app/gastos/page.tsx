"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../dashboard-layout";
import { PropFirm, Account, Expense } from "@/types/database";
import { formatCurrency } from "@/lib/formatters";
import { calculateTotalExpenses } from "@/lib/financials";
import {
  getFirms,
  getAccounts,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "@/lib/actions/actions";

import { AddExpenseModal } from "@/components/modals/add-expense-modal";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { EditExpenseModal } from "@/components/modals/edit-expense-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Receipt,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";

export default function GastosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [firmFilter, setFirmFilter] = useState("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedFirms, fetchedAccounts, fetchedExpenses] = await Promise.all([
        getFirms(),
        getAccounts(),
        getExpenses(),
      ]);
      setFirms(fetchedFirms);
      setAccounts(fetchedAccounts);
      setExpenses(fetchedExpenses);
    } catch (err) {
      console.error("Error loading expenses page:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleAddExpense = async (expenseData: {
    firm_id: string | null;
    account_id: string | null;
    amount: number;
    category: string;
    description: string | null;
    date: string;
  }) => {
    if (!expenseData.firm_id) return;
    try {
      const created = await addExpense({
        firm_id: expenseData.firm_id,
        account_id: expenseData.account_id,
        amount: expenseData.amount,
        category: expenseData.category,
        description: expenseData.description,
        date: expenseData.date,
      });
      setExpenses((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleUpdateExpense = async (
    id: string,
    expenseData: {
      firm_id: string;
      account_id: string | null;
      amount: number;
      category: string;
      description: string | null;
      date: string;
    }
  ) => {
    try {
      const updated = await updateExpense(id, expenseData);
      setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } catch (err) {
      console.error("Error updating expense:", err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesCategory =
        categoryFilter === "all" || exp.category === categoryFilter;
      const matchesFirm = firmFilter === "all" || exp.firm_id === firmFilter;

      const firm = firms.find((f) => f.id === exp.firm_id);
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        exp.category.toLowerCase().includes(searchLower) ||
        (exp.description && exp.description.toLowerCase().includes(searchLower)) ||
        (firm && firm.name.toLowerCase().includes(searchLower));

      return matchesCategory && matchesFirm && matchesSearch;
    });
  }, [expenses, categoryFilter, firmFilter, searchQuery, firms]);

  const totalFiltered = useMemo(() => {
    return calculateTotalExpenses(filteredExpenses);
  }, [filteredExpenses]);

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
              <Receipt className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              Gastos y Evaluaciones
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registro detallado y filtrable de pagos de pruebas, resets y comisiones.
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
              className="gap-1.5 font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Nuevo Gasto
            </Button>
          </div>
        </div>

        {/* Dashboard Filters Bar */}
        <DashboardFilters firms={firms} />

        {/* Stats banner */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
              Gastos Totales Filtrados
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {formatCurrency(totalFiltered)}
            </span>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
            {filteredExpenses.length} registro(s)
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por categoría, nota o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="filter-firm" className="text-xs text-slate-500">Empresa:</label>
            <select
              id="filter-firm"
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

          <div className="flex items-center gap-2">
            <label htmlFor="filter-cat" className="text-xs text-slate-500">Categoría:</label>
            <select
              id="filter-cat"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-2.5 text-xs focus:outline-none"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs overflow-hidden">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                No se encontraron gastos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Prueba ajustando los filtros o registra un nuevo gasto.
              </p>
              <Button size="sm" onClick={() => setIsAddOpen(true)} className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Registrar Gasto
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Fecha</TableHead>
                  <TableHead className="text-xs font-semibold">Empresa</TableHead>
                  <TableHead className="text-xs font-semibold">Cuenta</TableHead>
                  <TableHead className="text-xs font-semibold">Categoría</TableHead>
                  <TableHead className="text-xs font-semibold">Nota</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Monto</TableHead>
                  <TableHead className="text-xs font-semibold w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((exp) => {
                  const firm = firms.find((f) => f.id === exp.firm_id);
                  const account = accounts.find((a) => a.id === exp.account_id);
                  return (
                    <TableRow key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <TableCell className="text-xs font-medium tabular-nums">
                        {exp.date}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {firm?.name || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {account ? `${account.account_type} (${formatCurrency(account.account_size, "USD")})` : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                          {exp.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 truncate max-w-[180px]">
                        {exp.description || "—"}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-rose-600 dark:text-rose-400 text-right tabular-nums">
                        -{formatCurrency(exp.amount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <DropdownMenuItem onClick={() => setEditingExpense(exp)} className="gap-2 text-xs cursor-pointer">
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeletingId(exp.id)} className="gap-2 text-xs text-rose-600 cursor-pointer">
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
      <AddExpenseModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        firms={firms}
        accounts={accounts}
        onSubmit={handleAddExpense}
      />

      <EditExpenseModal
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        expense={editingExpense}
        firms={firms}
        accounts={accounts}
        onSubmit={handleUpdateExpense}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Gasto?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Esta acción es irreversible y eliminará este gasto de tus registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingId) {
                  handleDeleteExpense(deletingId);
                  setDeletingId(null);
                }
              }}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Eliminar Gasto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
