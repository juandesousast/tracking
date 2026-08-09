"use client";

import { useState, useEffect } from "react";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PropFirm, Account } from "@/types/database";
import { Receipt, Plus, Building2 } from "lucide-react";
import { ReceiptScanner } from "@/components/ui/receipt-scanner";
import { ScannedReceiptResult } from "@/lib/actions/scan-receipt";
import { matchAccountFromScan } from "@/lib/match-account";
import { addFirm } from "@/lib/actions/actions";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  firms: PropFirm[];
  accounts: Account[];
  onFirmAdded?: (firm: PropFirm) => void;
  onQuickCreateAccount?: (firm: PropFirm) => void;
  onSubmit: (expense: {
    firm_id: string | null;
    account_id: string | null;
    amount: number;
    category: string;
    description: string | null;
    date: string;
  }) => void;
}

export function AddExpenseModal({
  open,
  onOpenChange,
  firms,
  accounts,
  onFirmAdded,
  onQuickCreateAccount,
  onSubmit,
}: AddExpenseModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [firmId, setFirmId] = useState(firms[0]?.id || "");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Challenge Fee");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [ambiguityFirmName, setAmbiguityFirmName] = useState<string | null>(null);
  const [scannedNewFirmName, setScannedNewFirmName] = useState<string | null>(null);
  const [isCreatingFirm, setIsCreatingFirm] = useState(false);

  // Update filtered accounts when firmId changes
  const filteredAccounts = accounts.filter((acc) => acc.firm_id === firmId);

  useEffect(() => {
    if (firms.length > 0 && !firmId) {
      setFirmId(firms[0].id);
    }
  }, [firms, firmId]);

  useEffect(() => {
    if (!open) {
      setAmbiguityFirmName(null);
      setScannedNewFirmName(null);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("El monto debe ser un número positivo");
      return;
    }

    if (!date) {
      setError("La fecha es requerida");
      return;
    }

    setError("");
    onSubmit({
      firm_id: firmId || null,
      account_id: accountId || null,
      amount: parsedAmount,
      category,
      description: description.trim() ? description.trim() : null,
      date,
    });

    setAmount("");
    setDescription("");
    setAmbiguityFirmName(null);
    setScannedNewFirmName(null);
    onOpenChange(false);
  };

  const handleAutoCreateFirm = async (firmName: string) => {
    setIsCreatingFirm(true);
    try {
      const created = await addFirm({ name: firmName, website: null });
      if (onFirmAdded) onFirmAdded(created);
      setFirmId(created.id);
      setScannedNewFirmName(null);
    } catch (err: any) {
      console.error("Error auto-creating firm:", err);
      setError(err?.message || "Error al crear automáticamente la empresa");
    } finally {
      setIsCreatingFirm(false);
    }
  };

  const handleScanComplete = (scannedData: ScannedReceiptResult) => {
    setScannedNewFirmName(null);
    setAmbiguityFirmName(null);

    if (scannedData.amount) setAmount(scannedData.amount.toString());
    if (scannedData.date) setDate(scannedData.date);
    if (scannedData.description) setDescription(scannedData.description);
    if (scannedData.category) {
      const matchCat = ["Challenge Fee", "Reset", "Activation", "Otro"].find(
        (c) => c.toLowerCase() === scannedData.category.toLowerCase()
      );
      setCategory(matchCat || scannedData.category || "Challenge Fee");
    }

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
      } else {
        // Firm does not exist -> propose auto-provisioning!
        setScannedNewFirmName(scannedData.firm_name);
      }
    }

    if (matchResult.matchedAccountId) {
      setAccountId(matchResult.matchedAccountId);
      setAmbiguityFirmName(null);
    } else if (matchResult.hasAmbiguity) {
      setAccountId("");
      const firmObj = firms.find((f) => f.id === matchResult.matchedFirmId);
      setAmbiguityFirmName(firmObj?.name || scannedData.firm_name || "la empresa");
    }
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar Gasto / Fee"
      description="Ingresa un nuevo pago de evaluación, reset o comisión."
    >
      <ReceiptScanner onScanComplete={handleScanComplete} />

      {scannedNewFirmName && (
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-blue-600" />
            <span>
              Se detectó la nueva firma <strong>"{scannedNewFirmName}"</strong>. ¿Deseas registrarla?
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={isCreatingFirm}
            onClick={() => handleAutoCreateFirm(scannedNewFirmName)}
            className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white shrink-0"
          >
            {isCreatingFirm ? "Creando..." : `+ Crear "${scannedNewFirmName}"`}
          </Button>
        </div>
      )}

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
            <Label htmlFor="expense-firm" className="text-xs font-medium">
              Empresa de Fondeo
            </Label>
            <select
              id="expense-firm"
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
            <Label htmlFor="expense-account" className="text-xs font-medium">
              Cuenta Asociada
            </Label>
            <select
              id="expense-account"
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
            {firmId && filteredAccounts.length === 0 && onQuickCreateAccount && (
              <div className="pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const firmObj = firms.find((f) => f.id === firmId);
                    if (firmObj) onQuickCreateAccount(firmObj);
                  }}
                  className="h-7 text-[11px] px-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1 font-medium"
                >
                  <Plus className="h-3 w-3" />
                  + Crear cuenta para {firms.find((f) => f.id === firmId)?.name || "Firma"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="expense-amount" className="text-xs font-medium">
              Monto (USD) *
            </Label>
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              placeholder="150.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="expense-category" className="text-xs font-medium">
              Categoría
            </Label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="Challenge Fee">Challenge Fee</option>
              <option value="Reset">Reset</option>
              <option value="Activation">Activation</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expense-date" className="text-xs font-medium">
            Fecha *
          </Label>
          <Input
            id="expense-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="expense-desc" className="text-xs font-medium">
            Descripción / Notas (Opcional)
          </Label>
          <Input
            id="expense-desc"
            placeholder="ej. Pase de fase 1 descuento 10%"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-9 text-xs"
          />
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
          <Button type="submit" size="sm" className="text-xs gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
            <Receipt className="h-3.5 w-3.5" />
            Guardar Gasto
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}

