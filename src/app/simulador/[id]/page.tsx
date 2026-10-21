'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  getSimulatorSession,
  placeSimulatorOrder,
  closeSimulatorPosition,
  closeAllSimulatorPositions,
  getRealSimulatorCandles,
} from '@/lib/actions/simulator-actions';
import {
  generateHistoricalCandles,
  getSymbolConfig,
  calculateSessionStats,
  calculatePositionPnl,
  calculateRMultiple,
  Candle,
} from '@/lib/services/simulator-engine';
import { BacktestingSession, BacktestingPosition } from '@/types/database';
import { LightweightChartView } from '@/components/simulator/lightweight-chart-view';
import { ReplayControls } from '@/components/simulator/replay-controls';
import { OrderPanel } from '@/components/simulator/order-panel';
import { SessionMetricsView } from '@/components/simulator/session-metrics-view';
import { formatCurrency } from '@/lib/formatters';
import { LinearLoader } from '@/components/ui/linear-loader';
import { ArrowLeft, Activity, ShieldCheck, Database } from 'lucide-react';

export default function SimulatorWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<BacktestingSession | null>(null);
  const [positions, setPositions] = useState<BacktestingPosition[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isRealData, setIsRealData] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Concurrency & Idempotency guards
  const [isExecutingOrder, setIsExecutingOrder] = useState<boolean>(false);
  const [isClosingAll, setIsClosingAll] = useState<boolean>(false);
  const [closingPositionIds, setClosingPositionIds] = useState<string[]>([]);

  // Synchronized positions ref to prevent closure race conditions
  const positionsRef = useRef<BacktestingPosition[]>([]);
  positionsRef.current = positions;

  const isExecutingOrderRef = useRef<boolean>(false);
  const isClosingAllRef = useRef<boolean>(false);
  const closingPositionIdsRef = useRef<Set<string>>(new Set());

  // Functional positions updater that keeps state, ref, and localStorage in perfect sync
  const updatePositions = (
    updater: (prev: BacktestingPosition[]) => BacktestingPosition[]
  ) => {
    setPositions((prev) => {
      const updated = updater(prev);
      positionsRef.current = updated;
      try {
        localStorage.setItem(`sim_positions_${sessionId}`, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  // Load session data
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        let foundSession: BacktestingSession | null = null;
        let foundPositions: BacktestingPosition[] = [];

        // Try server
        const res = await getSimulatorSession(sessionId);
        if (res.session) {
          foundSession = res.session;
          foundPositions = res.positions;
        } else {
          // Check localStorage fallback
          const localSessions = localStorage.getItem('sim_sessions');
          if (localSessions) {
            const list: BacktestingSession[] = JSON.parse(localSessions);
            foundSession = list.find((s) => s.id === sessionId) || null;
          }
          const localPositions = localStorage.getItem(`sim_positions_${sessionId}`);
          if (localPositions) {
            foundPositions = JSON.parse(localPositions);
          }
        }

        if (foundSession) {
          setSession(foundSession);
          setPositions(foundPositions);
          positionsRef.current = foundPositions;

          // Fetch real historical candles with graceful fallback
          const marketRes = await getRealSimulatorCandles(
            foundSession.symbol,
            foundSession.start_date,
            foundSession.end_date
          );
          setCandles(marketRes.candles);
          setIsRealData(marketRes.isRealData);
          setVisibleCount(Math.min(30, marketRes.candles.length));
        }
      } catch (err) {
        console.warn('Failed to load simulator workspace:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [sessionId]);

  const symbolConfig = useMemo(() => {
    return getSymbolConfig(session?.symbol || 'NAS100');
  }, [session?.symbol]);

  const currentCandle = candles[visibleCount - 1] || null;
  const currentPrice = currentCandle ? currentCandle.close : 0;

  // Automated SL / TP hit evaluation on every step (reads positionsRef.current to avoid resurrection bugs)
  const checkStopLossAndTakeProfit = (evalCandle: Candle) => {
    const currentPositions = positionsRef.current;
    const triggers: {
      pos: BacktestingPosition;
      exitPrice: number;
      pnl: number;
      rMultiple: number | null;
      exitTime: string;
    }[] = [];

    currentPositions.forEach((pos) => {
      if (pos.status !== 'OPEN') return;

      let exitPrice: number | null = null;

      if (pos.side === 'BUY') {
        if (pos.stop_loss && evalCandle.low <= pos.stop_loss) {
          exitPrice = pos.stop_loss;
        } else if (pos.take_profit && evalCandle.high >= pos.take_profit) {
          exitPrice = pos.take_profit;
        }
      } else {
        if (pos.stop_loss && evalCandle.high >= pos.stop_loss) {
          exitPrice = pos.stop_loss;
        } else if (pos.take_profit && evalCandle.low <= pos.take_profit) {
          exitPrice = pos.take_profit;
        }
      }

      if (exitPrice !== null) {
        const diff =
          pos.side === 'BUY'
            ? exitPrice - pos.entry_price
            : pos.entry_price - exitPrice;
        const pnl = Number((diff * pos.quantity * symbolConfig.contractSize).toFixed(2));
        const risk = pos.stop_loss ? Math.abs(pos.entry_price - pos.stop_loss) : 0;
        const rMultiple = risk > 0 ? Number((diff / risk).toFixed(2)) : null;
        const exitTime = new Date(evalCandle.time * 1000).toISOString();

        triggers.push({ pos, exitPrice, pnl, rMultiple, exitTime });
      }
    });

    if (triggers.length > 0) {
      const triggeredIds = new Set(triggers.map((t) => t.pos.id));

      // Atomic functional state update
      updatePositions((prev) =>
        prev.map((p) => {
          const match = triggers.find((t) => t.pos.id === p.id);
          if (match) {
            return {
              ...p,
              status: 'CLOSED' as const,
              exit_price: match.exitPrice,
              exit_time: match.exitTime,
              pnl: match.pnl,
              r_multiple: match.rMultiple,
            };
          }
          return p;
        })
      );

      // Async backend updates
      triggers.forEach((t) => {
        closeSimulatorPosition({
          positionId: t.pos.id,
          sessionId,
          symbol: t.pos.symbol,
          side: t.pos.side,
          quantity: t.pos.quantity,
          entryPrice: t.pos.entry_price,
          exitPrice: t.exitPrice,
          stopLoss: t.pos.stop_loss,
          exitTime: t.exitTime,
        });
      });
    }
  };

  // Advance 1 candle step forward
  const stepForward = () => {
    if (visibleCount < candles.length) {
      const nextIndex = visibleCount + 1;
      setVisibleCount(nextIndex);
      const nextCandle = candles[nextIndex - 1];
      if (nextCandle) {
        checkStopLossAndTakeProfit(nextCandle);
      }
    } else {
      setIsPlaying(false);
    }
  };

  // Playback loop timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(100, Math.floor(1000 / speed));
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= candles.length) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        const nextCandle = candles[next - 1];
        if (nextCandle) {
          checkStopLossAndTakeProfit(nextCandle);
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed, candles]);

  // Execute Order with concurrency lock & clientOrderId idempotency
  const handleExecuteOrder = async (params: {
    side: 'BUY' | 'SELL';
    quantity: number;
    stopLoss: number | null;
    takeProfit: number | null;
  }) => {
    if (!currentPrice || isExecutingOrderRef.current || isClosingAllRef.current) {
      return;
    }

    isExecutingOrderRef.current = true;
    setIsExecutingOrder(true);

    const clientOrderId = crypto.randomUUID();

    try {
      const newPos = await placeSimulatorOrder({
        session_id: sessionId,
        client_order_id: clientOrderId,
        symbol: symbolConfig.value,
        side: params.side,
        type: 'MARKET',
        quantity: params.quantity,
        entry_price: currentPrice,
        stop_loss: params.stopLoss,
        take_profit: params.takeProfit,
      });

      // Atomic functional addition
      updatePositions((prev) => {
        if (prev.some((p) => p.id === newPos.id)) {
          return prev;
        }
        return [...prev, newPos];
      });
    } catch (err) {
      console.error('Failed to execute simulator order:', err);
    } finally {
      isExecutingOrderRef.current = false;
      setIsExecutingOrder(false);
    }
  };

  // Close single position manually with idempotency & in-flight guard
  const handleClosePosition = async (positionId: string) => {
    if (!currentPrice) return;

    // Guard against double clicks on the same position
    if (closingPositionIdsRef.current.has(positionId)) {
      return;
    }

    const currentPositions = positionsRef.current;
    const target = currentPositions.find((p) => p.id === positionId);
    if (!target || target.status !== 'OPEN') {
      return;
    }

    closingPositionIdsRef.current.add(positionId);
    setClosingPositionIds(Array.from(closingPositionIdsRef.current));

    const exitTime = new Date(currentCandle ? currentCandle.time * 1000 : Date.now()).toISOString();
    const pnl = calculatePositionPnl(
      { side: target.side, quantity: target.quantity, entry_price: target.entry_price },
      currentPrice,
      target.symbol
    );
    const rMultiple = calculateRMultiple(
      target.entry_price,
      currentPrice,
      target.stop_loss,
      target.side
    );

    // Optimistic atomic update
    updatePositions((prev) =>
      prev.map((p) =>
        p.id === positionId
          ? {
              ...p,
              status: 'CLOSED' as const,
              exit_price: currentPrice,
              exit_time: exitTime,
              pnl,
              r_multiple: rMultiple,
            }
          : p
      )
    );

    try {
      await closeSimulatorPosition({
        positionId: target.id,
        sessionId,
        symbol: target.symbol,
        side: target.side,
        quantity: target.quantity,
        entryPrice: target.entry_price,
        exitPrice: currentPrice,
        stopLoss: target.stop_loss,
        exitTime,
      });
    } catch (err) {
      console.error('Failed to close simulator position:', err);
    } finally {
      closingPositionIdsRef.current.delete(positionId);
      setClosingPositionIds(Array.from(closingPositionIdsRef.current));
    }
  };

  // Close all open positions manually (atomic batch close)
  const handleCloseAll = async () => {
    if (!currentPrice || isClosingAllRef.current) return;

    const openPositionsToClose = positionsRef.current.filter((p) => p.status === 'OPEN');
    if (openPositionsToClose.length === 0) return;

    isClosingAllRef.current = true;
    setIsClosingAll(true);

    const exitTime = new Date(currentCandle ? currentCandle.time * 1000 : Date.now()).toISOString();

    // 1. Optimistic atomic update on client state for ALL open positions at once
    updatePositions((prev) =>
      prev.map((p) => {
        if (p.status !== 'OPEN') return p;
        const pnl = calculatePositionPnl(
          { side: p.side, quantity: p.quantity, entry_price: p.entry_price },
          currentPrice,
          p.symbol
        );
        const rMultiple = calculateRMultiple(
          p.entry_price,
          currentPrice,
          p.stop_loss,
          p.side
        );
        return {
          ...p,
          status: 'CLOSED' as const,
          exit_price: currentPrice,
          exit_time: exitTime,
          pnl,
          r_multiple: rMultiple,
        };
      })
    );

    // 2. Atomic server batch close
    try {
      await closeAllSimulatorPositions({
        sessionId,
        exitPrice: currentPrice,
        exitTime,
      });
    } catch (err) {
      console.error('Failed to close all simulator positions:', err);
    } finally {
      isClosingAllRef.current = false;
      setIsClosingAll(false);
    }
  };

  // Session Statistics Calculation
  const stats = useMemo(() => {
    const initial = session?.initial_balance || 10000;
    return calculateSessionStats(positions, initial);
  }, [positions, session?.initial_balance]);

  // Open Positions
  const openPositions = useMemo(() => {
    return positions.filter((p) => p.status === 'OPEN');
  }, [positions]);

  // Current floating balance
  const currentBalance = useMemo(() => {
    const initial = session?.initial_balance || 10000;
    const openPnl = openPositions.reduce((acc, pos) => {
      const diff =
        pos.side === 'BUY'
          ? currentPrice - pos.entry_price
          : pos.entry_price - currentPrice;
      return acc + diff * pos.quantity * symbolConfig.contractSize;
    }, 0);
    return Number((initial + stats.netPnl + openPnl).toFixed(2));
  }, [session?.initial_balance, stats.netPnl, openPositions, currentPrice, symbolConfig.contractSize]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 select-none animate-in fade-in duration-300">
        <LinearLoader size="md" label="Cargando espacio de trabajo del simulador..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-16 text-center">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Sesión no encontrada
        </h2>
        <Link
          href="/simulador"
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Volver al catálogo de sesiones
        </Link>
      </div>
    );
  }

  const currentDateText = currentCandle
    ? new Date(currentCandle.time * 1000).toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  const progressPercent =
    candles.length > 0 ? (visibleCount / candles.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/simulador"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                {session.symbol}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {session.start_date} al {session.end_date}
              </span>
              {isRealData ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Datos Reales de Mercado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Modo Replay
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {session.name}
            </h1>
          </div>
        </div>

        {/* Live Balance & PnL */}
        <div className="flex items-center gap-6 self-end sm:self-auto">
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              Balance Simulado
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatCurrency(currentBalance)}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-slate-400">
              PnL Total
            </span>
            <div
              className={`text-xl font-bold font-mono ${
                stats.netPnl > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : stats.netPnl < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {stats.netPnl > 0 ? `+${formatCurrency(stats.netPnl)}` : formatCurrency(stats.netPnl)}
            </div>
          </div>
        </div>
      </div>

      {/* Replay Controls Toolbar */}
      <ReplayControls
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        onStepForward={stepForward}
        onReset={() => {
          setIsPlaying(false);
          setVisibleCount(30);
        }}
        speed={speed}
        onSpeedChange={setSpeed}
        currentDateText={currentDateText}
        progressPercent={progressPercent}
      />

      {/* Main Grid: Chart 2/3 + Order Box 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <LightweightChartView
            candles={candles}
            visibleCount={visibleCount}
            openPositions={openPositions}
            symbol={session.symbol}
            decimals={symbolConfig.decimals}
          />
        </div>

        <div className="lg:col-span-1">
          <OrderPanel
            currentPrice={currentPrice}
            config={symbolConfig}
            onExecuteOrder={handleExecuteOrder}
            onCloseAll={handleCloseAll}
            openPositionsCount={openPositions.length}
            isExecutingOrder={isExecutingOrder}
            isClosingAll={isClosingAll}
          />
        </div>
      </div>

      {/* Bottom Performance & Position Manager */}
      <SessionMetricsView
        stats={stats}
        openPositions={openPositions}
        onClosePosition={handleClosePosition}
        config={symbolConfig}
        currentPrice={currentPrice}
        closingPositionIds={closingPositionIds}
      />
    </div>
  );
}
