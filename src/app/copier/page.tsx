"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  TradovateCredential,
  CopierRule,
  CopierGroup,
  CopierSlave,
  CopierLog,
  Account,
  PropFirm,
} from "@/types/database";
import {
  getTradovateCredentials,
  saveTradovateCredential,
  deleteTradovateCredential,
  getCopierRules,
  saveCopierRule,
  updateCopierRule,
  deleteCopierRule,
  getCopierLogs,
  executeKillSwitch,
  groupRulesIntoCopierGroups,
  saveCopierGroup,
  toggleCopierGroup,
  deleteCopierGroup,
} from "@/lib/services/copier";
import { getAccounts, getFirms } from "@/lib/actions/actions";
import { TradovateClient, TradovateAccount, ConnectionStatus } from "@/lib/tradovate/tradovate-client";
import { CopyEngine } from "@/lib/tradovate/copy-engine";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CopierGroupModal } from "@/components/modals/copier-group-modal";
import { AddTradovateConnectionModal } from "@/components/modals/add-tradovate-connection-modal";
import { PageSkeleton } from "@/components/ui/page-skeleton";
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
  Building2,
  Wifi,
  WifiOff,
  Sparkles,
  Layers,
  Flame,
} from "lucide-react";

export default function CopierPage() {
  const [credentialsList, setCredentialsList] = useState<TradovateCredential[]>([]);
  const [rules, setRules] = useState<CopierRule[]>([]);
  const [logs, setLogs] = useState<CopierLog[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [firms, setFirms] = useState<PropFirm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live WebSocket Engine State
  const [wsStatus, setWsStatus] = useState<ConnectionStatus>("disconnected");
  const [wsLatency, setWsLatency] = useState<number>(0);
  const [liveAccounts, setLiveAccounts] = useState<TradovateAccount[]>([]);
  const clientRef = useRef<TradovateClient | null>(null);
  const engineRef = useRef<CopyEngine | null>(null);

  // Global copier toggle state
  const [isCopierEnabled, setIsCopierEnabled] = useState(true);

  // Modals & alerts
  const [isAddConnectionModalOpen, setIsAddConnectionModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<TradovateCredential | null>(null);
  const [deletingConnectionId, setDeletingConnectionId] = useState<string | null>(null);

  // Group modal & state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CopierGroup | null>(null);
  const [deletingGroupMasterId, setDeletingGroupMasterId] = useState<string | null>(null);
  const [flatteningGroup, setFlatteningGroup] = useState<CopierGroup | null>(null);
  const [isFlatteningExecuting, setIsFlatteningExecuting] = useState(false);

  // Global Kill Switch alerts
  const [isKillSwitchAlertOpen, setIsKillSwitchAlertOpen] = useState(false);
  const [isKillSwitchExecuting, setIsKillSwitchExecuting] = useState(false);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [creds, rList, lList, accList, firmList] = await Promise.all([
        getTradovateCredentials(),
        getCopierRules(),
        getCopierLogs(),
        getAccounts(),
        getFirms(),
      ]);

      setCredentialsList(creds);
      setRules(rList);
      setLogs(lList);
      setAccounts(accList);
      setFirms(firmList);
    } catch (err) {
      console.error("Error loading copier page data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Start WebSocket Replicator Client from User Browser (Residential IP Safe)
  useEffect(() => {
    const activeCred = credentialsList.find((c) => c.is_connected && c.access_token_encrypted);
    if (!activeCred || !activeCred.access_token_encrypted) {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
        setWsStatus("disconnected");
      }
      return;
    }

    const client = new TradovateClient({
      token: activeCred.access_token_encrypted,
      environment: activeCred.account_environment || "demo",
      onStatusChange: (status, latency) => {
        setWsStatus(status);
        setWsLatency(latency);
      },
      onAccounts: (accs) => {
        setLiveAccounts(accs);
      },
      onOrder: (order) => {
        engineRef.current?.handleMasterOrder(order);
      },
      onError: (err) => {
        console.error("Tradovate live error:", err);
      },
    });

    const engine = new CopyEngine(
      client,
      rules,
      isCopierEnabled,
      (res) => {
        const newLog: CopierLog = {
          id: `live-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          user_id: activeCred.user_id,
          master_order_id: res.slaveAccountId,
          symbol: res.symbol,
          action: res.action === "Buy" ? "BUY" : "SELL",
          quantity: res.copiedQty,
          slaves_count: 1,
          latency_ms: res.latencyMs,
          status: res.success ? "SUCCESS" : "FAILED",
          created_at: new Date().toISOString(),
        };
        setLogs((prev) => [newLog, ...prev]);
      }
    );

    clientRef.current = client;
    engineRef.current = engine;
    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [credentialsList]);

  // Keep engine rules & enabled flag updated
  useEffect(() => {
    engineRef.current?.updateRules(rules);
    engineRef.current?.setEnabled(isCopierEnabled);
  }, [rules, isCopierEnabled]);

  // Handle Save / Update Connection
  const handleSaveConnection = async (data: {
    id?: string;
    connection_name: string;
    username_encrypted: string;
    password_encrypted?: string | null;
    app_id?: string;
    access_token_encrypted?: string | null;
    account_environment: "demo" | "live";
  }) => {
    try {
      const saved = await saveTradovateCredential(data);
      if (data.id) {
        setCredentialsList((prev) =>
          prev.map((c) => (c.id === data.id ? saved : c))
        );
      } else {
        setCredentialsList((prev) => [saved, ...prev]);
      }
    } catch (err) {
      console.error("Error saving connection:", err);
    }
  };

  // Handle Delete Connection
  const handleDeleteConnection = async (id: string) => {
    try {
      await deleteTradovateCredential(id);
      setCredentialsList((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting connection:", err);
    }
  };

  // Derive Copier Groups from Rules
  const copierGroups = groupRulesIntoCopierGroups(rules);

  // Handle Save Copier Group
  const handleSaveGroup = async (groupData: {
    name: string;
    master_account_id: string;
    master_account_name: string;
    is_active: boolean;
    slaves: Array<{
      id?: string;
      account_id: string;
      account_name: string;
      multiplier: number;
      convert_mini_to_micro: boolean;
      max_daily_loss?: number | null;
      is_active: boolean;
    }>;
  }) => {
    try {
      await saveCopierGroup(groupData);
      await loadAllData();
      setEditingGroup(null);
    } catch (err) {
      console.error("Error saving copier group:", err);
    }
  };

  // Handle Toggle Group
  const handleToggleGroup = async (group: CopierGroup) => {
    try {
      await toggleCopierGroup(group.master_account_id, !group.is_active);
      setRules((prev) =>
        prev.map((r) =>
          r.master_account_id === group.master_account_id
            ? { ...r, is_active: !group.is_active }
            : r
        )
      );
    } catch (err) {
      console.error("Error toggling group:", err);
    }
  };

  // Handle Delete Group
  const handleDeleteGroup = async (masterAccountId: string) => {
    try {
      await deleteCopierGroup(masterAccountId);
      setRules((prev) => prev.filter((r) => r.master_account_id !== masterAccountId));
    } catch (err) {
      console.error("Error deleting group:", err);
    }
  };

  // Handle Flatten / Liquidate Group
  const handleConfirmFlattenGroup = async () => {
    if (!flatteningGroup) return;
    setIsFlatteningExecuting(true);
    try {
      // 1. Flatten master account
      const masterAccId = Number(flatteningGroup.master_account_id);
      if (clientRef.current && !isNaN(masterAccId)) {
        await clientRef.current.liquidateAccount(masterAccId);
      }

      // 2. Flatten all slave accounts
      for (const slave of flatteningGroup.slaves) {
        const slaveAccId = Number(slave.account_id);
        if (clientRef.current && !isNaN(slaveAccId)) {
          await clientRef.current.liquidateAccount(slaveAccId);
        }
      }

      // Log the flatten action
      const newLog: CopierLog = {
        id: `flatten-${Date.now()}`,
        user_id: flatteningGroup.user_id || "current",
        master_order_id: flatteningGroup.master_account_id,
        symbol: "ALL",
        action: "SELL",
        quantity: flatteningGroup.slaves.length + 1,
        slaves_count: flatteningGroup.slaves.length,
        latency_ms: 12,
        status: "SUCCESS",
        created_at: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error("Error flattening group:", err);
    } finally {
      setIsFlatteningExecuting(false);
      setFlatteningGroup(null);
    }
  };

  // Handle Global Kill Switch
  const handleConfirmKillSwitch = async () => {
    setIsKillSwitchExecuting(true);
    try {
      await executeKillSwitch();
      if (clientRef.current) {
        for (const acc of liveAccounts) {
          await clientRef.current.liquidateAccount(acc.id);
        }
      }
      await loadAllData();
    } catch (err) {
      console.error("Error executing global kill switch:", err);
    } finally {
      setIsKillSwitchExecuting(false);
      setIsKillSwitchAlertOpen(false);
    }
  };

  const activeConnectionsCount = credentialsList.filter((c) => c.is_connected).length;

  return (
    <>
      {isLoading ? (
        <PageSkeleton />
      ) : (
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
                    Copiador de Futuros Tradovate Multi-Empresa
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Motor de replicación en tiempo real por grupos de cuentas Master y Slaves.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Connection Status Summary Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Replicador IP Local:</span>
                {wsStatus === "connected" ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1.5 py-1 px-2.5 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    En Vivo ({wsLatency} ms)
                  </Badge>
                ) : wsStatus === "connecting" ? (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1.5 py-1 px-2.5 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Conectando WebSocket...
                  </Badge>
                ) : activeConnectionsCount > 0 ? (
                  <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800 gap-1.5 py-1 px-2.5 text-xs">
                    {activeConnectionsCount} {activeConnectionsCount === 1 ? "Conexión Guardada" : "Conexiones Guardadas"}
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 gap-1.5 py-1 px-2.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    Sin Conexiones
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

          {/* Card 1: Mis Conexiones Tradovate / Empresas */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Mis Conexiones Tradovate / Empresas
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Gestiona tus conexiones activas de Tradovate y cuentas de fondeo vinculadas.
                  </CardDescription>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setEditingConnection(null);
                  setIsAddConnectionModalOpen(true);
                }}
                className="gap-2 font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Conectar Nueva Empresa</span>
              </Button>
            </CardHeader>

            <CardContent className="pt-4">
              {credentialsList.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Building2 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No hay conexiones de empresa configuradas
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Conecta tus cuentas de Tradovate de Topstep, Apex o firmas personalizadas.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingConnection(null);
                      setIsAddConnectionModalOpen(true);
                    }}
                    className="text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Conectar Primera Empresa
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {credentialsList.map((conn) => (
                    <div
                      key={conn.id}
                      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {conn.connection_name}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            {conn.is_connected && wsStatus === "connected" ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0.5 gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                En Vivo ({wsLatency}ms)
                              </Badge>
                            ) : conn.is_connected ? (
                              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] py-0.5">
                                Guardado
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-[10px] py-0.5">
                                Desconectado
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-[10px] uppercase font-mono">
                              {conn.account_environment}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-sans">Usuario:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{conn.username_encrypted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-sans">Modo:</span>
                            <span className="text-slate-800 dark:text-slate-200 font-sans font-medium text-[11px]">
                              {conn.access_token_encrypted ? "Sesión Web (0 € - IP Local)" : "API Tradovate"}
                            </span>
                          </div>
                          {liveAccounts.length > 0 && conn.is_connected && (
                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 mt-2">
                              <span className="text-[10px] text-slate-400 font-sans block mb-1">Cuentas Sincronizadas:</span>
                              {liveAccounts.map((acc) => (
                                <div key={acc.id} className="flex justify-between items-center text-[11px] bg-slate-100 dark:bg-slate-850 p-1.5 rounded-lg mb-1 border border-slate-200/40 dark:border-slate-800">
                                  <span className="font-bold text-slate-900 dark:text-white">{acc.name}</span>
                                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">${acc.balance?.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingConnection(conn);
                            setIsAddConnectionModalOpen(true);
                          }}
                          className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingConnectionId(conn.id)}
                          className="h-7 w-7 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Grupos de Copia de Futuros (Master + Múltiples Slaves) */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    Grupos de Copia de Futuros (Master → Slaves)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Estructura tus replicaciones por grupos con multiplicadores y aplanado masivo.
                  </CardDescription>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setEditingGroup(null);
                  setIsGroupModalOpen(true);
                }}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Nuevo Grupo de Copia
              </Button>
            </CardHeader>

            <CardContent className="pt-4 p-4 sm:p-6 space-y-4">
              {copierGroups.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <Layers className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No hay grupos de copia configurados
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Crea un grupo definiendo una cuenta Master y una o más cuentas esclavas.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingGroup(null);
                      setIsGroupModalOpen(true);
                    }}
                    className="text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Crear Primer Grupo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {copierGroups.map((group) => (
                    <div
                      key={group.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 overflow-hidden shadow-2xs"
                    >
                      {/* Group Header Bar */}
                      <div className="p-4 bg-white dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Layers className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {group.name}
                              </h3>
                              <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-bold py-0.5">
                                MASTER: {group.master_account_name}
                              </Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {group.slaves.length} {group.slaves.length === 1 ? "Esclava" : "Esclavas"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Group Actions */}
                        <div className="flex items-center gap-2">
                          {/* Status toggle */}
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              {group.is_active && isCopierEnabled ? "Activo" : "Pausado"}
                            </span>
                            <Switch
                              checked={group.is_active && isCopierEnabled}
                              onCheckedChange={() => handleToggleGroup(group)}
                            />
                          </div>

                          {/* Instant Flatten Button */}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setFlatteningGroup(group)}
                            className="text-xs font-semibold gap-1.5 h-8 bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                          >
                            <Flame className="h-3.5 w-3.5" />
                            Aplanar Grupo
                          </Button>

                          {/* Edit Group */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingGroup(group);
                              setIsGroupModalOpen(true);
                            }}
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>

                          {/* Delete Group */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingGroupMasterId(group.master_account_id)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Slaves List Inside Group */}
                      <div className="p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200/60 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <th className="pb-2 px-3">Cuenta Esclava (Slave)</th>
                                <th className="pb-2 px-3 text-center">Multiplicador</th>
                                <th className="pb-2 px-3 text-center">Contrato</th>
                                <th className="pb-2 px-3 text-center">Límite Pérdida</th>
                                <th className="pb-2 px-3 text-right">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                              {group.slaves.map((slave) => (
                                <tr key={slave.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <ArrowRight className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                    <span>{slave.account_name}</span>
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                                    {slave.multiplier}x
                                  </td>
                                  <td className="py-2.5 px-3 text-center">
                                    {slave.convert_mini_to_micro ? (
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-[10px]">
                                        Mini → Micro
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-slate-400 text-[10px]">
                                        Directo
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                                    {slave.max_daily_loss ? `$${slave.max_daily_loss.toLocaleString()}` : "—"}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    {slave.is_active && group.is_active && isCopierEnabled ? (
                                      <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] py-0.5">
                                        Replicando
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-[10px] py-0.5">
                                        Pausada
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Botonera de Emergencia (Kill Switch Global) */}
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
                      Cierra instantáneamente todas las posiciones abiertas en todas las cuentas de todos los grupos y detiene el replicador.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setIsKillSwitchAlertOpen(true)}
                  className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6 py-5 rounded-xl shadow-md shadow-rose-600/30 gap-2 shrink-0 text-xs tracking-wide uppercase"
                >
                  <Zap className="h-4 w-4" />
                  Aplanar Todas las Cuentas
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
              {logs.length === 0 ? (
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
      )}

      {/* Modal Agregar / Editar Conexión */}
      <AddTradovateConnectionModal
        open={isAddConnectionModalOpen}
        onOpenChange={setIsAddConnectionModalOpen}
        connection={editingConnection}
        onSubmit={handleSaveConnection}
      />

      {/* Modal Grupos de Copia */}
      <CopierGroupModal
        open={isGroupModalOpen}
        onOpenChange={setIsGroupModalOpen}
        group={editingGroup}
        accounts={accounts}
        firms={firms}
        credentials={credentialsList}
        onSubmit={handleSaveGroup}
      />

      {/* Alert Delete Connection */}
      <AlertDialog
        open={!!deletingConnectionId}
        onOpenChange={(open) => !open && setDeletingConnectionId(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white text-base">
              ¿Eliminar Conexión Tradovate?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Se eliminará esta credencial de acceso a la API. Las reglas asociadas pueden dejar de funcionar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingConnectionId) {
                  handleDeleteConnection(deletingConnectionId);
                  setDeletingConnectionId(null);
                }
              }}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Eliminar Conexión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Delete Group */}
      <AlertDialog
        open={!!deletingGroupMasterId}
        onOpenChange={(open) => !open && setDeletingGroupMasterId(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white text-base">
              ¿Eliminar Grupo de Copia?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Se eliminarán las reglas de replicación para todas las cuentas esclavas asignadas a este grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingGroupMasterId) {
                  handleDeleteGroup(deletingGroupMasterId);
                  setDeletingGroupMasterId(null);
                }
              }}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              Eliminar Grupo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Flatten Group */}
      <AlertDialog
        open={!!flatteningGroup}
        onOpenChange={(open) => !open && setFlatteningGroup(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <Flame className="h-5 w-5" />
              ¿Aplanar todas las posiciones del grupo "{flatteningGroup?.name}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-1">
              <p>
                Esta acción enviará órdenes de liquidación inmediata por WebSocket para cerrar todas las posiciones abiertas en la cuenta Master y en sus {flatteningGroup?.slaves.length} cuentas esclavas asociadas.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isFlatteningExecuting}
              onClick={handleConfirmFlattenGroup}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {isFlatteningExecuting ? "Aplanando..." : "Sí, Aplanar Grupo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Global Kill Switch */}
      <AlertDialog open={isKillSwitchAlertOpen} onOpenChange={setIsKillSwitchAlertOpen}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              ¿Confirmar Kill Switch Global de Emergencia?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-1">
              <p>
                Esta acción enviará órdenes de cierre inmediato a Tradovate para aplanar todas las posiciones abiertas en todas las cuentas de todos los grupos, cancelará órdenes pendientes y pausará automáticamente la copia.
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
    </>
  );
}
