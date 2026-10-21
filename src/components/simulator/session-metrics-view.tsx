'use client';

import React, { useState } from 'react';
import {
  BacktestingPosition,
  SimulatorSessionStats,
  SimulatorSymbolConfig,
} from '@/types/database';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Target, Shield, Clock, X, BarChart3, ListFilter } from 'lucide-react';

interface SessionMetricsViewProps {
  stats: SimulatorSessionStats;
  openPositions: BacktestingPosition[];
  onClosePosition: (positionId: string) => void;
  config: SimulatorSymbolConfig;
  currentPrice: number;
}

export function SessionMetricsView({
  stats,
  openPositions,
  onClosePosition,
  config,
  currentPrice,
}: SessionMetricsViewProps) {
  const [activeTab, setActiveTab] = useState<'open' | 'history' | 'stats'>('open');

  return (
    <div className="flex flex-col gap-4">
      {/* 4 Quick KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            PnL Realizado
          </span>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              stats.netPnl > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : stats.netPnl < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {stats.netPnl > 0 ? `+${formatCurrency(stats.netPnl)}` : formatCurrency(stats.netPnl)}
          </div>
          <span className="text-[11px] text-slate-400">
            {stats.trades.length} operaciones cerradas
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Win Rate
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.winRate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400">
            {stats.winningCount} ganadas / {stats.losingCount} pérdidas
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Profit Factor
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {stats.profitFactor !== null ? stats.profitFactor.toFixed(2) : '—'}
          </div>
          <span className="text-[11px] text-slate-400">
            Avg R: {stats.avgR !== null ? `${stats.avgR.toFixed(2)}R` : '—'}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Max Drawdown
          </span>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            -{formatCurrency(stats.maxDrawdown)}
          </div>
          <span className="text-[11px] text-slate-400">
            {stats.maxDrawdownPct.toFixed(1)}% de la cuenta
          </span>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('open')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'open'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ListFilter className="h-3.5 w-3.5" />
          <span>Posiciones Abiertas ({openPositions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>Historial ({stats.trades.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Curva de Capital</span>
        </button>
      </div>

      {/* Tab 1: Open Positions */}
      {activeTab === 'open' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          {openPositions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No tienes órdenes activas en el mercado. Ejecuta una compra o venta arriba.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Lado</th>
                    <th className="py-2.5 px-4">Cantidad</th>
                    <th className="py-2.5 px-4">Entrada</th>
                    <th className="py-2.5 px-4">Stop Loss</th>
                    <th className="py-2.5 px-4">Take Profit</th>
                    <th className="py-2.5 px-4">PnL Flotante</th>
                    <th className="py-2.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {openPositions.map((pos) => {
                    const diff =
                      pos.side === 'BUY'
                        ? currentPrice - pos.entry_price
                        : pos.entry_price - currentPrice;
                    const floatingPnl = Number(
                      (diff * pos.quantity * config.contractSize).toFixed(2)
                    );

                    return (
                      <tr key={pos.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              pos.side === 'BUY'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {pos.side === 'BUY' ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {pos.side}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{pos.quantity}</td>
                        <td className="py-3 px-4 font-mono">{pos.entry_price.toFixed(config.decimals)}</td>
                        <td className="py-3 px-4 font-mono text-rose-500">
                          {pos.stop_loss ? pos.stop_loss.toFixed(config.decimals) : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-500">
                          {pos.take_profit ? pos.take_profit.toFixed(config.decimals) : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span
                            className={
                              floatingPnl > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : floatingPnl < 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-500'
                            }
                          >
                            {floatingPnl > 0
                              ? `+${formatCurrency(floatingPnl)}`
                              : formatCurrency(floatingPnl)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onClosePosition(pos.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors"
                          >
                            <X className="h-3 w-3" />
                            Cerrar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Closed Trades History */}
      {activeTab === 'history' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          {stats.trades.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Aún no has cerrado ninguna operación en esta sesión.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Lado</th>
                    <th className="py-2.5 px-4">Entrada</th>
                    <th className="py-2.5 px-4">Salida</th>
                    <th className="py-2.5 px-4">R-Multiple</th>
                    <th className="py-2.5 px-4 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {stats.trades.map((t, idx) => {
                    const pnl = Number(t.pnl || 0);

                    return (
                      <tr key={t.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              t.side === 'BUY'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {t.side}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">{t.entry_price.toFixed(config.decimals)}</td>
                        <td className="py-3 px-4 font-mono">
                          {t.exit_price ? t.exit_price.toFixed(config.decimals) : '—'}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">
                          {t.r_multiple !== null && t.r_multiple !== undefined ? (
                            <span
                              className={
                                t.r_multiple > 0
                                  ? 'text-emerald-600 font-bold'
                                  : t.r_multiple < 0
                                  ? 'text-rose-600 font-bold'
                                  : 'text-slate-400'
                              }
                            >
                              {t.r_multiple > 0 ? `+${t.r_multiple}R` : `${t.r_multiple}R`}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span
                            className={
                              pnl > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : pnl < 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-500'
                            }
                          >
                            {pnl > 0 ? `+${formatCurrency(pnl)}` : formatCurrency(pnl)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Equity Curve Progression */}
      {activeTab === 'stats' && (
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">
            Evolución del Balance (Curva de Capital)
          </h4>
          <div className="space-y-2">
            {stats.curve.map((pt) => (
              <div
                key={pt.trade}
                className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 w-16">
                    {pt.trade === 0 ? 'Inicio' : `Trade #${pt.trade}`}
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(pt.balance)}
                  </span>
                </div>
                {pt.drawdown < 0 && (
                  <span className="font-mono text-[11px] text-rose-500">
                    DD: {formatCurrency(pt.drawdown)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
