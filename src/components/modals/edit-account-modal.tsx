"use client";

import { useState, useEffect } from "react";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropFirm, Account } from "@/types/database";
import { Wallet, Loader2 } from "lucide-react";

interface EditAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  firms: PropFirm[];
  onSubmit: (
    id: string,
    accData: {
      firm_id: string;
      account_size: number;
      account_type: string;
      status: string;
      account_number?: string | null;
      alias?: string | null;
    }
  ) => Promise<void> | void;
}

export function EditAccountModal({
  open,
  onOpenChange,
  account,
  firms,
  onSubmit,
}: EditAccountModalProps) {
  const [firmId, setFirmId] = useState("");
  const [accountSize, setAccountSize] = useState("");
  const [accountType, setAccountType] = useState("Evaluation");
  const [status, setStatus] = useState("Active");
  const [accountNumber, setAccountNumber] = useState("");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setFirmId(account.firm_id);
      setAccountSize(account.account_size.toString());
      setAccountType(account.account_type);
      setStatus(account.status);
      setAccountNumber(account.account_number || "");
      setAlias(account.alias || "");
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    const size = parseFloat(accountSize);
    if (!firmId) {
      setError("Debes seleccionar una empresa de fondeo");
      return;
    }

    if (isNaN(size) || size <= 0) {
      setError("El tamaño de la cuenta debe ser un valor numérico positivo");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit(account.id, {
        firm_id: firmId,
        account_size: size,
        account_type: accountType,
        status,
        account_number: accountNumber.trim() || null,
        alias: alias.trim() || null,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating account:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Cuenta de Trading"
      description="Modifica los detalles de la cuenta de trading."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="edit-account-firm" className="text-xs font-medium">
            Empresa de Fondeo *
          </Label>
          <select
            id="edit-account-firm"
            value={firmId}
            onChange={(e) => setFirmId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {firms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-account-size" className="text-xs font-medium">
            Tamaño de Cuenta (USD) *
          </Label>
          <Input
            id="edit-account-size"
            type="number"
            placeholder="50000"
            value={accountSize}
            onChange={(e) => setAccountSize(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-account-number" className="text-xs font-medium">
              Número de Cuenta
            </Label>
            <Input
              id="edit-account-number"
              type="text"
              placeholder="ej. 123456"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-account-alias" className="text-xs font-medium">
              Alias
            </Label>
            <Input
              id="edit-account-alias"
              type="text"
              placeholder="ej. Mi Cuenta Principal"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-account-type" className="text-xs font-medium">
              Tipo de Cuenta
            </Label>
            <select
              id="edit-account-type"
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Evaluation">Evaluation</option>
              <option value="Funded">Funded</option>
              <option value="Master">Master</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-account-status" className="text-xs font-medium">
              Estado
            </Label>
            <select
              id="edit-account-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Active">Active</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button type="submit" size="sm" className="text-xs gap-1.5" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="h-3.5 w-3.5" />
            )}
            Actualizar Cuenta
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
