"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import DashboardLayout from "./dashboard-layout";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { AccountsDueWidget } from "@/components/dashboard/accounts-due-widget";
import { NetProfitSparkline } from "@/components/dashboard/charts/net-profit-sparkline";
import { AddFirmModal } from "@/components/modals/add-firm-modal";
import { AddAccountModal } from "@/components/modals/add-account-modal";
import { AddExpenseModal } from "@/components/modals/add-expense-modal";
import { AddWithdrawalModal } from "@/components/modals/add-withdrawal-modal";
import { EditFirmModal } from "@/components/modals/edit-firm-modal";
import { EditAccountModal } from "@/components/modals/edit-account-modal";
import { EditExpenseModal } from "@/components/modals/edit-expense-modal";
import { EditWithdrawalModal } from "@/components/modals/edit-withdrawal-modal";
import { PerformanceLineChart } from "@/components/dashboard/charts/performance-line-chart";
import { FirmPerformanceChart } from "@/components/dashboard/charts/firm-performance-chart";

import { PropFirm, Account, Expense, Withdrawal } from "@/types/database";
import {
  calculateFinancialSummary,
  calculateFirmFinancialSummaries,
  filterTransactions,
  calculatePeriodComparison,
} from "@/lib/financials";
import { formatCurrency } from "@/lib/formatters";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import {
  getFirms,
  getAccounts,
  getExpenses,
  getWithdrawals,
  addFirm,
  addAccount,
  addExpense,
  addWithdrawal,
  updateFirm,
  deleteFirm,
  updateAccount,
  deleteAccount,
  updateExpense,
  deleteExpense,
  updateWithdrawal,
  deleteWithdrawal,
} from "@/lib/actions/actions";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  ArrowUpRight,
  Wallet,
  Receipt,
  Building2,
  ChevronDown,
  RefreshCw,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react";
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

function HomePageContent() {
  const [isLoading, setIsLoading] = useState(true);

  // App real data state
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Modal open states
  const [isAddFirmOpen, setIsAddFirmOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddWithdrawalOpen, setIsAddWithdrawalOpen] = useState(false);

  // Edit target states
  const [editingFirm, setEditingFirm] = useState<PropFirm | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);

  // Delete target states for firms & accounts
  const [deletingFirmId, setDeletingFirmId] = useState<string | null>(null);

  // Fetch initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedFirms, fetchedAccounts, fetchedExpenses, fetchedWithdrawals] = await Promise.all([
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
      console.error("Error loading dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // URL Filters reading
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();


  const preset = searchParams.get("preset") || "this_month";
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const firmIdParam = searchParams.get("firmId") || "all";

  // Calculate default dates for "this_month" if no explicit dates in URL
  const { startDate, endDate } = useMemo(() => {
    if (preset === "all") return { startDate: null, endDate: null };
    if (startDateParam || endDateParam) {
      return { startDate: startDateParam, endDate: endDateParam };
    }
    // default to this month
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { startDate: start, endDate: end };
  }, [preset, startDateParam, endDateParam]);

  // Filtered transactions based on active filters
  const filteredData = useMemo(() => {
    return filterTransactions(expenses, withdrawals, {
      startDate,
      endDate,
      firmId: firmIdParam,
    });
  }, [expenses, withdrawals, startDate, endDate, firmIdParam]);

  // Dynamic financial calculations & comparison
  const comparisonResult = useMemo(() => {
    return calculatePeriodComparison(
      expenses,
      withdrawals,
      startDate,
      endDate,
      firmIdParam
    );
  }, [expenses, withdrawals, startDate, endDate, firmIdParam]);

  const summary = comparisonResult.currentSummary;

  const firmSummaries = useMemo(() => {
    return calculateFirmFinancialSummaries(
      firms,
      accounts,
      filteredData.expenses,
      filteredData.withdrawals
    );
  }, [firms, accounts, filteredData.expenses, filteredData.withdrawals]);

  const resetFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasData = firms.length > 0 || accounts.length > 0 || expenses.length > 0 || withdrawals.length > 0;


  // Handlers for adding items using Server Actions
  const handleAddFirm = async (firmData: { name: string; website: string | null }) => {
    try {
      const created = await addFirm(firmData);
      setFirms((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Error adding firm:", err);
    }
  };

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

  const handleAddWithdrawal = async (wData: {
    firm_id: string | null;
    account_id: string | null;
    gross_amount: number;
    fee_amount: number;
    status: string;
    date: string;
  }) => {
    if (!wData.firm_id) return;
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

  // Update handlers
  const handleUpdateFirm = async (id: string, firmData: { name: string; website: string | null }) => {
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
      setExpenses((prev) => prev.filter((e) => e.firm_id !== id));
      setWithdrawals((prev) => prev.filter((w) => w.firm_id !== id));
    } catch (err) {
      console.error("Error deleting firm:", err);
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

  return (
    <DashboardLayout>
      {/* Header section with page title & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Dashboard EdgeFlow
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resumen global de capital, proyecciones de flujo de caja y gestión de empresas.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData()}
            className="text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>

          {/* Quick Add Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button size="sm" className="gap-1.5 font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs" />
            }>
              <Plus className="h-4 w-4" />
              Nuevo Registro
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={6} className="w-52 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DropdownMenuLabel className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Selecciona tipo
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem onClick={() => setIsAddWithdrawalOpen(true)} className="gap-2 text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer text-xs">
                <ArrowUpRight className="h-4 w-4" />
                <span>Retiro de Ganancias</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAddExpenseOpen(true)} className="gap-2 text-rose-600 dark:text-rose-400 font-semibold cursor-pointer text-xs">
                <Receipt className="h-4 w-4" />
                <span>Gasto / Evaluación</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem onClick={() => setIsAddAccountOpen(true)} className="gap-2 cursor-pointer text-xs">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span>Cuenta de Trading</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsAddFirmOpen(true)} className="gap-2 cursor-pointer text-xs">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Empresa de Fondeo</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : !hasData ? (
        <EmptyState
          title="No se encontraron cuentas o transacciones"
          description="Aún no tienes movimientos registrados. Registra tu primera firma de fondeo para comenzar."
          actionLabel="Agregar Empresa de Fondeo"
          onAction={() => setIsAddFirmOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {/* Dashboard Filters Bar */}
          <DashboardFilters firms={firms} />

          {/* FILA 1 - KPI CARDS WITH COMPARISON */}
          <KpiCards summary={summary} comparison={comparisonResult} />

          {/* FILA 2 - CASH FLOW PROJECTION (2/3) + RESUMEN DE CUENTAS (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2/3: Cash Flow Projection Line/Area Chart */}
            <div className="lg:col-span-2">
              <PerformanceLineChart
                expenses={filteredData.expenses}
                withdrawals={filteredData.withdrawals}
                startDate={startDate}
                endDate={endDate}
                onResetFilters={resetFilters}
              />
            </div>

            {/* Right 1/3: Cuentas / Próximos Vencimientos Widget */}
            <div className="lg:col-span-1">
              <AccountsDueWidget
                accounts={accounts}
                firms={firms}
                onAddAccount={() => setIsAddAccountOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Modals */}
      <AddFirmModal
        open={isAddFirmOpen}
        onOpenChange={setIsAddFirmOpen}
        onSubmit={handleAddFirm}
      />
      <AddAccountModal
        open={isAddAccountOpen}
        onOpenChange={setIsAddAccountOpen}
        firms={firms}
        onSubmit={handleAddAccount}
      />
      <AddExpenseModal
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        firms={firms}
        accounts={accounts}
        onSubmit={handleAddExpense}
      />
      <AddWithdrawalModal
        open={isAddWithdrawalOpen}
        onOpenChange={setIsAddWithdrawalOpen}
        firms={firms}
        accounts={accounts}
        onSubmit={handleAddWithdrawal}
      />

      {/* Edit Modals */}
      <EditFirmModal
        open={!!editingFirm}
        onOpenChange={(open) => !open && setEditingFirm(null)}
        firm={editingFirm}
        onSubmit={handleUpdateFirm}
      />
      <EditAccountModal
        open={!!editingAccount}
        onOpenChange={(open) => !open && setEditingAccount(null)}
        account={editingAccount}
        firms={firms}
        onSubmit={handleUpdateAccount}
      />
      <EditExpenseModal
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        expense={editingExpense}
        firms={firms}
        accounts={accounts}
        onSubmit={handleUpdateExpense}
      />
      <EditWithdrawalModal
        open={!!editingWithdrawal}
        onOpenChange={(open) => !open && setEditingWithdrawal(null)}
        withdrawal={editingWithdrawal}
        firms={firms}
        accounts={accounts}
        onSubmit={handleUpdateWithdrawal}
      />

      {/* Delete Firm Confirmation Dialog */}
      <AlertDialog open={!!deletingFirmId} onOpenChange={(open) => !open && setDeletingFirmId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Firma de Fondeo?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Esta acción eliminará permanentemente esta firma de fondeo y todas sus cuentas, gastos y retiros asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingFirmId) {
                  handleDeleteFirm(deletingFirmId);
                  setDeletingFirmId(null);
                }
              }}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Eliminar Firma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

