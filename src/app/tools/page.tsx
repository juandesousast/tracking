'use client';

import React, { useState, useMemo } from 'react';
import {
  INSTRUMENT_SPECS,
  calculatePositionSize,
  calculateConsistencyRule,
  calculateDrawdownBuffer,
} from '@/lib/services/trading-calculators';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { AnimatedTabs } from '@/components/ui/animated-tabs';
import { cn } from '@/lib/utils';
import {
  Calculator,
  Scale,
  ShieldAlert,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Layers,
} from 'lucide-react';

export default function TradingToolsPage() {
  const [activeTab, setActiveTab] = useState<'position' | 'consistency' | 'drawdown'>('position');

  // --- TAB 1: Position Size State ---
  const [selectedSymbol, setSelectedSymbol] = useState('MNQ');
  const [accountBalance, setAccountBalance] = useState(50000);
  const [riskMode, setRiskMode] = useState<'amount' | 'percent'>('amount');
  const [riskAmount, setRiskAmount] = useState(250);
  const [riskPercent, setRiskPercent] = useState(0.5);
  const [entryPrice, setEntryPrice] = useState(20500);
  const [stopPrice, setStopPrice] = useState(20475);

  const positionResult = useMemo(() => {
    return calculatePositionSize({
      accountBalance,
      riskAmount: riskMode === 'amount' ? riskAmount : null,
      riskPercent: riskMode === 'percent' ? riskPercent : null,
      entryPrice,
      stopLossPrice: stopPrice,
      symbol: selectedSymbol,
    });
  }, [selectedSymbol, accountBalance, riskMode, riskAmount, riskPercent, entryPrice, stopPrice]);

  // --- TAB 2: Consistency Rule State ---
  const [rulePercent, setRulePercent] = useState<number>(30);
  const [dailyProfits, setDailyProfits] = useState<number[]>([1200, 450, 600, 350, 500]);
  const [newDayProfit, setNewDayProfit] = useState<string>('');

  const consistencyResult = useMemo(() => {
    return calculateConsistencyRule(dailyProfits, rulePercent);
  }, [dailyProfits, rulePercent]);

  const handleAddDay = () => {
    const val = parseFloat(newDayProfit);
    if (!isNaN(val) && val > 0) {
      setDailyProfits([...dailyProfits, val]);
      setNewDayProfit('');
    }
  };

  const handleRemoveDay = (index: number) => {
    setDailyProfits(dailyProfits.filter((_, i) => i !== index));
  };

  // --- TAB 3: Drawdown Buffer State ---
  const [ddCurrentBalance, setDdCurrentBalance] = useState(51200);
  const [ddHighWaterMark, setDdHighWaterMark] = useState(52500);
  const [ddLimit, setDdLimit] = useState(2500);
  const [isTrailing, setIsTrailing] = useState(true);

  const drawdownResult = useMemo(() => {
    return calculateDrawdownBuffer({
      currentBalance: ddCurrentBalance,
      highWaterMark: ddHighWaterMark,
      maxDrawdownLimit: ddLimit,
      isTrailing,
    });
  }, [ddCurrentBalance, ddHighWaterMark, ddLimit, isTrailing]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
            Suite de Operativa Institucional
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
          Herramientas & Calculadoras de Fondeo
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Protege tus cuentas antes de enviar cada orden al mercado. Calcula contratos exactos, audita la regla de consistencia y vigila tu colchón de drawdown.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="overflow-x-auto pb-1">
        <AnimatedTabs
          layoutId="tools-main-tabs"
          tabs={[
            { id: 'position', label: 'Calculadora de Contratos / Tamaño', icon: Calculator },
            { id: 'consistency', label: 'Regla de Consistencia (Apex / Topstep)', icon: Scale },
            { id: 'drawdown', label: 'Colchón de Drawdown & Umbral', icon: ShieldAlert },
          ]}
          activeTab={activeTab}
          onChange={(val) => setActiveTab(val as any)}
        />
      </div>

      {/* TAB 1: POSITION SIZE CALCULATOR */}
      {activeTab === 'position' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Inputs Column */}
          <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" />
              <span>Parámetros de la Operación</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Instrumento / Contrato
                </label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {INSTRUMENT_SPECS.map((s) => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Balance de la Cuenta ($)
                </label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Risk Mode Switch */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Riesgo Máximo Deseado
                </span>
                <AnimatedTabs
                  size="sm"
                  layoutId="tools-risk-mode"
                  tabs={[
                    { id: 'amount', label: 'Dólares Fijos ($)' },
                    { id: 'percent', label: '% de Cuenta' },
                  ]}
                  activeTab={riskMode}
                  onChange={(val) => setRiskMode(val as any)}
                />
              </div>

              {riskMode === 'amount' ? (
                <div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                    <input
                      type="number"
                      value={riskAmount}
                      onChange={(e) => setRiskAmount(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Equivale al {((riskAmount / (accountBalance || 1)) * 100).toFixed(2)}% del saldo.
                  </span>
                </div>
              ) : (
                <div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(Number(e.target.value))}
                      className="w-full pl-3.5 pr-8 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-3.5 top-2.5 text-slate-400 font-mono text-sm">%</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Equivale a ${((accountBalance * riskPercent) / 100).toFixed(2)} en dólares.
                  </span>
                </div>
              )}
            </div>

            {/* Price Levels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Precio de Entrada
                </label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1.5">
                  Precio de Stop Loss
                </label>
                <input
                  type="number"
                  step="any"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="p-6 rounded-3xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                Tamaño Recomendado
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {positionResult.contracts}
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase">
                  {positionResult.contracts === 1 ? 'Contrato' : 'Contratos'}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                Cálculo exacto: {positionResult.exactContracts} contratos
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Riesgo Total Real:</span>
                <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                  {formatCurrency(positionResult.actualRiskDollars, 'USD')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Distancia al Stop:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {positionResult.stopDistancePoints} pts ({positionResult.stopDistanceTicks} ticks)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Riesgo por Contrato:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {formatCurrency(positionResult.perContractRisk, 'USD')}
                </span>
              </div>
            </div>

            {positionResult.instrument.microSymbol && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <HelpCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip de Fondeo:</strong> Para mayor precisión de riesgo, puedes operar en Micro (<strong>{positionResult.instrument.microSymbol}</strong>) utilizando <strong>{positionResult.contracts * 10}</strong> contratos.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONSISTENCY RULE CALCULATOR */}
      {activeTab === 'consistency' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-500" />
                  <span>Historial de Ganancias Diarias</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Introduce los días ganadores de tu prueba para auditar el porcentaje de tu mejor sesión.
                </p>
              </div>

              {/* Rule Preset */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                {[30, 40, 50].map((pct) => (
                  <Button
                    key={pct}
                    size="sm"
                    variant={rulePercent === pct ? 'default' : 'ghost'}
                    onClick={() => setRulePercent(pct)}
                    className="h-7 px-3 text-xs font-bold rounded-lg"
                  >
                    Regla {pct}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Add Day Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  placeholder="Ganancia del día (ej. 850)"
                  value={newDayProfit}
                  onChange={(e) => setNewDayProfit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDay()}
                  className="w-full pl-8 pr-3.5 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={handleAddDay}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Añadir Día</span>
              </Button>
            </div>

            {/* Daily Profits List */}
            <div className="space-y-2">
              {consistencyResult.dayBreakdown.map((item, idx) => {
                const isBest = item.profit === consistencyResult.bestDayProfit;

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isBest
                        ? 'border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20'
                        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400 w-16">
                        Día #{item.day}
                      </span>
                      <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.profit, 'USD')}
                      </span>
                      {isBest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                          Mejor Día ({item.percentOfTotal}%)
                        </span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveDay(idx)}
                      className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consistency Results */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Estado de Elegibilidad
              </span>
              <div className="mt-2 flex items-center gap-2">
                {consistencyResult.isEligible ? (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                    <CheckCircle2 className="h-6 w-6" />
                    <span>Cumple la Regla</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-lg">
                    <AlertTriangle className="h-6 w-6" />
                    <span>Regla No Cumplida</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Beneficio Total Acumulado:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {formatCurrency(consistencyResult.totalProfit, 'USD')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mejor Día:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {formatCurrency(consistencyResult.bestDayProfit, 'USD')} ({consistencyResult.bestDayPercent}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Límite Permitido:</span>
                <span className="font-bold font-mono text-blue-600 dark:text-blue-400">
                  {rulePercent}% máximo
                </span>
              </div>
            </div>

            {!consistencyResult.isEligible && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-2 text-xs">
                <div className="font-bold text-rose-800 dark:text-rose-300">
                  ¿Cuánto necesitas generar para desbloquear el retiro?
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Tu mejor día representa el <strong>{consistencyResult.bestDayPercent}%</strong>. Para diluirlo al <strong>{rulePercent}%</strong>, necesitas generar al menos:
                </p>
                <div className="text-xl font-bold font-mono text-rose-700 dark:text-rose-300">
                  +{formatCurrency(consistencyResult.neededAdditionalProfit, 'USD')}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Hasta alcanzar un beneficio total de {formatCurrency(consistencyResult.neededTotalProfit, 'USD')}.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DRAWDOWN BUFFER CALCULATOR */}
      {activeTab === 'drawdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-blue-500" />
              <span>Configuración del Drawdown de la Firma</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Balance Actual de la Cuenta ($)
                </label>
                <input
                  type="number"
                  value={ddCurrentBalance}
                  onChange={(e) => setDdCurrentBalance(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pico Máximo Alcanzado (High Water Mark) ($)
                </label>
                <input
                  type="number"
                  value={ddHighWaterMark}
                  onChange={(e) => setDdHighWaterMark(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Límite de Drawdown Total ($)
                </label>
                <input
                  type="number"
                  value={ddLimit}
                  onChange={(e) => setDdLimit(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tipo de Drawdown
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={isTrailing ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setIsTrailing(true)}
                    className={cn(
                      "flex-1 h-9 text-xs font-bold rounded-xl",
                      isTrailing
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                        : "text-slate-500"
                    )}
                  >
                    Trailing (Apex/Topstep)
                  </Button>
                  <Button
                    type="button"
                    variant={!isTrailing ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setIsTrailing(false)}
                    className={cn(
                      "flex-1 h-9 text-xs font-bold rounded-xl",
                      !isTrailing
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                        : "text-slate-500"
                    )}
                  >
                    Estático / EOD
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Drawdown Results */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Colchón de Seguridad Restante
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-extrabold font-mono ${
                    drawdownResult.remainingBuffer > 1000
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : drawdownResult.remainingBuffer > 0
                      ? 'text-amber-500'
                      : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(drawdownResult.remainingBuffer, 'USD')}
                </span>
              </div>
              <span className="text-xs text-slate-500 block mt-1">
                {drawdownResult.bufferPercent}% de tu colchón intacto
              </span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  drawdownResult.bufferPercent > 50
                    ? 'bg-emerald-500'
                    : drawdownResult.bufferPercent > 20
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, drawdownResult.bufferPercent))}%` }}
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Umbral de Liquidación:</span>
                <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                  {formatCurrency(drawdownResult.liquidationThreshold, 'USD')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Pico de Referencia:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {formatCurrency(drawdownResult.highWaterMark, 'USD')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Distancia al Quiebre:</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                  {formatCurrency(drawdownResult.remainingBuffer, 'USD')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
