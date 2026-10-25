"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Copy,
  Layers,
  ArrowRight,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { Account, CopierGroup, PropFirm, TradovateCredential } from "@/types/database";

interface CopierGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: CopierGroup | null;
  accounts: Account[];
  firms?: PropFirm[];
  credentials?: TradovateCredential[];
  onSubmit: (data: {
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
  }) => Promise<void>;
}

interface SlaveRow {
  id?: string;
  account_id: string;
  multiplier: number;
  convert_mini_to_micro: boolean;
  max_daily_loss: string;
  is_active: boolean;
}

export function CopierGroupModal({
  open,
  onOpenChange,
  group,
  accounts,
  firms = [],
  onSubmit,
}: CopierGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [masterAccountId, setMasterAccountId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [slaves, setSlaves] = useState<SlaveRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firmMap = new Map<string, string>();
  firms.forEach((f) => firmMap.set(f.id, f.name));

  const getAccountDisplayName = (acc: Account) => {
    const firmName = firmMap.get(acc.firm_id) || "Firma";
    const accIdentifier = acc.account_number || acc.alias || acc.id;
    return `${firmName} • #${accIdentifier} ($${acc.account_size.toLocaleString()})`;
  };

  useEffect(() => {
    if (open) {
      setError(null);
      if (group) {
        setGroupName(group.name);
        setMasterAccountId(group.master_account_id);
        setIsActive(group.is_active);
        setSlaves(
          group.slaves.map((s) => ({
            id: s.id,
            account_id: s.account_id,
            multiplier: s.multiplier || 1,
            convert_mini_to_micro: s.convert_mini_to_micro ?? true,
            max_daily_loss: s.max_daily_loss ? String(s.max_daily_loss) : "",
            is_active: s.is_active ?? true,
          }))
        );
      } else {
        const defaultMaster = accounts[0]?.id || "";
        const defaultSlave = accounts[1]?.id || "";
        setGroupName(`Grupo de Réplica #${Math.floor(100 + Math.random() * 900)}`);
        setMasterAccountId(defaultMaster);
        setIsActive(true);
        setSlaves(
          defaultSlave
            ? [
                {
                  account_id: defaultSlave,
                  multiplier: 1,
                  convert_mini_to_micro: true,
                  max_daily_loss: "",
                  is_active: true,
                },
              ]
            : []
        );
      }
    }
  }, [open, group, accounts]);

  const handleAddSlave = () => {
    const usedIds = new Set([masterAccountId, ...slaves.map((s) => s.account_id)]);
    const available = accounts.find((a) => !usedIds.has(a.id)) || accounts[0];
    if (available) {
      setSlaves((prev) => [
        ...prev,
        {
          account_id: available.id,
          multiplier: 1,
          convert_mini_to_micro: true,
          max_daily_loss: "",
          is_active: true,
        },
      ]);
    }
  };

  const handleRemoveSlave = (index: number) => {
    setSlaves((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSlave = (index: number, patch: Partial<SlaveRow>) => {
    setSlaves((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!groupName.trim()) {
      setError("Por favor ingresa un nombre para el grupo de copia.");
      return;
    }

    if (!masterAccountId) {
      setError("Por favor selecciona una cuenta Master.");
      return;
    }

    if (slaves.length === 0) {
      setError("Debes añadir al menos una cuenta esclava (Slave) al grupo.");
      return;
    }

    // Check for duplicate accounts in slaves or matching master
    const duplicateMaster = slaves.some((s) => s.account_id === masterAccountId);
    if (duplicateMaster) {
      setError("Una cuenta esclava no puede ser la misma que la cuenta Master.");
      return;
    }

    const slaveIds = slaves.map((s) => s.account_id);
    const hasDuplicateSlaves = new Set(slaveIds).size !== slaveIds.length;
    if (hasDuplicateSlaves) {
      setError("No puedes repetir la misma cuenta esclava dentro del mismo grupo.");
      return;
    }

    const masterAccountObj = accounts.find((a) => a.id === masterAccountId);
    const masterDisplayName = masterAccountObj
      ? getAccountDisplayName(masterAccountObj)
      : masterAccountId;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: groupName.trim(),
        master_account_id: masterAccountId,
        master_account_name: masterDisplayName,
        is_active: isActive,
        slaves: slaves.map((s) => {
          const accObj = accounts.find((a) => a.id === s.account_id);
          const slaveDisplayName = accObj
            ? getAccountDisplayName(accObj)
            : s.account_id;
          return {
            id: s.id,
            account_id: s.account_id,
            account_name: slaveDisplayName,
            multiplier: Number(s.multiplier) || 1,
            convert_mini_to_micro: s.convert_mini_to_micro,
            max_daily_loss: s.max_daily_loss ? parseFloat(s.max_daily_loss) : null,
            is_active: s.is_active,
          };
        }),
      });
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error saving copier group:", err);
      setError(err?.message || "Ocurrió un error al guardar el grupo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                {group ? "Editar Grupo de Copia" : "Crear Grupo de Copia de Futuros"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Define una cuenta Master y múltiples cuentas Esclavas con multiplicadores individuales.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Group Name & Master Account Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nombre del Grupo</Label>
              <Input
                type="text"
                placeholder="ej. Grupo Apex 50k NQ"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Cuenta Master</Label>
                <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] py-0 px-1.5 font-bold">
                  MASTER
                </Badge>
              </div>
              <select
                value={masterAccountId}
                onChange={(e) => setMasterAccountId(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 font-sans"
                required
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {getAccountDisplayName(acc)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Slaves List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Cuentas Esclavas (Slaves) ({slaves.length})
                </h4>
                <p className="text-[11px] text-slate-500">
                  Estas cuentas replicarán automáticamente cada orden de la cuenta Master.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSlave}
                className="text-xs gap-1.5 font-semibold h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir Esclava
              </Button>
            </div>

            {slaves.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                <p className="text-xs text-slate-500">No hay cuentas esclavas configuradas.</p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleAddSlave}
                  className="text-xs text-blue-600"
                >
                  Haz clic para añadir la primera
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {slaves.map((slave, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex-1 w-full sm:w-auto">
                      <Label className="text-[11px] text-slate-500 mb-1 block">
                        Cuenta Esclava #{idx + 1}
                      </Label>
                      <select
                        value={slave.account_id}
                        onChange={(e) =>
                          handleUpdateSlave(idx, { account_id: e.target.value })
                        }
                        className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {accounts
                          .filter((a) => a.id !== masterAccountId)
                          .map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {getAccountDisplayName(acc)}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Multiplier */}
                    <div className="w-24 shrink-0">
                      <Label className="text-[11px] text-slate-500 mb-1 block">
                        Multiplicador
                      </Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="20"
                          value={slave.multiplier}
                          onChange={(e) =>
                            handleUpdateSlave(idx, {
                              multiplier: parseFloat(e.target.value) || 1,
                            })
                          }
                          className="h-8 text-xs font-mono pr-5"
                          required
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-bold">
                          x
                        </span>
                      </div>
                    </div>

                    {/* Mini -> Micro Switch */}
                    <div className="flex flex-col items-center shrink-0">
                      <Label className="text-[10px] text-slate-500 mb-1">
                        Mini → Micro
                      </Label>
                      <Switch
                        checked={slave.convert_mini_to_micro}
                        onCheckedChange={(val) =>
                          handleUpdateSlave(idx, { convert_mini_to_micro: val })
                        }
                      />
                    </div>

                    {/* Max Daily Loss */}
                    <div className="w-28 shrink-0">
                      <Label className="text-[11px] text-slate-500 mb-1 block">
                        Límite Pérdida ($)
                      </Label>
                      <Input
                        type="number"
                        placeholder="Opcional"
                        value={slave.max_daily_loss}
                        onChange={(e) =>
                          handleUpdateSlave(idx, {
                            max_daily_loss: e.target.value,
                          })
                        }
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="pt-4 sm:pt-0 shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSlave(idx)}
                        className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group Active Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Activar Grupo Inmediatamente
              </span>
              <span className="text-[11px] text-slate-500">
                Las órdenes de la cuenta Master se replicarán a todas las esclavas activas.
              </span>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Guardando Grupo...</span>
                </>
              ) : group ? (
                "Guardar Cambios del Grupo"
              ) : (
                "Crear Grupo de Copia"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
