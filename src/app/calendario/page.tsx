"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PropFirm, Account, Expense, Withdrawal } from "@/types/database";
import { getFirms, getAccounts, getExpenses, getWithdrawals } from "@/lib/actions/actions";
import { getDailyPnLMap, getMonthPnLSummary, DailyPnL } from "@/lib/financials";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  Receipt,
  Scale,
  Percent,
  Building2,
  Wallet,
  ArrowUpDown,
  RotateCcw,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPropFirmLogo } from "@/lib/constants/prop-firms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const CATEGORY_LABELS: Record<string, string> = {
  evaluation: "Prueba / Evaluación",
  activation: "Tarifa de Activación (Funded)",
  reset: "Reinicio de Cuenta (Reset)",
  subscription: "Suscripción Mensual",
  other: "Otros gastos",
  "Challenge Fee": "Prueba / Evaluación",
  Reset: "Reinicio de Cuenta (Reset)",
  Activation: "Tarifa de Activación (Funded)",
  Otro: "Otros gastos",
};

function CalendarioContent() {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12

  const [isLoading, setIsLoading] = useState(true);
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Selected day for the detailed breakdown Sheet
  const [selectedDay, setSelectedDay] = useState<DailyPnL | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
      console.error("Error loading calendar data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const searchParams = useSearchParams();
  const accountParam = searchParams.get("account");

  // Controls state: selected account & view mode
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accountParam || "all");
  const [viewMode, setViewMode] = useState<"currency" | "percentage">("currency");

  useEffect(() => {
    if (accountParam) {
      setSelectedAccountId(accountParam);
    }
  }, [accountParam]);

  // Lookup maps
  const firmMap = useMemo(() => {
    const map = new Map<string, PropFirm>();
    firms.forEach((f) => map.set(f.id, f));
    return map;
  }, [firms]);

  const accountMap = useMemo(() => {
    const map = new Map<string, Account>();
    accounts.forEach((a) => map.set(a.id, a));
    return map;
  }, [accounts]);

  const selectedAccount = useMemo(() => {
    if (!selectedAccountId || selectedAccountId === "all") return null;
    return accounts.find((a) => a.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  const baseCapital = useMemo(() => {
    if (selectedAccount && selectedAccount.account_size > 0) {
      return selectedAccount.account_size;
    }
    return accounts.reduce((sum, a) => sum + (a.account_size || 0), 0);
  }, [selectedAccount, accounts]);

  // Daily map synchronized with selectedAccountId
  const dailyPnLMap = useMemo(() => {
    return getDailyPnLMap(expenses, withdrawals, selectedAccountId);
  }, [expenses, withdrawals, selectedAccountId]);

  const monthSummary = useMemo(() => {
    return getMonthPnLSummary(dailyPnLMap, currentYear, currentMonth);
  }, [dailyPnLMap, currentYear, currentMonth]);

  const monthNetPercent = useMemo(() => {
    if (baseCapital <= 0) return 0;
    return (monthSummary.totalNet / baseCapital) * 100;
  }, [monthSummary.totalNet, baseCapital]);

  // Monthly totals for withdrawals and expenses
  const { monthWithdrawals, monthExpenses, monthTxCount } = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    let wTotal = 0;
    let eTotal = 0;
    let txTotal = 0;
    for (const [date, daily] of dailyPnLMap.entries()) {
      if (date.startsWith(monthPrefix)) {
        wTotal += daily.totalWithdrawals;
        eTotal += daily.totalExpenses;
        txTotal += daily.txCount;
      }
    }
    return { monthWithdrawals: wTotal, monthExpenses: eTotal, monthTxCount: txTotal };
  }, [dailyPnLMap, currentYear, currentMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  // Calendar cells generation (Monday to Sunday)
  const calendarCells = useMemo(() => {
    const cells: Array<{
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      daily: DailyPnL | null;
      isToday: boolean;
    }> = [];

    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    // (getDay() + 6) % 7 makes Monday = 0, ..., Sunday = 6
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Previous month trailing days
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dateKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      cells.push({
        dateKey,
        dayNumber: dayNum,
        isCurrentMonth: false,
        daily: dailyPnLMap.get(dateKey) || null,
        isToday: dateKey === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        dateKey,
        dayNumber: d,
        isCurrentMonth: true,
        daily: dailyPnLMap.get(dateKey) || null,
        isToday: dateKey === todayStr,
      });
    }

    // Next month leading days to complete grid (multiples of 7, up to 35 or 42)
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const dateKey = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({
        dateKey,
        dayNumber: d,
        isCurrentMonth: false,
        daily: dailyPnLMap.get(dateKey) || null,
        isToday: dateKey === todayStr,
      });
    }

    return cells;
  }, [currentYear, currentMonth, dailyPnLMap, today]);

  const handleCellClick = (cellDaily: DailyPnL | null, dateKey: string) => {
    if (!cellDaily || cellDaily.txCount === 0) return;
    setSelectedDay(cellDaily);
    setIsSheetOpen(true);
  };

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDay) return "";
    const [y, m, d] = selectedDay.date.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = dateObj.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [selectedDay]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  const isNetPositive = monthSummary.totalNet > 0;
  const isNetNegative = monthSummary.totalNet < 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* HEADER SECTION: Title & Month Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <CalendarIcon className="h-5 w-5" />
            </div>
            Calendario Financiero PnL
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visualización mensual estilo Tradelio / TradeSyncer del rendimiento, días ganadores y balance neto.
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 px-2">
              <select
                aria-label="Seleccionar mes"
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer py-1"
              >
                {MONTH_NAMES.map((name, index) => (
                  <option
                    key={name}
                    value={index + 1}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Seleccionar año"
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer py-1"
              >
                {[2023, 2024, 2025, 2026, 2027, 2028].map((year) => (
                  <option
                    key={year}
                    value={year}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-10 text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            Hoy
          </Button>
        </div>
      </div>

      {/* FILTER & VIEW MODE BAR: Account Selector & Monetary/Percentage Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Left: Account Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline-block">
              Cuenta:
            </span>
            <Select
              value={selectedAccountId}
              onValueChange={(val) => setSelectedAccountId(val || "all")}
            >
              <SelectTrigger className="h-10 w-full sm:w-[320px] rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 shadow-2xs text-xs font-semibold px-3">
                <SelectValue placeholder="Todas las Cuentas">
                  {(val) => {
                    if (!val || val === "all") {
                      return (
                        <span className="flex items-center gap-2 font-medium truncate text-slate-900 dark:text-white">
                          <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>Todas las Cuentas</span>
                        </span>
                      );
                    }
                    const acc = accounts.find((a) => a.id === val);
                    if (!acc) return "Todas las Cuentas";
                    const firm = acc.firm_id ? firmMap.get(acc.firm_id) : null;
                    const logo = firm ? getPropFirmLogo(firm.name, firm.logo_url) : null;
                    const sizeStr = acc.account_size > 0 ? `$${acc.account_size.toLocaleString()}` : "";
                    const details = [
                      acc.account_number ? `#${acc.account_number}` : null,
                      acc.alias ? acc.alias : null,
                    ].filter(Boolean).join(" - ");
                    const detailsStr = details ? ` (${details})` : "";

                    return (
                      <span className="flex items-center gap-2 font-medium truncate text-slate-900 dark:text-white">
                        {logo ? (
                          <img
                            src={logo}
                            alt=""
                            className="h-4 w-4 rounded object-contain bg-white border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate">
                          {firm?.name || "Sin Firma"}{sizeStr ? ` - ${sizeStr}` : ""}{detailsStr}
                        </span>
                      </span>
                    );
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[340px] max-h-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-1.5 z-50">
                <SelectItem value="all" className="cursor-pointer py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-5 w-5 rounded bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                      <Wallet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">Todas las Cuentas</span>
                  </div>
                </SelectItem>
                {accounts.map((acc) => {
                  const firm = acc.firm_id ? firmMap.get(acc.firm_id) : null;
                  const logo = firm ? getPropFirmLogo(firm.name, firm.logo_url) : null;
                  const sizeFormatted = acc.account_size > 0 ? `$${acc.account_size.toLocaleString()}` : "";
                  const details = [
                    acc.account_number ? `#${acc.account_number}` : null,
                    acc.alias ? acc.alias : null,
                  ].filter(Boolean).join(" - ");
                  const detailsStr = details ? ` (${details})` : "";

                  return (
                    <SelectItem key={acc.id} value={acc.id} className="cursor-pointer py-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {logo ? (
                          <img
                            src={logo}
                            alt=""
                            className="h-4 w-4 rounded object-contain bg-white border border-slate-200 dark:border-slate-700 p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="h-4 w-4 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <Building2 className="h-3 w-3 text-slate-400" />
                          </div>
                        )}
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {firm?.name || "Sin Firma"}
                        </span>
                        {sizeFormatted && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                            - {sizeFormatted}
                          </span>
                        )}
                        {detailsStr && (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                            {detailsStr}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline-block">
            Vista:
          </span>
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("currency")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "currency"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <CircleDollarSign className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              <span>Monetario (€)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("percentage")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                viewMode === "percentage"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <Percent className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
              <span>Porcentaje (%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 MONTHLY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net PnL of Month */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PnL Neto del Mes
            </span>
            <div
              className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center",
                isNetPositive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : isNetNegative
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}
            >
              {isNetPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : isNetNegative ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <Scale className="h-4 w-4" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div
              className={cn(
                "text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums",
                isNetPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isNetNegative
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-900 dark:text-white"
              )}
            >
              {viewMode === "percentage" ? (
                <>
                  {isNetPositive ? "+" : ""}
                  {formatPercent(monthNetPercent)}
                </>
              ) : (
                <>
                  {isNetPositive ? "+" : ""}
                  {formatCurrency(monthSummary.totalNet)}
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {viewMode === "percentage"
                ? `${isNetPositive ? "+" : ""}${formatCurrency(monthSummary.totalNet)} (${baseCapital > 0 ? formatCurrency(baseCapital) : "s/ capital"})`
                : `Balance neto de ${MONTH_NAMES[currentMonth - 1]} ${currentYear}`}
            </p>
          </div>
        </Card>

        {/* KPI 2: Win Rate of Days */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Win Rate de Días
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatPercent(monthSummary.winRateDaysPercent)}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, monthSummary.winRateDaysPercent))}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {monthSummary.greenDaysCount + monthSummary.redDaysCount} días activos
              </span>
            </div>
          </div>
        </Card>

        {/* KPI 3: Green vs Red Days */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verdes vs Rojos
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2 text-xl lg:text-2xl font-extrabold tracking-tight tabular-nums">
              <span className="text-emerald-600 dark:text-emerald-400">
                {monthSummary.greenDaysCount} verdes
              </span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-rose-600 dark:text-rose-400">
                {monthSummary.redDaysCount} rojos
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {monthSummary.breakevenDaysCount > 0
                ? `${monthSummary.breakevenDaysCount} días breakeven`
                : "Sin empates registrados"}
            </p>
          </div>
        </Card>

        {/* KPI 4: Total Retiros vs Gastos */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Retiros vs Gastos
            </span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center">
              <ArrowUpDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Retiros:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatCurrency(monthWithdrawals)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Gastos:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                -{formatCurrency(monthExpenses)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5 border-t border-slate-100 dark:border-slate-800">
              Flujo mensual consolidado
            </p>
          </div>
        </Card>
      </div>

      {/* MONTHLY CALENDAR GRID OR EMPTY STATE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
        {selectedAccountId !== "all" && monthTxCount === 0 ? (
          <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Wallet className="h-8 w-8" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sin actividad en {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No se encontraron retiros ni gastos registrados para la cuenta seleccionada en este mes.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAccountId("all")}
              className="h-9 px-4 text-xs font-semibold gap-2 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              Restablecer a todas las cuentas
            </Button>
          </div>
        ) : (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3">
              {WEEKDAY_NAMES.map((wName, idx) => {
                const isWeekend = idx >= 5;
                return (
                  <div
                    key={wName}
                    className={cn(
                      "text-center py-2 text-xs font-bold uppercase tracking-wider",
                      isWeekend
                        ? "text-slate-400 dark:text-slate-500"
                        : "text-slate-600 dark:text-slate-300"
                    )}
                  >
                    {wName}
                  </div>
                );
              })}
            </div>

            {/* 7-column calendar cells */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {calendarCells.map((cell) => {
                const hasActivity = cell.daily !== null && cell.daily.txCount > 0;
                const net = cell.daily ? cell.daily.netProfit : 0;
                const isGreen = hasActivity && net > 0;
                const isRed = hasActivity && net < 0;
                const isBreakeven = hasActivity && net === 0;

                if (!cell.isCurrentMonth) {
                  return (
                    <div
                      key={cell.dateKey}
                      className="min-h-[90px] sm:min-h-[115px] rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-950/20 p-2 sm:p-3 opacity-30 select-none cursor-default"
                    >
                      <span className="text-xs font-medium text-slate-400">
                        {cell.dayNumber}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={cell.dateKey}
                    onClick={() => handleCellClick(cell.daily, cell.dateKey)}
                    role={hasActivity ? "button" : undefined}
                    tabIndex={hasActivity ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (hasActivity && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        handleCellClick(cell.daily, cell.dateKey);
                      }
                    }}
                    className={cn(
                      "min-h-[95px] sm:min-h-[120px] rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200",
                      !hasActivity &&
                        "bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-slate-400",
                      isGreen &&
                        "bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 font-bold hover:scale-[1.02] hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700/60 cursor-pointer",
                      isRed &&
                        "bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-600 font-bold hover:scale-[1.02] hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700/60 cursor-pointer",
                      isBreakeven &&
                        "bg-slate-100/70 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:scale-[1.02] hover:shadow-md cursor-pointer",
                      cell.isToday && "ring-2 ring-blue-500/50"
                    )}
                  >
                    {/* Cell Top: Day number + Transactions pill */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-xs sm:text-sm font-bold tracking-tight",
                            cell.isToday
                              ? "h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center -ml-0.5"
                              : hasActivity
                              ? "text-slate-800 dark:text-slate-100"
                              : "text-slate-400 dark:text-slate-500"
                          )}
                        >
                          {cell.dayNumber}
                        </span>
                      </div>

                      {hasActivity && cell.daily && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-4 border shrink-0 font-medium",
                            isGreen &&
                              "bg-emerald-100/70 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
                            isRed &&
                              "bg-rose-100/70 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300",
                            isBreakeven &&
                              "bg-slate-200/70 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          )}
                        >
                          {cell.daily.txCount} {cell.daily.txCount === 1 ? "mov" : "movs"}
                        </Badge>
                      )}
                    </div>

                    {/* Cell Bottom: Daily Net Profit */}
                    {hasActivity && cell.daily ? (
                      <div className="mt-2 text-right">
                        <div
                          className={cn(
                            "text-xs sm:text-base font-extrabold tracking-tight tabular-nums",
                            isGreen && "text-emerald-600 dark:text-emerald-400",
                            isRed && "text-rose-600 dark:text-rose-400",
                            isBreakeven && "text-slate-600 dark:text-slate-300"
                          )}
                        >
                          {viewMode === "percentage" ? (
                            <>
                              {net > 0 ? "+" : ""}
                              {formatPercent(baseCapital > 0 ? (net / baseCapital) * 100 : 0)}
                            </>
                          ) : (
                            <>
                              {net > 0 ? "+" : ""}
                              {formatCurrency(net)}
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* DETAIL SHEET FOR SELECTED DAY */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-0 flex flex-col justify-between overflow-hidden shadow-2xl"
        >
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <SheetHeader className="p-0 space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold px-2.5 py-0.5",
                    selectedDay && selectedDay.netProfit > 0
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : selectedDay && selectedDay.netProfit < 0
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  )}
                >
                  {selectedDay && selectedDay.netProfit > 0
                    ? `Día Ganador (+${formatCurrency(selectedDay.netProfit)})`
                    : selectedDay && selectedDay.netProfit < 0
                    ? `Día Negativo (${formatCurrency(selectedDay.netProfit)})`
                    : "Breakeven"}
                </Badge>
              </div>

              <SheetTitle className="text-xl font-bold text-slate-900 dark:text-white pt-1">
                {formattedSelectedDate}
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-500 dark:text-slate-400">
                Desglose detallado de las transacciones registradas en este día.
              </SheetDescription>
            </SheetHeader>

            {/* Quick stats cards for that day */}
            {selectedDay && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    Retiros
                  </span>
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{formatCurrency(selectedDay.totalWithdrawals)}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                  <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                    Gastos
                  </span>
                  <span className="text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                    -{formatCurrency(selectedDay.totalExpenses)}
                  </span>
                </div>
              </div>
            )}

            {/* Section: Withdrawals (Retiros) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-600" />
                  Retiros Cobrados ({selectedDay?.withdrawals.length || 0})
                </h3>
              </div>

              {selectedDay && selectedDay.withdrawals.length > 0 ? (
                <div className="space-y-2">
                  {selectedDay.withdrawals.map((w) => {
                    const firm = w.firm_id ? firmMap.get(w.firm_id) : null;
                    const account = w.account_id ? accountMap.get(w.account_id) : null;
                    const net =
                      typeof w.net_amount === "number"
                        ? w.net_amount
                        : (w.gross_amount || 0) - (w.fee_amount || 0);

                    return (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                            +{formatCurrency(net)}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          >
                            {w.status || "Cobrado"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {firm && (
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const logo = getPropFirmLogo(firm.name, firm.logo_url);
                                return logo ? (
                                  <img src={logo} alt="" className="h-4 w-4 rounded-xs object-contain" />
                                ) : (
                                  <Building2 className="h-3 w-3 text-slate-400" />
                                );
                              })()}
                              <span>{firm.name}</span>
                            </div>
                          )}
                          {account && (
                            <div className="flex items-center gap-1">
                              <Wallet className="h-3 w-3 text-slate-400" />
                              <span>
                                {account.alias ||
                                  (account.account_number ? `#${account.account_number}` : `$${account.account_size.toLocaleString()}`)}
                              </span>
                            </div>
                          )}
                        </div>

                        {w.fee_amount > 0 && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            Bruto: {formatCurrency(w.gross_amount)} | Comisión: -{formatCurrency(w.fee_amount)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  Sin retiros registrados este día
                </div>
              )}
            </div>

            {/* Section: Expenses (Gastos) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-rose-600" />
                  Gastos y Tarifas ({selectedDay?.expenses.length || 0})
                </h3>
              </div>

              {selectedDay && selectedDay.expenses.length > 0 ? (
                <div className="space-y-2">
                  {selectedDay.expenses.map((e) => {
                    const firm = e.firm_id ? firmMap.get(e.firm_id) : null;
                    const account = e.account_id ? accountMap.get(e.account_id) : null;
                    const catLabel = CATEGORY_LABELS[e.category] || e.category;

                    return (
                      <div
                        key={e.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                            -{formatCurrency(e.amount)}
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {catLabel}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {firm && (
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const logo = getPropFirmLogo(firm.name, firm.logo_url);
                                return logo ? (
                                  <img src={logo} alt="" className="h-4 w-4 rounded-xs object-contain" />
                                ) : (
                                  <Building2 className="h-3 w-3 text-slate-400" />
                                );
                              })()}
                              <span>{firm.name}</span>
                            </div>
                          )}
                          {account && (
                            <div className="flex items-center gap-1">
                              <Wallet className="h-3 w-3 text-slate-400" />
                              <span>
                                {account.alias ||
                                  (account.account_number ? `#${account.account_number}` : `$${account.account_size.toLocaleString()}`)}
                              </span>
                            </div>
                          )}
                        </div>

                        {e.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                            "{e.description}"
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                  Sin gastos registrados este día
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSheetOpen(false)}
              className="text-xs font-semibold"
            >
              Cerrar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function CalendarioPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CalendarioContent />
    </Suspense>
  );
}
