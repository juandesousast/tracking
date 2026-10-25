'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CopierLog, Account } from '@/types/database';
import { getCopierLogs } from '@/lib/services/copier';
import { getAccounts } from '@/lib/actions/actions';
import { formatCurrency } from '@/lib/formatters';
import { DesktopDownloadBanner } from '@/components/copier/desktop-download-banner';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Repeat,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Activity,
  Layers,
  Clock,
  Wifi,
  ExternalLink,
  Laptop,
} from 'lucide-react';

export default function CopierPage() {
  const [logs, setLogs] = useState<CopierLog[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [lList, accList] = await Promise.all([
        getCopierLogs(),
        getAccounts(),
      ]);
      setLogs(lList);
      setAccounts(accList);
    } catch (err) {
      console.warn('Error loading copier cloud audit data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const totalReplicated = logs.length;
  const successfulCount = logs.filter((l) => l.status === 'SUCCESS').length;
  const avgLatency =
    totalReplicated > 0
      ? Math.round(logs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / totalReplicated)
      : 3;

  return (
    <>
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300 pb-12">
          {/* 1. Official Desktop Download Zone */}
          <DesktopDownloadBanner />

          {/* 2. Cloud Architecture Notice Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Laptop className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  Motor de Réplica en App de Escritorio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  La replicación en vivo se ejecuta localmente en tu ordenador para proteger tu IP residencial ante firmas de fondeo y garantizar latencias &lt; 3 ms sin coste de API.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Auditoría Nube Activa
              </span>
            </div>
          </div>

          {/* 3. Summary Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Réplicas Registradas
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
                  {totalReplicated}
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500">
                <Repeat className="h-5 w-5" />
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Latencia Promedio
                </span>
                <div className="text-2xl font-black font-mono text-emerald-500 mt-1">
                  {avgLatency} <span className="text-sm font-sans font-bold text-slate-400">ms</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500">
                <Zap className="h-5 w-5" />
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tasa de Éxito
                </span>
                <div className="text-2xl font-black font-mono text-purple-500 mt-1">
                  {totalReplicated > 0 ? `${Math.round((successfulCount / totalReplicated) * 100)}%` : '100%'}
                </div>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-500">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* 4. Replicated Trades Cloud Audit Table */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Historial de Operaciones Replicadas en la Nube
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Registro de auditoría sincronizado automáticamente por tu terminal de escritorio.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
                <span>{isRefreshing ? 'Actualizando...' : 'Refrescar'}</span>
              </Button>
            </div>

            {logs.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Repeat className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No hay registros de réplica recientes
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                  Inicia la App de Escritorio, vincula tu cuenta Tradovate y coloca una orden en la cuenta Master para ver el registro auditado aquí.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Master ID</th>
                      <th className="py-3 px-4">Símbolo</th>
                      <th className="py-3 px-4">Acción</th>
                      <th className="py-3 px-4">Cantidad</th>
                      <th className="py-3 px-4">Esclavas</th>
                      <th className="py-3 px-4">Latencia</th>
                      <th className="py-3 px-4 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {logs.map((log) => {
                      const isBuy = log.action === 'BUY';
                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-sans">
                            {new Date(log.created_at).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-bold">
                            #{log.master_order_id ? String(log.master_order_id).slice(-6) : 'ORD'}
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                            {log.symbol}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded font-black text-[10px]',
                                isBuy
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                              )}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {log.quantity}x
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {log.slaves_count} cuenta(s)
                          </td>
                          <td className="py-3 px-4 text-emerald-500 font-bold">
                            {log.latency_ms || 2} ms
                          </td>
                          <td className="py-3 px-4 text-right">
                            {log.status === 'SUCCESS' ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                                Exitoso
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px] font-bold">
                                {log.status}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
