"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../dashboard-layout";
import {
  TradovateCredential,
  CopierRule,
  CopierLog,
  Account,
} from "@/types/database";
import {
  getTradovateCredentials,
  saveTradovateCredentials,
  getCopierRules,
  saveCopierRule,
  updateCopierRule,
  deleteCopierRule,
  getCopierLogs,
  executeKillSwitch,
} from "@/lib/services/copier";
import { getAccounts } from "@/lib/actions/actions";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CopierRuleModal } from "@/components/modals/copier-rule-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Repeat,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Zap,
  Activity,
  ArrowRight,
  Key,
} from "lucide-react";

export default function CopierPage() {
  const [credentials, setCredentials] = useState<TradovateCredential | null>(null);
  const [rules, setRules] = useState<CopierRule[]>([]);
  const [logs, setLogs] = useState<CopierLog[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global copier toggle state
  const [isCopierEnabled, setIsCopierEnabled] = useState(true);

  // Connection form inputs
  const [tradoUser, setTradoUser] = useState("");
  const [tradoAppId, setTradoAppId] = useState("");
  const [tradoEnv, setTradoEnv] = useState<"demo" | "live">("demo");
  const [isSavingCreds, setIsSavingCreds] = useState(false);

  // Modals & alerts
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CopierRule | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [isKillSwitchAlertOpen, setIsKillSwitchAlertOpen] = useState(false);
  const [isKillSwitchExecuting, setIsKillSwitchExecuting] = useState(false);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [creds, rList, lList, accList] = await Promise.all([
        getTradovateCredentials(),
        getCopierRules(),
        getCopierLogs(),
        getAccounts(),
      ]);

      setCredentials(creds);
      if (creds) {
        setTradoUser(creds.username_encrypted);
        setTradoAppId(creds.app_id);
        setTradoEnv(creds.account_environment);
      }
      setRules(rList);
      setLogs(lList);
      setAccounts(accList);
    } catch (err) {
      console.error("Error loading copier page data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Save Credentials
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradoUser || !tradoAppId) return;

    setIsSavingCreds(true);
    try {
      const updatedCreds = await saveTradovateCredentials({
        account_environment: tradoEnv,
        username_encrypted: tradoUser,
        app_id: tradoAppId,
        is_connected: true,
      });
      setCredentials(updatedCreds);
    } catch (err) {
      console.error("Error saving tradovate credentials:", err);
    } finally {
      setIsSavingCreds(false);
    }
  };

  // Handle Save / Update Rule
  const handleSaveRule = async (ruleData: {
    master_account_id: string;
    master_account_name: string;
    slave_account_id: string;
    slave_account_name: string;
    multiplier: number;
    convert_mini_to_micro: boolean;
    max_daily_loss?: number | null;
    is_active?: boolean;
  }) => {
    if (editingRule) {
      const updated = await updateCopierRule(editingRule.id, ruleData);
      setRules((prev) => prev.map((r) => (r.id === editingRule.id ? updated : r)));
    } else {
      const created = await saveCopierRule(ruleData);
      setRules((prev) => [created, ...prev]);
    }
    setEditingRule(null);
  };

  // Handle Toggle Active Rule
  const handleToggleRuleActive = async (rule: CopierRule) => {
    try {
      const updated = await updateCopierRule(rule.id, {
        is_active: !rule.is_active,
      });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    } catch (err) {
      console.error("Error toggling rule active:", err);
    }
  };

  // Handle Delete Rule
  const handleDeleteRule = async (id: string) => {
    try {
      await deleteCopierRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting rule:", err);
    }
  };

  // Handle Kill Switch
  const handleConfirmKillSwitch = async () => {
    setIsKillSwitchExecuting(true);
    try {
      await executeKillSwitch();
      await loadAllData();
    } catch (err) {
      console.error("Error executing kill switch:", err);
    } finally {
      setIsKillSwitchExecuting(false);
      setIsKillSwitchAlertOpen(false);
    }
  };

  const isConnected = credentials?.is_connected ?? false;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Repeat className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Copiador de Operaciones Tradovate
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Motor de replicación en tiempo real entre cuentas de fondeo.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Connection Status Badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Estado API:</span>
              {isConnected ? (
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1.5 py-1 px-2.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado ({credentials?.account_environment.toUpperCase()})
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 gap-1.5 py-1 px-2.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Desconectado
                </Badge>
              )}
            </div>

            {/* Global Copier Toggle */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Copier Global
              </span>
              <Switch
                checked={isCopierEnabled}
                onCheckedChange={setIsCopierEnabled}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadAllData}
              className="text-xs font-semibold gap-1.5 bg-white dark:bg-slate-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Card 1: Formulario de Conexión API Tradovate */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Conexión API Tradovate
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Configura tus credenciales oficiales de acceso a la API Tradovate / NinjaTrader.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSaveCredentials} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="trado-user" className="text-xs font-semibold">Usuario Tradovate</Label>
                <Input
                  id="trado-user"
                  type="text"
                  placeholder="ej. trader_pro"
                  value={tradoUser}
                  onChange={(e) => setTradoUser(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="trado-app" className="text-xs font-semibold">App ID</Label>
                <Input
                  id="trado-app"
                  type="text"
                  placeholder="ej. EdgeFlowCopier"
                  value={tradoAppId}
                  onChange={(e) => setTradoAppId(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="trado-env" className="text-xs font-semibold">Entorno de Operación</Label>
                <div className="flex gap-2 items-center pt-0.5">
                  <select
                    id="trado-env"
                    value={tradoEnv}
                    onChange={(e) => setTradoEnv(e.target.value as "demo" | "live")}
                    className="flex-1 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="demo">Demo / Simulación</option>
                    <option value="live">Live / Cuenta Real</option>
                  </select>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSavingCreds}
                    className="h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0"
                  >
                    {isSavingCreds ? "Guardando..." : "Conectar API"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card 2: Mapeo de Cuentas y Reglas de Copia */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Mapeo de Cuentas Master → Slaves
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Configura el flujo de replicación, multiplicadores y conversión de contratos.
                </CardDescription>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setEditingRule(null);
                setIsRuleModalOpen(true);
              }}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Nueva Regla
            </Button>
          </CardHeader>

          <CardContent className="pt-4 p-0 sm:p-6">
            {isLoading ? (
              <div className="p-6 space-y-3">
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              </div>
            ) : rules.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Repeat className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No hay reglas de copia configuradas
                </p>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Define qué cuenta principal transmitirá las órdenes a tus sub-cuentas.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRuleModalOpen(true)}
                  className="text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Agregar Primera Regla
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="py-3 px-4">Master</th>
                      <th className="py-3 px-4"></th>
                      <th className="py-3 px-4">Slave</th>
                      <th className="py-3 px-4 text-center">Multiplicador</th>
                      <th className="py-3 px-4 text-center">Mini → Micro</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {rule.master_account_name}
                        </td>
                        <td className="py-3 px-1 text-slate-400">
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {rule.slave_account_name}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                          {rule.multiplier}x
                        </td>
                        <td className="py-3 px-4 text-center">
                          {rule.convert_mini_to_micro ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-[10px]">
                              Activado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 text-[10px]">
                              Directo
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Switch
                            checked={rule.is_active && isCopierEnabled}
                            onCheckedChange={() => handleToggleRuleActive(rule)}
                          />
                        </td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingRule(rule);
                              setIsRuleModalOpen(true);
                            }}
                            className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingRuleId(rule.id)}
                            className="h-7 w-7 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Botonera de Emergencia (Kill Switch) */}
        <Card className="bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-xs">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
                  <ShieldAlert className="h-7 w-7 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                    Botonera de Emergencia — Kill Switch Global
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5 max-w-xl">
                    Cierra instantáneamente todas las posiciones abiertas, cancela órdenes pendientes y desactiva las reglas de copia en todas las cuentas conectadas.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsKillSwitchAlertOpen(true)}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6 py-5 rounded-xl shadow-md shadow-rose-600/30 gap-2 shrink-0 text-xs tracking-wide uppercase"
              >
                <Zap className="h-4 w-4" />
                Aplanar Posiciones y Cancelar Órdenes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Consola de Logs en Tiempo Real */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Consola de Logs en Tiempo Real
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Historial detallado de ejecución, latencia de copia y estado de las órdenes.
                </CardDescription>
              </div>
            </div>

            <Badge variant="outline" className="text-[10px] font-mono text-slate-500">
              {logs.length} eventos registrados
            </Badge>
          </CardHeader>

          <CardContent className="pt-4 p-0 sm:p-6">
            {isLoading ? (
              <div className="p-6 space-y-2">
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Activity className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No hay logs de operaciones recientes
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Las ejecuciones de copia aparecerán aquí automáticamente en tiempo real.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="py-2.5 px-4">Fecha / Hora</th>
                      <th className="py-2.5 px-4">Símbolo</th>
                      <th className="py-2.5 px-4">Acción</th>
                      <th className="py-2.5 px-4 text-center">Cant.</th>
                      <th className="py-2.5 px-4 text-center">Slaves Replicadas</th>
                      <th className="py-2.5 px-4 text-center">Latencia</th>
                      <th className="py-2.5 px-4 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">
                          {new Date(log.created_at).toLocaleString("es-ES", {
                            dateStyle: "short",
                            timeStyle: "medium",
                          })}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          {log.symbol}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={
                              log.action === "BUY"
                                ? "text-emerald-600 font-bold dark:text-emerald-400"
                                : "text-rose-600 font-bold dark:text-rose-400"
                            }
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-700 dark:text-slate-300">
                          {log.quantity}
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-700 dark:text-slate-300">
                          {log.slaves_count}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                          {log.latency_ms} ms
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {log.status === "SUCCESS" && (
                            <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1 text-[10px]">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              SUCCESS
                            </Badge>
                          )}
                          {log.status === "PARTIAL" && (
                            <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1 text-[10px]">
                              PARTIAL
                            </Badge>
                          )}
                          {log.status === "FAILED" && (
                            <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800 gap-1 text-[10px]">
                              <XCircle className="h-3 w-3 text-rose-600" />
                              FAILED
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Nueva / Editar Regla */}
      <CopierRuleModal
        open={isRuleModalOpen}
        onOpenChange={setIsRuleModalOpen}
        rule={editingRule}
        accounts={accounts}
        onSubmit={handleSaveRule}
      />

      {/* Alert Kill Switch */}
      <AlertDialog open={isKillSwitchAlertOpen} onOpenChange={setIsKillSwitchAlertOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              ¿Confirmar Kill Switch de Emergencia?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-1">
              <p>
                Esta acción enviará órdenes de cierre inmediato a Tradovate para aplanar todas las posiciones abiertas en tus cuentas, cancelará cualquier orden en espera y pausará automáticamente la copia de operaciones.
              </p>
              <p className="font-semibold text-rose-600 dark:text-rose-400">
                Esta acción no se puede deshacer.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isKillSwitchExecuting}
              onClick={handleConfirmKillSwitch}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isKillSwitchExecuting ? "Ejecutando..." : "Sí, Ejecutar Kill Switch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Delete Rule */}
      <AlertDialog open={!!deletingRuleId} onOpenChange={(open) => !open && setDeletingRuleId(null)}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white text-base">
              ¿Eliminar Regla de Copia?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              La cuenta asignada como Slave dejará de recibir operaciones replicadas de la cuenta Master.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingRuleId) {
                  handleDeleteRule(deletingRuleId);
                  setDeletingRuleId(null);
                }
              }}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Eliminar Regla
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
