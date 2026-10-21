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
import { cn } from '@/lib/utils';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Target,
  Layers,
  Clock,
  Scale,
  Save,
  CheckCircle2,
  Sliders,
  Wallet,
} from 'lucide-react';

export default function RiskConfigPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form State
  const [isActive, setIsActive] = useState<boolean>(true);
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(1000);
  const [dailyLossAction, setDailyLossAction] = useState<'liquidate' | 'notify'>('liquidate');
  const [dailyProfitLock, setDailyProfitLock] = useState<number | ''>(1500);
  const [maxContracts, setMaxContracts] = useState<number>(5);
  const [consistencyPercent, setConsistencyPercent] = useState<number>(30);
  const [eodCloseTime, setEodCloseTime] = useState<string>('22:50');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const accs = await getAccounts();
        setAccounts(accs);
        if (accs.length > 0) {
          setSelectedAccountId(accs[0].id);
          await loadConfig(accs[0].id);
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
    if (config) {
      setIsActive(config.is_active);
      setDailyLossLimit(config.daily_loss_limit_amount || 1000);
      setDailyLossAction(config.daily_loss_limit_action || 'liquidate');
      setDailyProfitLock(config.daily_profit_target_amount || '');
      setMaxContracts(config.max_contracts_limit || 5);
      setConsistencyPercent(config.consistency_percentage_limit || 30);
      setEodCloseTime(config.auto_eod_close_time || '22:50');
      setSelectedTemplateId(config.template_id || '');
    } else {
      // Default to Topstep/Apex standard
      const local = localStorage.getItem(`risk_config_${accId}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setIsActive(parsed.is_active);
          setDailyLossLimit(parsed.daily_loss_limit_amount || 1000);
          setDailyLossAction(parsed.daily_loss_limit_action || 'liquidate');
          setDailyProfitLock(parsed.daily_profit_target_amount || '');
          setMaxContracts(parsed.max_contracts_limit || 5);
          setConsistencyPercent(parsed.consistency_percentage_limit || 30);
          setEodCloseTime(parsed.auto_eod_close_time || '22:50');
          setSelectedTemplateId(parsed.template_id || '');
        } catch (e) {
          // Defaults
        }
      }
    }
  };

  const handleAccountChange = async (accId: string) => {
    setSelectedAccountId(accId);
    await loadConfig(accId);
  };

  const handleApplyTemplate = (template: RiskTemplate) => {
    setSelectedTemplateId(template.id);
    setDailyLossLimit(template.dailyLossLimit);
    setMaxContracts(template.maxContracts);
    setConsistencyPercent(template.consistencyPercent);
    if (template.eodCloseRequired) {
      setEodCloseTime('22:50');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
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

    try {
      await saveAccountRiskConfig(config);
      localStorage.setItem(`risk_config_${selectedAccountId}`, JSON.stringify(config));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn('Saved locally:', err);
      localStorage.setItem(`risk_config_${selectedAccountId}`, JSON.stringify(config));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const currentAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
              Escudo de Seguridad
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5">
            Gestión de Riesgo & Reglas Prop Firm
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Aplica límites de pérdida automática, bloquea sobreoperativa y protege tus cuentas antes de que la empresa de fondeo ejecute una liquidación forzosa.
          </p>
        </div>

        {/* Global Active Toggle */}
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Escudo de Riesgo
            </span>
            <span className="text-[11px] text-slate-500">
              {isActive ? 'Activo y vigilando' : 'Desactivado'}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label="Toggle escudo de riesgo"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Account Selector & Templates Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-1 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            1. Selecciona la Cuenta
          </label>

          {accounts.length === 0 ? (
            <div className="text-xs text-slate-500 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
              No tienes cuentas registradas aún. Ve a <strong>Cuentas de Fondeo</strong> para crear una.
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((acc) => (
                <Button
                  key={acc.id}
                  type="button"
                  variant="outline"
                  onClick={() => handleAccountChange(acc.id)}
                  className={cn(
                    "w-full h-auto text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between font-normal whitespace-normal",
                    selectedAccountId === acc.id
                      ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 shadow-xs text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="h-4 w-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {acc.alias || `Cuenta #${acc.account_number || acc.id.slice(0, 6)}`}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {formatCurrency(acc.account_size, 'USD')} • {acc.account_type || 'Evaluación'}
                      </div>
                    </div>
                  </div>
                  {selectedAccountId === acc.id && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </Button>
              ))}
            </div>
          )}

          {/* Preset Templates */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Plantillas Rápidas Prop Firm
            </label>
            <div className="space-y-2">
              {PROP_FIRM_RISK_TEMPLATES.map((tmpl) => (
                <Button
                  key={tmpl.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className={cn(
                    "w-full justify-between h-9 text-xs font-medium rounded-xl",
                    selectedTemplateId === tmpl.id
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 font-bold text-blue-600 dark:text-blue-400"
                      : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  <span>{tmpl.label}</span>
                  <Zap className="h-3.5 w-3.5 opacity-60" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Cards Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-5">
          {/* Card 1: Daily Loss Limit */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Límite de Pérdida Diaria (Daily Loss Limit)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Si las pérdidas acumuladas del día alcanzan este monto, se activa la acción de seguridad.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Monto Máximo de Pérdida ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    value={dailyLossLimit}
                    onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Acción ante el límite
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={dailyLossAction === 'liquidate' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setDailyLossAction('liquidate')}
                    className={cn(
                      "h-10 text-xs font-bold rounded-xl",
                      dailyLossAction !== 'liquidate' && "text-slate-500 border-slate-200 dark:border-slate-800"
                    )}
                  >
                    Liquidación (Aplanar)
                  </Button>
                  <Button
                    type="button"
                    variant={dailyLossAction === 'notify' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setDailyLossAction('notify')}
                    className={cn(
                      "h-10 text-xs font-bold rounded-xl",
                      dailyLossAction === 'notify'
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        : "text-slate-500 border-slate-200 dark:border-slate-800"
                    )}
                  >
                    Solo Alerta
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Daily Profit Target Lock & Overtrading */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bloqueo de Ganancias Diarias (Profit Lock)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detiene la operativa al alcanzar tu meta para evitar sobreoperar y devolver beneficios al mercado.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Meta de Beneficio Diario ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    placeholder="Opcional (ej. 1500)"
                    value={dailyProfitLock}
                    onChange={(e) => setDailyProfitLock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Límite de Contratos Simultáneos
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={maxContracts}
                  onChange={(e) => setMaxContracts(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Consistency & EOD Rules */}
          <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reglas de Horario y Consistencia Prop Firm
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Previene violaciones de cierre de fin de día y supervisa el porcentaje de consistencia.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Regla de Consistencia (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={consistencyPercent}
                    onChange={(e) => setConsistencyPercent(Number(e.target.value))}
                    className="w-full pl-3.5 pr-8 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-mono text-sm">%</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  30% (Apex), 50% (Topstep), 40% (FundedNext)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Horario de Cierre Obligatorio (EOD)
                </label>
                <input
                  type="text"
                  placeholder="22:50 CET"
                  value={eodCloseTime}
                  onChange={(e) => setEodCloseTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Cierra todas las posiciones abiertas 10 min antes de la sesión.
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Configuración de riesgo guardada con éxito</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              size="lg"
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Reglas de Riesgo'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
