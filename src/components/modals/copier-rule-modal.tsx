"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Account, CopierRule } from "@/types/database";

interface CopierRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: CopierRule | null;
  accounts: Account[];
  onSubmit: (data: {
    master_account_id: string;
    master_account_name: string;
    slave_account_id: string;
    slave_account_name: string;
    multiplier: number;
    convert_mini_to_micro: boolean;
    max_daily_loss?: number | null;
    is_active?: boolean;
  }) => Promise<void>;
}

export function CopierRuleModal({
  open,
  onOpenChange,
  rule,
  accounts,
  onSubmit,
}: CopierRuleModalProps) {
  const [masterAccountId, setMasterAccountId] = useState(
    rule?.master_account_id || accounts[0]?.id || ""
  );
  const [slaveAccountId, setSlaveAccountId] = useState(
    rule?.slave_account_id || (accounts[1]?.id || accounts[0]?.id || "")
  );
  const [multiplier, setMultiplier] = useState(
    rule ? String(rule.multiplier) : "1"
  );
  const [convertMiniToMicro, setConvertMiniToMicro] = useState(
    rule ? rule.convert_mini_to_micro : true
  );
  const [maxDailyLoss, setMaxDailyLoss] = useState(
    rule?.max_daily_loss ? String(rule.max_daily_loss) : ""
  );
  const [isActive, setIsActive] = useState(
    rule ? rule.is_active : true
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterAccountId || !slaveAccountId) return;

    const masterAccount = accounts.find((a) => a.id === masterAccountId);
    const slaveAccount = accounts.find((a) => a.id === slaveAccountId);

    const masterName = masterAccount
      ? `${masterAccount.account_number || masterAccount.alias || masterAccount.id}`
      : masterAccountId;
    const slaveName = slaveAccount
      ? `${slaveAccount.account_number || slaveAccount.alias || slaveAccount.id}`
      : slaveAccountId;

    setIsSubmitting(true);
    try {
      await onSubmit({
        master_account_id: masterAccountId,
        master_account_name: masterName,
        slave_account_id: slaveAccountId,
        slave_account_name: slaveName,
        multiplier: parseFloat(multiplier) || 1,
        convert_mini_to_micro: convertMiniToMicro,
        max_daily_loss: maxDailyLoss ? parseFloat(maxDailyLoss) : null,
        is_active: isActive,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving rule:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
            {rule ? "Editar Regla de Copia" : "Nueva Regla de Copia"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Master Account */}
          <div className="space-y-1.5">
            <Label htmlFor="master-acc" className="text-xs font-semibold">Cuenta Master</Label>
            <select
              id="master-acc"
              value={masterAccountId}
              onChange={(e) => setMasterAccountId(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Selecciona cuenta Master</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.alias || acc.account_number || acc.id} ({acc.account_type} - ${acc.account_size})
                </option>
              ))}
            </select>
          </div>

          {/* Slave Account */}
          <div className="space-y-1.5">
            <Label htmlFor="slave-acc" className="text-xs font-semibold">Cuenta Slave</Label>
            <select
              id="slave-acc"
              value={slaveAccountId}
              onChange={(e) => setSlaveAccountId(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Selecciona cuenta Slave</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.alias || acc.account_number || acc.id} ({acc.account_type} - ${acc.account_size})
                </option>
              ))}
            </select>
          </div>

          {/* Multiplier & Max Daily Loss */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="multiplier" className="text-xs font-semibold">Multiplicador</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.1"
                min="0.1"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="1.0"
                className="h-9 text-xs"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-loss" className="text-xs font-semibold">Pérdida Máx. Diaria ($)</Label>
              <Input
                id="max-loss"
                type="number"
                step="10"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(e.target.value)}
                placeholder="Opcional (ej. 500)"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Switch Mini to Micro */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">Convertir Mini a Micro</Label>
              <p className="text-[11px] text-slate-500">Convierte automáticamente contratos NQ/ES a MNQ/MES</p>
            </div>
            <Switch
              checked={convertMiniToMicro}
              onCheckedChange={setConvertMiniToMicro}
            />
          </div>

          {/* Activo switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-slate-900 dark:text-white">Regla Activa</Label>
              <p className="text-[11px] text-slate-500">Activa o pausa esta copia de operaciones</p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
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
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Guardando..." : rule ? "Guardar Cambios" : "Crear Regla"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
