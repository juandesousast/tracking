"use client";

import { useState, useEffect } from "react";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropFirm, Account, Withdrawal } from "@/types/database";
import { ArrowUpRight } from "lucide-react";
import { ReceiptScanner } from "@/components/ui/receipt-scanner";
import { ScannedReceiptResult } from "@/lib/actions/scan-receipt";
import { matchAccountFromScan } from "@/lib/match-account";

interface EditWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal: Withdrawal | null;
  firms: PropFirm[];
  accounts: Account[];
  onSubmit: (
    id: string,
    withdrawal: {
      firm_id: string;
      account_id: string | null;
      gross_amount: number;
      fee_amount: number;
      status: string;
      date: string;
    }
  ) => void;
}

export function EditWithdrawalModal({
  open,
  onOpenChange,
  withdrawal,
  firms,
  accounts,
  onSubmit,
}: EditWithdrawalModalProps) {
  const [firmId, setFirmId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [grossAmount, setGrossAmount] = useState("");
  const [feeAmount, setFeeAmount] = useState("0");
  const [status, setStatus] = useState("Completed");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [ambiguityFirmName, setAmbiguityFirmName] = useState<string | null>(null);

  const filteredAccounts = accounts.filter((acc) => acc.firm_id === firmId);

  useEffect(() => {
    if (withdrawal) {
      setFirmId(withdrawal.firm_id || "");
      setAccountId(withdrawal.account_id || "");
      setGrossAmount(withdrawal.gross_amount.toString());
      setFeeAmount(withdrawal.fee_amount.toString());
      setStatus(withdrawal.status);
      setDate(withdrawal.date);
      setAmbiguityFirmName(null);
    }
  }, [withdrawal]);

  useEffect(() => {
    if (!open) {
      setAmbiguityFirmName(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawal) return;

    const gross = parseFloat(grossAmount);
    const fee = parseFloat(feeAmount) || 0;

    if (isNaN(gross) || gross <= 0) {
      setError("El monto bruto de retiro debe ser mayor a 0");
      return;
    }

    if (fee < 0) {
      setError("El fee no puede ser negativo");
      return;
    }

    if (!date) {
      setError("La fecha es requerida");
      return;
    }

    setError("");
    onSubmit(withdrawal.id, {
      firm_id: firmId,
      account_id: accountId || null,
      gross_amount: gross,
      fee_amount: fee,
      status,
      date,
    });

    setAmbiguityFirmName(null);
    onOpenChange(false);
  };

  const calculatedNet = Math.max(
    0,
    (parseFloat(grossAmount) || 0) - (parseFloat(feeAmount) || 0)
  );

  const handleScanComplete = (scannedData: ScannedReceiptResult) => {
    if (scannedData.amount) setGrossAmount(scannedData.amount.toString());
    if (scannedData.date) setDate(scannedData.date);

    const matchResult = matchAccountFromScan(
      scannedData.firm_name,
      scannedData.account_number_candidate,
      scannedData.alias_candidate,
      accounts,
      firms
    );

    if (matchResult.matchedFirmId) {
      setFirmId(matchResult.matchedFirmId);
    } else if (scannedData.firm_name) {
      const matchedFirm = firms.find(
        (f) =>
          f.name.toLowerCase().includes(scannedData.firm_name.toLowerCase()) ||
          scannedData.firm_name.toLowerCase().includes(f.name.toLowerCase())
      );
      if (matchedFirm) {
        setFirmId(matchedFirm.id);
      }
    }

    if (matchResult.matchedAccountId) {
      setAccountId(matchResult.matchedAccountId);
      setAmbiguityFirmName(null);
    } else if (matchResult.hasAmbiguity) {
      setAccountId("");
      const firmObj = firms.find((f) => f.id === matchResult.matchedFirmId);
      setAmbiguityFirmName(firmObj?.name || scannedData.firm_name || "la empresa");
    } else {
      setAmbiguityFirmName(null);
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Retiro de Ganancias"
      description="Actualiza la información de este retiro."
    >
      <ReceiptScanner onScanComplete={handleScanComplete} />
      {ambiguityFirmName && (
        <div className="mb-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
          <span className="shrink-0">💡</span>
          <span>
            Se detectaron múltiples cuentas activas en {ambiguityFirmName}. Selecciona a cuál corresponde este registro.
          </span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-w-firm" className="text-xs font-medium">
              Empresa de Fondeo
            </Label>
            <select
              id="edit-w-firm"
              value={firmId}
              onChange={(e) => {
                setFirmId(e.target.value);
                setAccountId("");
                setAmbiguityFirmName(null);
              }}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">General (Sin empresa)</option>
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-w-account" className="text-xs font-medium">
              Cuenta Asociada
            </Label>
            <select
              id="edit-w-account"
              value={accountId}
              onChange={(e) => {
                setAccountId(e.target.value);
                if (e.target.value) setAmbiguityFirmName(null);
              }}
              disabled={!firmId || filteredAccounts.length === 0}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="">Ninguna / Toda la firma</option>
              {filteredAccounts.map((acc) => {
                const firmName = firms.find((f) => f.id === acc.firm_id)?.name || "";
                const details = [
                  acc.account_number ? `#${acc.account_number}` : null,
                  acc.alias ? acc.alias : null,
                ]
                  .filter(Boolean)
                  .join(" - ");
                const extra = details ? ` (${details})` : "";
                return (
                  <option key={acc.id} value={acc.id}>
                    {firmName ? `${firmName} - ` : ""}${acc.account_size > 0 ? `$${acc.account_size.toLocaleString()}` : ""}${extra}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-w-gross" className="text-xs font-medium">
              Monto Bruto (USD) *
            </Label>
            <Input
              id="edit-w-gross"
              type="number"
              step="0.01"
              placeholder="1500.00"
              value={grossAmount}
              onChange={(e) => setGrossAmount(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-w-fee" className="text-xs font-medium">
              Fee / Comisión (USD)
            </Label>
            <Input
              id="edit-w-fee"
              type="number"
              step="0.01"
              placeholder="50.00"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {grossAmount && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs flex justify-between items-center text-emerald-600 font-medium">
            <span>Monto Neto Estimado:</span>
            <span className="font-bold">${calculatedNet.toLocaleString()} USD</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-w-status" className="text-xs font-medium">
              Estado del Retiro
            </Label>
            <select
              id="edit-w-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Completed">Completed (Completado)</option>
              <option value="Pending">Pending (Pendiente)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-w-date" className="text-xs font-medium">
              Fecha *
            </Label>
            <Input
              id="edit-w-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 text-xs"
            />
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
          <Button type="submit" size="sm" className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Actualizar Retiro
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

