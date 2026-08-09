"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useEffect, Suspense } from "react";
import { PropFirm } from "@/types/database";
import { Calendar, ChevronDown, Filter, RotateCcw } from "lucide-react";

interface DashboardFiltersProps {
  firms: PropFirm[];
  onFilterChange?: (filters: {
    preset: string;
    startDate: string | null;
    endDate: string | null;
    firmId: string;
  }) => void;
}

function DashboardFiltersContent({ firms, onFilterChange }: DashboardFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPreset = searchParams.get("preset") || "this_month";
  const currentStartDate = searchParams.get("startDate") || "";
  const currentEndDate = searchParams.get("endDate") || "";
  const currentFirmId = searchParams.get("firmId") || "all";

  const [preset, setPreset] = useState(currentPreset);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);
  const [firmId, setFirmId] = useState(currentFirmId);

  // Synchronize state with URL searchParams when URL changes externally
  useEffect(() => {
    setPreset(currentPreset);
    setStartDate(currentStartDate);
    setEndDate(currentEndDate);
    setFirmId(currentFirmId);
  }, [currentPreset, currentStartDate, currentEndDate, currentFirmId]);

  const applyFiltersToUrl = useCallback(
    (newPreset: string, newStart: string, newEnd: string, newFirm: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newPreset) params.set("preset", newPreset);
      else params.delete("preset");

      if (newStart) params.set("startDate", newStart);
      else params.delete("startDate");

      if (newEnd) params.set("endDate", newEnd);
      else params.delete("endDate");

      if (newFirm && newFirm !== "all") params.set("firmId", newFirm);
      else params.delete("firmId");

      const newQuery = params.toString();
      const currentQuery = searchParams.toString();

      if (newQuery !== currentQuery) {
        router.push(`${pathname}?${newQuery}`);
      }

      if (onFilterChange) {
        onFilterChange({
          preset: newPreset,
          startDate: newStart || null,
          endDate: newEnd || null,
          firmId: newFirm,
        });
      }
    },
    [searchParams, router, pathname, onFilterChange]
  );

  const calculateDatesForPreset = (p: string) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    if (p === "this_month") {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      };
    }

    if (p === "last_month") {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      };
    }

    if (p === "year_2026") {
      return {
        start: "2026-01-01",
        end: "2026-12-31",
      };
    }

    if (p === "all") {
      return { start: "", end: "" };
    }

    return { start: startDate, end: endDate };
  };

  const handlePresetChange = (newPreset: string) => {
    setPreset(newPreset);
    if (newPreset !== "custom") {
      const { start, end } = calculateDatesForPreset(newPreset);
      setStartDate(start);
      setEndDate(end);
      applyFiltersToUrl(newPreset, start, end, firmId);
    } else {
      applyFiltersToUrl("custom", startDate, endDate, firmId);
    }
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setPreset("custom");
    applyFiltersToUrl("custom", start, end, firmId);
  };

  const handleFirmChange = (newFirmId: string) => {
    setFirmId(newFirmId);
    applyFiltersToUrl(preset, startDate, endDate, newFirmId);
  };

  const handleReset = () => {
    setPreset("this_month");
    const { start, end } = calculateDatesForPreset("this_month");
    setStartDate(start);
    setEndDate(end);
    setFirmId("all");
    applyFiltersToUrl("this_month", start, end, "all");
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 pr-1 border-r border-slate-200 dark:border-slate-800">
        <Filter className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        Filtros
      </div>

      {/* Preset Selector */}
      <div className="flex items-center gap-1">
        <select
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="this_month">Este Mes</option>
          <option value="last_month">Mes Anterior</option>
          <option value="year_2026">Año 2026</option>
          <option value="all">Todo el Histórico</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      {/* Custom Date Inputs (only if preset === "custom") */}
      {preset === "custom" && (
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
            className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          />
          <span className="text-slate-400">-</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
            className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          />
        </div>
      )}

      {/* Prop Firm Selector */}
      <div className="flex items-center gap-1">
        <select
          value={firmId}
          onChange={(e) => handleFirmChange(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">Todas las Empresas</option>
          {firms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Reset button */}
      <button
        onClick={handleReset}
        title="Restablecer filtros"
        className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 text-xs font-medium ml-auto"
      >
        <RotateCcw className="h-3 w-3" />
        <span className="hidden sm:inline">Restablecer</span>
      </button>
    </div>
  );
}

export function DashboardFilters(props: DashboardFiltersProps) {
  return (
    <Suspense
      fallback={
        <div className="h-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 animate-pulse" />
      }
    >
      <DashboardFiltersContent {...props} />
    </Suspense>
  );
}

