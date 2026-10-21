"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import {
  EconomicEvent,
  getEconomicEvents,
  filterEconomicEvents,
} from "@/lib/services/economic-events";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Flame,
  Search,
  RefreshCw,
  Clock,
  Globe,
  Radio,
  CalendarDays,
  ChevronDown,
  Info,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function EconomicCalendarContent() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [importanceFilter, setImportanceFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today"); // 'today' | 'week' | 'all'
  const [assetFilter, setAssetFilter] = useState<string>("all"); // 'all' | 'MNQ / NQ' | 'MES / ES' | 'EUR/USD' | 'USD/CAD' etc.
  const [propFirmOnly, setPropFirmOnly] = useState<boolean>(false); // Only high-impact prop firm restriction events
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const data = await getEconomicEvents();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching economic events:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Date Filter
      if (dateFilter === "today" && !ev.date.startsWith(todayStr)) return false;

      // Prop Firm Restrictions Only (Level 3 - High Impact)
      if (propFirmOnly && ev.importance !== 3) return false;

      // Asset Filter (MNQ, ES, EUR/USD, USD/CAD, etc.)
      if (assetFilter !== "all") {
        const hasAsset = ev.impactedAssets?.some((a) => a.symbol === assetFilter);
        if (!hasAsset) return false;
      }

      // Importance
      if (importanceFilter === "high" && ev.importance !== 3) return false;
      if (importanceFilter === "medium_high" && ev.importance < 2) return false;
      if (importanceFilter === "low" && ev.importance !== 1) return false;

      // Currency
      if (currencyFilter !== "all" && ev.currency !== currencyFilter) return false;

      // Search Query
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesCountry = ev.country.toLowerCase().includes(q);
        const matchesCurr = ev.currency.toLowerCase().includes(q);
        const matchesSource = ev.source.toLowerCase().includes(q);
        const matchesAsset = ev.impactedAssets?.some((a) =>
          a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesCountry && !matchesCurr && !matchesSource && !matchesAsset) {
          return false;
        }
      }

      return true;
    });
  }, [events, dateFilter, propFirmOnly, assetFilter, importanceFilter, currencyFilter, searchTerm, todayStr]);

  // Statistics
  const highImpactToday = useMemo(() => {
    return events.filter((e) => e.importance === 3 && e.date.startsWith(todayStr)).length;
  }, [events, todayStr]);

  const totalEventsToday = useMemo(() => {
    return events.filter((e) => e.date.startsWith(todayStr)).length;
  }, [events, todayStr]);

  const upcomingHighImpact = useMemo(() => {
    const upcoming = events.filter(
      (e) => e.importance === 3 && new Date(e.date).getTime() >= now.getTime()
    );
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [events, now]);

  const getTimeRemaining = (targetDateStr: string) => {
    const diffMs = new Date(targetDateStr).getTime() - Date.now();
    if (diffMs <= 0) return "En curso / Publicado";
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours > 0) return `En ${diffHours}h ${diffMins}m`;
    return `En ${diffMins} minutos`;
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Feed Macro en Directo • Reuters / TradingView
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Calendario Económico de Noticias
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoriza eventos macroeconómicos, proyecciones y volatilidad que impactan tus cuentas de fondeo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-medium shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Actualizar Feed
          </Button>
        </div>
      </div>

      {/* 2. Prop Firm News Rules Critical Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3.5">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold tracking-tight">
            Regla de Volatilidad para Cuentas de Fondeo (Apex, Topstep, FTMO, FundedNext)
          </span>
          <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
            La mayoría de firmas prohíben terminantemente tener órdenes abiertas o entrar al mercado{" "}
            <strong>2 minutos antes y 2 minutos después</strong> de publicaciones marcadas en{" "}
            <span className="text-rose-600 dark:text-rose-400 font-bold">ALTO IMPACTO (🔴)</span>. La
            violación de esta regla puede resultar en el reinicio forzado o suspensión inmediata de la cuenta.
          </p>
        </div>
      </div>

      {/* 3. Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* High Impact Events Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Alto Impacto Hoy
            </span>
            <span className="h-6 w-6 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
              <Flame className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">
              {highImpactToday}
            </span>
            <span className="text-xs text-slate-500 font-medium">noticias críticas</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Revisar antes de abrir operativa
          </p>
        </div>

        {/* Next Relevant Event */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Próximo Evento Clave
          </span>
          {upcomingHighImpact ? (
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold truncate max-w-[200px] text-slate-900 dark:text-white">
                  {upcomingHighImpact.title}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{getTimeRemaining(upcomingHighImpact.date)}</span>
                <span className="text-slate-400">•</span>
                <span>{upcomingHighImpact.currency}</span>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-slate-500">Sin eventos críticos pendientes hoy.</div>
          )}
        </div>

        {/* Total Events Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Eventos Programados Hoy
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">
              {totalEventsToday}
            </span>
            <span className="text-xs text-slate-500 font-medium">noticias</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Global (EE.UU., Europa, Asia, etc.)
          </p>
        </div>

        {/* Total Events in Feed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Eventos Filtrados
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black tabular-nums text-slate-900 dark:text-white">
              {filteredEvents.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">publicaciones</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Sincronizado vía Reuters
          </p>
        </div>
      </div>

      {/* 3.5 Asset / Prop Firm Products Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              🎯 Mis Activos / Contratos en Fondeo:
            </span>
            <span className="text-[11px] text-slate-500">
              (Filtra noticias con impacto directo en tus cuentas)
            </span>
          </div>

          <Button
            variant={propFirmOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setPropFirmOnly(!propFirmOnly)}
            className={`text-xs font-bold gap-1.5 h-8 rounded-xl transition-all ${
              propFirmOnly
                ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            }`}
          >
            <ShieldAlert className={`h-3.5 w-3.5 ${propFirmOnly ? "text-white" : "text-rose-600"}`} />
            {propFirmOnly ? "Solo Restricciones de Fondeo (Activo)" : "Filtrar Regla Prop Firm (±2m)"}
          </Button>
        </div>

        {/* Quick Asset Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Todos los Activos", value: "all" },
            { label: "🚀 MNQ / NQ (Nasdaq)", value: "MNQ / NQ" },
            { label: "📊 MES / ES (S&P 500)", value: "MES / ES" },
            { label: "💶 EUR/USD (Euro)", value: "EUR/USD" },
            { label: "🍁 USD/CAD (Canadiense)", value: "USD/CAD" },
            { label: "💷 GBP/USD (Cable)", value: "GBP/USD" },
            { label: "💴 USD/JPY (Yen)", value: "USD/JPY" },
            { label: "🥇 GC / Oro", value: "GC / Oro" },
            { label: "🛢️ CL / Crudo", value: "CL / Crudo" },
          ].map((item) => {
            const active = assetFilter === item.value;
            return (
              <Button
                key={item.value}
                size="sm"
                variant={active ? "default" : "secondary"}
                onClick={() => setAssetFilter(item.value)}
                className={`h-8 px-3 rounded-xl text-xs font-semibold transition-all ${
                  !active && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent"
                }`}
              >
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por noticia (ej. PIB, IPC, NAHB, Subastas, Empleo)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-xl border-slate-200 dark:border-slate-800 text-xs w-full"
          />
        </div>

        {/* Date Filter */}
        <div className="w-full md:w-44">
          <Select
            value={dateFilter}
            onValueChange={(val) => {
              if (val) setDateFilter(val);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-medium">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">📅 Solo Hoy</SelectItem>
              <SelectItem value="week">🗓️ Esta Semana (7d)</SelectItem>
              <SelectItem value="all">🌐 Todo el Historial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Importance Filter */}
        <div className="w-full md:w-56">
          <Select
            value={importanceFilter}
            onValueChange={(val) => {
              if (val) setImportanceFilter(val);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-medium">
              <SelectValue placeholder="Impacto de Noticias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Impactos</SelectItem>
              <SelectItem value="high">🔴 Solo Alto Impacto (Nivel 3)</SelectItem>
              <SelectItem value="medium_high">🟠 Impacto Medio y Alto</SelectItem>
              <SelectItem value="low">🟡 Solo Bajo Impacto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Currency Filter */}
        <div className="w-full md:w-56">
          <Select
            value={currencyFilter}
            onValueChange={(val) => {
              if (val) setCurrencyFilter(val);
            }}
          >
            <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-medium">
              <SelectValue placeholder="Todas las Divisas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Divisas</SelectItem>
              <SelectItem value="USD">🇺🇸 USD (Dólar EE.UU.)</SelectItem>
              <SelectItem value="EUR">🇪🇺 EUR (Zona Euro)</SelectItem>
              <SelectItem value="GBP">🇬🇧 GBP (Libra Esterlina)</SelectItem>
              <SelectItem value="CAD">🇨🇦 CAD (Dólar Canadiense)</SelectItem>
              <SelectItem value="CNY">🇨🇳 CNY (Yuan Chino)</SelectItem>
              <SelectItem value="JPY">🇯🇵 JPY (Yen Japonés)</SelectItem>
              <SelectItem value="AUD">🇦🇺 AUD (Dólar Australiano)</SelectItem>
              <SelectItem value="CHF">🇨🇭 CHF (Franco Suizo)</SelectItem>
              <SelectItem value="NZD">🇳🇿 NZD (Dólar Neozelandés)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 5. Economic Events Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">
              Listado de Publicaciones & Datos Macroeconómicos
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredEvents.length}
            </span>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <CalendarDays className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No hay eventos coincidentes
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Prueba a restablecer los filtros de impacto o divisa para ver más noticias.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/60">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-500">Fecha y Hora</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Divisa</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-center">Impacto</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Evento Macroeconómico</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-right">Actual</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-right">Previsión</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-right">Previo</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 text-center">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((ev) => {
                  const evDate = new Date(ev.date);
                  const isHigh = ev.importance === 3;
                  const isMedium = ev.importance === 2;

                  return (
                    <TableRow
                      key={ev.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 cursor-pointer ${
                        isHigh ? "bg-rose-50/20 dark:bg-rose-950/10" : ""
                      }`}
                      onClick={() => setSelectedEvent(ev)}
                    >
                      {/* Date & Time */}
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {evDate.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {evDate.toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Currency */}
                      <TableCell className="whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {ev.currency}
                        </span>
                      </TableCell>

                      {/* Importance Badge */}
                      <TableCell className="text-center whitespace-nowrap">
                        {isHigh ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                            ALTO
                          </span>
                        ) : isMedium ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                            MEDIO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            BAJO
                          </span>
                        )}
                      </TableCell>

                      {/* Event Title & Impacted Prop Firm Assets */}
                      <TableCell className="text-xs font-semibold text-slate-900 dark:text-white py-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-sm font-bold tracking-tight">{ev.title}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {ev.period && (
                              <span className="text-[10px] text-slate-400 font-normal mr-1">
                                Período: {ev.period} {ev.source ? `• ${ev.source}` : ""}
                              </span>
                            )}
                            {ev.impactedAssets?.map((asset) => {
                              const isSelected = assetFilter === asset.symbol;
                              return (
                                <Button
                                  key={asset.symbol}
                                  type="button"
                                  size="xs"
                                  variant={isSelected ? "default" : "secondary"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssetFilter(isSelected ? "all" : asset.symbol);
                                  }}
                                  className={`h-5 px-1.5 py-0 rounded-md text-[10px] font-bold transition-all ${
                                    !isSelected && "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60"
                                  }`}
                                  title={`Filtrar noticias que afectan a ${asset.name}`}
                                >
                                  {asset.symbol}
                                </Button>
                              );
                            })}
                            {isHigh && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                                <ShieldAlert className="h-2.5 w-2.5 text-rose-600" />
                                Restricción Prop Firm ±2m
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Actual */}
                      <TableCell className="text-xs text-right font-bold tabular-nums whitespace-nowrap">
                        {ev.actual !== null ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {ev.actual}
                            {ev.unit}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>

                      {/* Forecast */}
                      <TableCell className="text-xs text-right text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {ev.forecast !== null ? `${ev.forecast}${ev.unit}` : "—"}
                      </TableCell>

                      {/* Previous */}
                      <TableCell className="text-xs text-right text-slate-500 tabular-nums whitespace-nowrap">
                        {ev.previous !== null ? `${ev.previous}${ev.unit}` : "—"}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-center whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-slate-900"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 6. Event Detail Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {selectedEvent.currency}
                </span>
                {selectedEvent.importance === 3 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40">
                    🔴 ALTO IMPACTO
                  </span>
                )}
              </div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                {selectedEvent.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {new Date(selectedEvent.date).toLocaleString("es-ES", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Actual</span>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5">
                    {selectedEvent.actual !== null ? `${selectedEvent.actual}${selectedEvent.unit}` : "—"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Previsión</span>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {selectedEvent.forecast !== null ? `${selectedEvent.forecast}${selectedEvent.unit}` : "—"}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Previo</span>
                  <div className="text-sm font-bold text-slate-500 mt-0.5">
                    {selectedEvent.previous !== null ? `${selectedEvent.previous}${selectedEvent.unit}` : "—"}
                  </div>
                </div>
              </div>

              {selectedEvent.comment && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    Descripción & Relevancia:
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedEvent.comment}
                  </p>
                </div>
              )}

              {/* Impacted Prop Firm Assets */}
              {selectedEvent.impactedAssets && selectedEvent.impactedAssets.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    🎯 Activos de Trading Afectados Directamente:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {selectedEvent.impactedAssets.map((asset) => (
                      <span
                        key={asset.symbol}
                        className="px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800"
                      >
                        {asset.symbol} ({asset.name})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.importance === 3 && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900 dark:text-rose-200">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    Regla de Fondeo (Apex, Topstep, FTMO):
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Prohibido ejecutar órdenes o mantener órdenes límite/stop en{" "}
                    <strong>{selectedEvent.impactedAssets?.map((a) => a.symbol).join(", ") || selectedEvent.currency}</strong>{" "}
                    durante la ventana de <strong>±2 minutos</strong> de la publicación para evitar el bloqueo o fallo de la cuenta.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function EconomicCalendarPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EconomicCalendarContent />
    </Suspense>
  );
}
