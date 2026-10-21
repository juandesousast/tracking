'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ShieldAlert, Target, XCircle, Loader2 } from 'lucide-react';
import { SimulatorSymbolConfig } from '@/types/database';

interface OrderPanelProps {
  currentPrice: number;
  config: SimulatorSymbolConfig;
  onExecuteOrder: (params: {
    side: 'BUY' | 'SELL';
    quantity: number;
    stopLoss: number | null;
    takeProfit: number | null;
  }) => void;
  onCloseAll: () => void;
  openPositionsCount: number;
  isExecutingOrder?: boolean;
  isClosingAll?: boolean;
}

export function OrderPanel({
  currentPrice,
  config,
  onExecuteOrder,
  onCloseAll,
  openPositionsCount,
  isExecutingOrder = false,
  isClosingAll = false,
}: OrderPanelProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');

  const handleBuy = () => {
    if (isExecutingOrder || isClosingAll) return;
    onExecuteOrder({
      side: 'BUY',
      quantity,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
    });
  };

  const handleSell = () => {
    if (isExecutingOrder || isClosingAll) return;
    onExecuteOrder({
      side: 'SELL',
      quantity,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            Precio de Mercado
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
            {currentPrice > 0 ? currentPrice.toFixed(config.decimals) : '—'}
          </div>
        </div>

        {openPositionsCount > 0 && (
          <button
            onClick={onCloseAll}
            disabled={isClosingAll || isExecutingOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
          >
            {isClosingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            <span>{isClosingAll ? 'Cerrando...' : `Cerrar Todo (${openPositionsCount})`}</span>
          </button>
        )}
      </div>

      {/* Contracts / Volume */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Contratos / Lotes
          </label>
          <input
            type="number"
            min="0.1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <ShieldAlert className="h-3 w-3 text-rose-500" />
            Stop Loss
          </label>
          <input
            type="number"
            step={config.minmov}
            placeholder="Opcional"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Target className="h-3 w-3 text-emerald-500" />
            Take Profit
          </label>
          <input
            type="number"
            step={config.minmov}
            placeholder="Opcional"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Execution Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        <button
          onClick={handleBuy}
          disabled={isExecutingOrder || isClosingAll}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-bold text-sm shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
        >
          {isExecutingOrder ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpRight className="h-4 w-4" />
          )}
          <span>Comprar (Long)</span>
        </button>

        <button
          onClick={handleSell}
          disabled={isExecutingOrder || isClosingAll}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-bold text-sm shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
        >
          {isExecutingOrder ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          <span>Vender (Short)</span>
        </button>
      </div>
    </div>
  );
}
