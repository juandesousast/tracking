'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getSimulatorSessions,
  createSimulatorSession,
  deleteSimulatorSession,
} from '@/lib/actions/simulator-actions';
import { BacktestingSession } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';
import { CreateSimulatorSessionModal } from '@/components/modals/create-simulator-session-modal';
import {
  Activity,
  Plus,
  Play,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function SimulatorDashboardPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<BacktestingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      // First try server action
      const data = await getSimulatorSessions();
      if (data && data.length > 0) {
        setSessions(data);
      } else {
        // Check localStorage fallback for seamless offline/demo usage
        const local = localStorage.getItem('sim_sessions');
        if (local) {
          try {
            setSessions(JSON.parse(local));
          } catch (e) {
            setSessions([]);
          }
        }
      }
    } catch (e) {
      console.warn('Error fetching simulator sessions:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async (input: any) => {
    const created = await createSimulatorSession(input);
    const updated = [created, ...sessions];
    setSessions(updated);
    localStorage.setItem('sim_sessions', JSON.stringify(updated));
    router.push(`/simulador/${created.id}`);
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('¿Deseas eliminar esta sesión de simulación?')) return;

    await deleteSimulatorSession(id);
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    localStorage.setItem('sim_sessions', JSON.stringify(updated));
  };

  // KPI calculations
  const totalSessions = sessions.length;
  const profitableSessions = sessions.filter(
    (s) => s.current_balance > s.initial_balance
  ).length;
  const winRate =
    totalSessions > 0
      ? Number(((profitableSessions / totalSessions) * 100).toFixed(1))
      : 0;
  const totalPnl = sessions.reduce(
    (acc, s) => acc + (s.current_balance - s.initial_balance),
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
              Entorno Institucional
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
            Simulador de Mercado (Replay)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Prueba tus estrategias sobre datos de mercado históricos, ejecuta órdenes manuales sin arriesgar capital y audita tu rendimiento al milímetro.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-sm shadow-sm shadow-blue-600/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Sesión</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Sesiones Creadas
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">
            {totalSessions}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {profitableSessions} en beneficio positivo
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tasa de Sesiones Rentables
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">
            {winRate}%
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Sesiones con saldo superior al inicio
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            PnL Total Simulado
          </span>
          <div
            className={`text-2xl font-bold font-mono mt-1.5 ${
              totalPnl > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : totalPnl < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {totalPnl > 0 ? `+${formatCurrency(totalPnl)}` : formatCurrency(totalPnl)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Rendimiento neto acumulado
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Modo Replay
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <span>Alta Precisión</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Gráficos interactivos a 60 FPS
          </span>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Tus Sesiones de Backtesting
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Cargando tus sesiones de simulación...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No tienes sesiones de simulación aún
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
              Inicia una nueva sesión para practicar en vivo sobre velas históricas del Nasdaq, Dow Jones, Forex o Cripto.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Crear mi primera sesión</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s) => {
              const pnl = s.current_balance - s.initial_balance;
              const isProfit = pnl >= 0;

              return (
                <Link
                  key={s.id}
                  href={`/simulador/${s.id}`}
                  className="group relative p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {s.symbol}
                      </span>
                      <button
                        onClick={(e) => handleDeleteSession(s.id, e)}
                        title="Eliminar sesión"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {s.name}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{s.start_date} al {s.end_date}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Balance
                      </span>
                      <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(s.current_balance)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        PnL Neto
                      </span>
                      <div
                        className={`text-sm font-mono font-bold ${
                          isProfit
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {pnl > 0 ? `+${formatCurrency(pnl)}` : formatCurrency(pnl)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <CreateSimulatorSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateSession}
      />
    </div>
  );
}
