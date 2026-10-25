"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import {
  DEFAULT_PLAYBOOK_STRATEGIES,
  StrategySetup,
  calculateStrategyMetrics,
} from "@/lib/services/strategies";
import { formatCurrency } from "@/lib/formatters";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Percent,
  Award,
  Layers,
  Plus,
  Clock,
  Target,
  Search,
  Sparkles,
  BarChart2,
  ListChecks,
  Trash2,
} from "lucide-react";
import { ResponsiveModal } from "@/components/modals/responsive-modal";

function StrategiesPageContent() {
  const [strategies, setStrategies] = useState<StrategySetup[]>(
    DEFAULT_PLAYBOOK_STRATEGIES
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Load custom strategies from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("playbook_user_strategies");
      if (saved) {
        const parsed: StrategySetup[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStrategies([...parsed, ...DEFAULT_PLAYBOOK_STRATEGIES]);
        }
      }
    } catch (e) {
      console.error("Error loading playbook strategies from localStorage", e);
    }
  }, []);

  // Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<StrategySetup["category"]>("Price Action");
  const [newDescription, setNewDescription] = useState("");
  const [newTargetRR, setNewTargetRR] = useState("2.0");
  const [newTimeframe, setNewTimeframe] = useState("5m");
  const [newRuleInput, setNewRuleInput] = useState("");
  const [newRules, setNewRules] = useState<string[]>([]);

  // Checklist checked state per strategy: { [strategyId-ruleIndex]: boolean }
  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({});

  const toggleRule = (strategyId: string, ruleIdx: number) => {
    const key = `${strategyId}-${ruleIdx}`;
    setCheckedRules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddRule = () => {
    if (newRuleInput.trim()) {
      setNewRules((prev) => [...prev, newRuleInput.trim()]);
      setNewRuleInput("");
    }
  };

  const handleCreateStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStrat: StrategySetup = {
      id: `strat-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      description: newDescription.trim() || "Estrategia personalizada del playbook.",
      targetRR: Number(newTargetRR) || 2.0,
      timeframe: newTimeframe.trim() || "5m",
      rulesChecklist: newRules.length > 0 ? newRules : ["Regla 1 de confirmación"],
      tradesCount: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      grossWins: 0,
      grossLosses: 0,
      bestTrade: 0,
      worstTrade: 0,
    };

    setStrategies((prev) => {
      const updated = [newStrat, ...prev];
      try {
        const userStrategies = updated.filter((s) => s.id.startsWith("strat-"));
        localStorage.setItem("playbook_user_strategies", JSON.stringify(userStrategies));
      } catch (e) {
        console.error("Error saving user strategies", e);
      }
      return updated;
    });

    setIsNewModalOpen(false);
    // Reset form
    setNewName("");
    setNewDescription("");
    setNewRules([]);
  };

  const handleDeleteStrategy = (strategyId: string) => {
    setStrategies((prev) => {
      const updated = prev.filter((s) => s.id !== strategyId);
      try {
        const userStrategies = updated.filter((s) => s.id.startsWith("strat-"));
        localStorage.setItem("playbook_user_strategies", JSON.stringify(userStrategies));
      } catch (e) {
        console.error("Error saving user strategies", e);
      }
      return updated;
    });
  };

  // Filtered strategies
  const filteredStrategies = useMemo(() => {
    return strategies.filter((strat) => {
      const matchesSearch =
        strat.name.toLowerCase().includes(search.toLowerCase()) ||
        strat.description.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory !== "all" && strat.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [strategies, search, selectedCategory]);

  // Overall Playbook KPIs
  const playbookKPIs = useMemo<{
    totalPnL: number;
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    topStrategy: { name: string; pnl: number } | null;
  }>(() => {
    let totalPnL = 0;
    let totalTrades = 0;
    let totalWins = 0;
    let grossWins = 0;
    let grossLosses = 0;
    let topStrategy: { name: string; pnl: number } | null = null;

    strategies.forEach((s) => {
      totalPnL += s.totalPnL;
      totalTrades += s.tradesCount;
      totalWins += s.winningTrades;
      grossWins += s.grossWins;
      grossLosses += s.grossLosses;

      if (!topStrategy || s.totalPnL > topStrategy.pnl) {
        topStrategy = { name: s.name, pnl: s.totalPnL };
      }
    });

    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    const profitFactor =
      grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 99 : 0;

    return {
      totalPnL,
      totalTrades,
      winRate,
      profitFactor,
      topStrategy,
    };
  }, [strategies]);

  const categories = ["all", "ICT / SMC", "Momentum", "Mean Reversion", "Price Action", "Order Flow", "Custom"];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <BookOpen className="h-5 w-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Playbook de Estrategias & Setups
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analiza qué patrones y modelos de entrada te otorgan una ventaja matemática real (Edge), Win Rate y Profit Factor por setup.
          </p>
        </div>

        <Button
          onClick={() => setIsNewModalOpen(true)}
          size="sm"
          className="gap-2 font-semibold self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Estrategia</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              PnL Acumulado Setups
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-2 tabular-nums">
            {formatCurrency(playbookKPIs.totalPnL)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            En {playbookKPIs.totalTrades} trades categorizados
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Win Rate Global
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2 tabular-nums">
            {playbookKPIs.winRate.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tasa de acierto promedio del playbook
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Profit Factor
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600">
              <BarChart2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2 tabular-nums">
            {playbookKPIs.profitFactor.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ganancias brutas / Pérdidas brutas
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Setup Más Rentable
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white mt-2 truncate">
            {playbookKPIs.topStrategy?.name || "N/A"}
          </p>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {playbookKPIs.topStrategy ? `+${formatCurrency(playbookKPIs.topStrategy.pnl)}` : "-"}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="overflow-x-auto pb-1 sm:pb-0">
          <AnimatedTabs
            size="sm"
            layoutId="strategies-category-tabs"
            tabs={categories.map((cat) => ({
              id: cat,
              label: cat === "all" ? "Todas las Categorías" : cat,
            }))}
            activeTab={selectedCategory}
            onChange={(id) => setSelectedCategory(id)}
          />
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar setup o regla..."
            className="pl-8 h-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStrategies.map((strat) => {
          const metrics = calculateStrategyMetrics(strat);

          return (
            <div
              key={strat.id}
              className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {strat.name}
                      </h3>
                      <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800">
                        {strat.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        TF: {strat.timeframe}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" />
                        Target R:R 1:{strat.targetRR}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-base tabular-nums ${
                        strat.totalPnL >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"
                      }`}
                    >
                      {strat.totalPnL >= 0 ? "+" : ""}
                      {formatCurrency(strat.totalPnL)}
                    </span>
                    {strat.id.startsWith("strat-") && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteStrategy(strat.id)}
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Eliminar setup personalizado"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {strat.description}
                </p>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60 mb-5">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 font-medium uppercase block">Win Rate</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {metrics.winRate.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {strat.winningTrades}W / {strat.losingTrades}L
                    </span>
                  </div>

                  <div className="text-center border-l border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium uppercase block">Profit Factor</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                      {metrics.profitFactor !== null ? metrics.profitFactor.toFixed(2) : "-"}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Ratio G/P</span>
                  </div>

                  <div className="text-center border-l border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium uppercase block">Trade Medio</span>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        metrics.expectancy >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {metrics.expectancy >= 0 ? "+" : ""}
                      {formatCurrency(metrics.expectancy)}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Esperanza</span>
                  </div>

                  <div className="text-center border-l border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium uppercase block">Mejor Trade</span>
                    <span className="text-sm font-bold text-emerald-600 tabular-nums">
                      +{formatCurrency(strat.bestTrade)}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Max: {formatCurrency(strat.worstTrade)}
                    </span>
                  </div>
                </div>

                {/* Pre-Execution Checklist */}
                <div className="space-y-2 mb-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ListChecks className="h-4 w-4 text-blue-600" />
                      Checklist de Confirmación Pre-Trade
                    </span>
                    <span className="text-[10px] text-slate-400">Verifica antes de disparar</span>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    {strat.rulesChecklist.map((rule, idx) => {
                      const isChecked = !!checkedRules[`${strat.id}-${idx}`];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleRule(strat.id, idx)}
                          className={`flex items-start gap-2 p-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                            isChecked
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent onClick
                            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className={isChecked ? "line-through opacity-80" : ""}>{rule}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>{strat.tradesCount} operaciones ejecutadas</span>
                <Badge
                  className={`text-[10px] ${
                    metrics.status === "profitable"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {metrics.status === "profitable" ? "Edge Comprobado" : "En Prueba"}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Strategy Modal */}
      <ResponsiveModal
        open={isNewModalOpen}
        onOpenChange={setIsNewModalOpen}
        title="Crear Nueva Estrategia en el Playbook"
        description="Define los parámetros institucionales y el checklist de confirmación para este setup de trading."
      >
        <form onSubmit={handleCreateStrategy} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre del Setup</Label>
            <Input
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ej. Ruptura de Sesión Asiática, Order Block 15m..."
              className="text-xs h-9 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoría</Label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full text-xs h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="ICT / SMC" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">ICT / SMC</option>
                <option value="Momentum" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Momentum</option>
                <option value="Price Action" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Price Action</option>
                <option value="Mean Reversion" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mean Reversion</option>
                <option value="Order Flow" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Order Flow</option>
                <option value="Custom" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Personalizada</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Timeframe Principal</Label>
              <Input
                value={newTimeframe}
                onChange={(e) => setNewTimeframe(e.target.value)}
                placeholder="Ej. 5m / 15m"
                className="text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Descripción del Modelo</Label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe la lógica detrás de la entrada, toma de liquidez y gestión de salida..."
              rows={2}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Checklist de Reglas (Confirmaciones obligatorias)</Label>
            <div className="flex gap-2">
              <Input
                value={newRuleInput}
                onChange={(e) => setNewRuleInput(e.target.value)}
                placeholder="Ej. Barrido previo de máximo asiático..."
                className="text-xs h-9 rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRule();
                  }
                }}
              />
              <Button type="button" onClick={handleAddRule} size="sm" variant="outline" className="rounded-xl">
                Añadir
              </Button>
            </div>
            {newRules.length > 0 && (
              <ul className="space-y-1 pt-1">
                {newRules.map((r, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsNewModalOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="rounded-xl bg-blue-600 text-white">
              Guardar en Playbook
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  );
}

export default function StrategiesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StrategiesPageContent />
    </Suspense>
  );
}
