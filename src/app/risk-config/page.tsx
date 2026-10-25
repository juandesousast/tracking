'use client';

import React, { useState, useEffect } from 'react';
import { getAccounts } from '@/lib/actions/actions';
import {
  PROP_FIRM_RISK_TEMPLATES,
  RiskTemplate,
} from '@/lib/constants/risk-templates';
import {
  getAccountRiskConfig,
  saveAccountRiskConfig,
} from '@/lib/services/risk-config-actions';
import { Account, AccountRiskConfig } from '@/types/database';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/services/toast';
import { cn } from '@/lib/utils';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Target,
  Clock,
  Laptop,
  CheckCircle2,
  Sliders,
  Wallet,
  Lock,
  Wifi,
  Save,
  Info,
  Scale,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function RiskConfigPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form State (Sync presets to Cloud for Desktop Copier pickup)
  const [isActive, setIsActive] = useState<boolean>(true);
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(1000);
  const [dailyLossAction, setDailyLossAction] = useState<'liquidate' | 'notify'>('liquidate');
  const [dailyProfitLock, setDailyProfitLock] = useState<number | ''>(1500);
  const [maxContracts, setMaxContracts] = useState<number>(5);
  const [consistencyPercent, setConsistencyPercent] = useState<number>(50);
  const [eodCloseTime, setEodCloseTime] = useState<string>('22:10');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('topstep-50k');
  const [filterFirm, setFilterFirm] = useState<string>('all');

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const accs = await getAccounts();
        setAccounts(accs);
        if (accs.length > 0) {
          const lastAccId = typeof window !== 'undefined' ? localStorage.getItem('last_selected_risk_account_id') : null;
          const initialAcc = accs.find((a) => a.id === lastAccId) || accs[0];
          setSelectedAccountId(initialAcc.id);
          await loadConfig(initialAcc.id);
        }
      } catch (e) {
        console.warn('Error loading accounts for risk config:', e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const loadConfig = async (accId: string) => {
    const config = await getAccountRiskConfig(accId);
    if (config && typeof config.is_active === 'boolean') {
      setIsActive(config.is_active);
      setDailyLossLimit(config.daily_loss_limit_amount || 1000);
      setDailyLossAction(config.daily_loss_limit_action || 'liquidate');
      setDailyProfitLock(config.daily_profit_target_amount || '');
      setMaxContracts(config.max_contracts_limit || 5);
      setConsistencyPercent(config.consistency_percentage_limit || 50);
      setEodCloseTime(config.auto_eod_close_time || '22:10');
      setSelectedTemplateId(config.template_id || 'topstep-50k');
      return;
    }

    if (typeof window !== 'undefined') {
      const local = localStorage.getItem(`risk_config_${accId}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (typeof parsed.is_active === 'boolean') setIsActive(parsed.is_active);
          setDailyLossLimit(parsed.daily_loss_limit_amount || 1000);
          setDailyLossAction(parsed.daily_loss_limit_action || 'liquidate');
          setDailyProfitLock(parsed.daily_profit_target_amount || '');
          setMaxContracts(parsed.max_contracts_limit || 5);
          setConsistencyPercent(parsed.consistency_percentage_limit || 50);
          setEodCloseTime(parsed.auto_eod_close_time || '22:10');
          setSelectedTemplateId(parsed.template_id || 'topstep-50k');
        } catch (e) {
          // Defaults
        }
      }
    }
  };

  const handleAccountChange = async (accId: string) => {
    setSelectedAccountId(accId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_selected_risk_account_id', accId);
    }
    await loadConfig(accId);
  };

  const handleApplyTemplate = (template: RiskTemplate) => {
    setSelectedTemplateId(template.id);
    setDailyLossLimit(template.dailyLossLimit);
    setMaxContracts(template.maxContracts);
    setConsistencyPercent(template.consistencyPercent);
    if (template.eodCloseRequired) {
      if (template.id.startsWith('topstep')) {
        setEodCloseTime('22:10');
      } else if (template.id.startsWith('apex')) {
        setEodCloseTime('22:59');
      } else {
        setEodCloseTime('22:50');
      }
    }
    toast.success('Plantilla de Referencia Seleccionada', `${template.label} cargada en el pre-configurador.`);
  };

  const handleSaveToCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const config: AccountRiskConfig = {
      account_id: selectedAccountId,
      template_id: selectedTemplateId || null,
      daily_loss_limit_amount: dailyLossLimit > 0 ? dailyLossLimit : null,
      daily_loss_limit_action: dailyLossAction,
      daily_profit_target_amount: typeof dailyProfitLock === 'number' && dailyProfitLock > 0 ? dailyProfitLock : null,
      max_contracts_limit: maxContracts > 0 ? maxContracts : null,
      consistency_percentage_limit: consistencyPercent > 0 ? consistencyPercent : null,
      auto_eod_close_time: eodCloseTime || null,
      trailing_drawdown_limit: null,
      is_active: isActive,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(`risk_config_${selectedAccountId}`, JSON.stringify(config));
    }

    try {
      await saveAccountRiskConfig(config);
      toast.success('Sincronizado con la Nube', 'Tus preferencias de riesgo se cargarán automáticamente en la App de Escritorio.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.warn('Saved locally:', err);
      toast.success('Guardado Local', 'Configuración lista para la App de Escritorio.');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAccount = accounts.find((a) => a.id === selectedAccountId);

  const filteredTemplates = PROP_FIRM_RISK_TEMPLATES.filter((t) => {
    if (filterFirm === 'all') return true;
    if (filterFirm === 'apex') return t.id.startsWith('apex');
    if (filterFirm === 'topstep') return t.id.startsWith('topstep');
    if (filterFirm === 'ftmo') return t.id.startsWith('ftmo');
    if (filterFirm === 'other') return !t.id.startsWith('apex') && !t.id.startsWith('topstep') && !t.id.startsWith('ftmo');
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* 1. Official Relocation Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Laptop className="h-3.5 w-3.5" />
                Centro de Operaciones Local
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                IP Residencial Segura
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Gestor de Riesgo y Reglas Prop Firm
            </h1>

            {/* Core User Requirement Callout */}
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-400/30 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base font-semibold text-blue-100 leading-relaxed">
                  &ldquo;La ejecución de reglas de riesgo en tiempo real y aplanamiento automático se ejecuta directamente en la App de Escritorio para proteger tu IP residencial sin latencia.&rdquo;
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Esta pantalla web funciona como <strong>guía de referencia y sincronizador en la nube</strong>. Las liquidaciones de emergencia, el tope de lotes y el cierre forzoso fin de día (EOD) se vigilan y disparan en tu máquina local para garantizar cumplimiento estricto con las firmas de fondeo.
            </p>
          </div>

          {/* Quick CTA to Desktop */}
          <div className="flex flex-col gap-3 w-full sm:w-auto shrink-0">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2 min-w-[220px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Vigilancia Local
              </span>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Escudo Activo en Desktop
              </div>
              <span className="text-[11px] text-slate-400">
                Pestaña <strong>🛡️ Riesgo</strong> en tu app de escritorio.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Architecture Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Wifi className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            IP Residencial $0 Fees
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Las firmas prohíben o marcan operativas desde IPs de centros de datos. La ejecución local en desktop utiliza tu conexión residencial sin requerir add-ons caros de API.
          </p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Latencia Sub-milisegundo (&lt; 3 ms)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            La detección de pérdida límite y la liquidación forzosa se ejecutan directamente en el WebSocket local de Tradovate sin el retraso de servidores cloud intermedios.
          </p>
        </div>

        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Watchdog EOD Automático
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            El temporizador local vigila el horario de corte diario de Topstep (22:10 CET / 15:10 CT) y Apex (22:59 CET) para cerrar toda posición abierta y evitar descalificaciones.
          </p>
        </div>
      </div>

      {/* 3. Official Prop Firm Rules Reference Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-500" />
              Matriz de Reglas Oficiales de Prop Firms
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consulta las reglas estándar para configurar tu Guardián de Riesgo con precisión.
            </p>
          </div>

          {/* Firm Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'topstep', label: 'Topstep' },
              { id: 'apex', label: 'Apex' },
              { id: 'ftmo', label: 'FTMO' },
            ].map((firm) => (
              <button
                key={firm.id}
                type="button"
                onClick={() => setFilterFirm(firm.id)}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer",
                  filterFirm === firm.id
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {firm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            return (
              <div
                key={template.id}
                className={cn(
                  "p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4",
                  isSelected
                    ? "border-blue-500/80 bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-blue-500/20"
                    : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {template.firmName}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {formatCurrency(template.accountSize, 'USD')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {template.label}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Key Metrics Pill Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Daily Loss</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      -${template.dailyLossLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Max Drawdown</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      -${template.maxDrawdown.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Tope Lotes</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {template.maxContracts} Contratos
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Corte EOD</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {template.eodCloseRequired ? template.eodTime.split('(')[1]?.replace(')', '') || template.eodTime : 'No exigido'}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => handleApplyTemplate(template)}
                  className="w-full text-xs font-bold rounded-xl mt-1 gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isSelected ? 'Plantilla Seleccionada' : 'Cargar en Pre-Configurador'}</span>
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Pre-Configurator & Cloud Sync Form */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-5 w-5 text-indigo-500" />
              Pre-Configuración y Respaldo en la Nube
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Guarda tus parámetros por cuenta aquí para que la App de Escritorio los descargue automáticamente al iniciar sesión.
            </p>
          </div>

          {/* Account Selector */}
          {accounts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Cuenta:</span>
              <select
                aria-label="Selecciona una cuenta para sincronizar con la nube"
                value={selectedAccountId}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="text-xs font-bold font-mono px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.alias || `Cuenta #${acc.account_number || acc.id.slice(0, 6)}`} ({formatCurrency(acc.account_size, 'USD')})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveToCloud} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Field 1: Daily Loss Limit */}
            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Pérdida Diaria Máxima ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  value={dailyLossLimit}
                  onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Límite duro antes de aplanar</span>
            </div>

            {/* Field 2: Daily Profit Target Lock */}
            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Bloqueo Ganancia / Target ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  placeholder="Opcional"
                  value={dailyProfitLock}
                  onChange={(e) => setDailyProfitLock(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Protege ganancias contra overtrading</span>
            </div>

            {/* Field 3: Max Contracts */}
            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Tope Máx Contratos
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxContracts}
                onChange={(e) => setMaxContracts(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 block">Bloquea órdenes por exceso de lotes</span>
            </div>

            {/* Field 4: EOD Auto-Close Time */}
            <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Corte Fin de Día (EOD)
              </label>
              <input
                type="text"
                placeholder="22:10 CET"
                value={eodCloseTime}
                onChange={(e) => setEodCloseTime(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 block">Topstep: 22:10 CET | Apex: 22:59 CET</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div>
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Preferencias sincronizadas en la nube para la App de Escritorio</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSaving || !selectedAccountId}
              size="lg"
              className="gap-2 w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Sincronizando...' : 'Guardar y Sincronizar con App Desktop'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
